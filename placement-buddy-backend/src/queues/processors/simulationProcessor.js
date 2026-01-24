const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const SimulationSession = require('../../models/SimulationSession');
const AuditLog = require('../../models/SimulationAuditLog');
const logger = require('../../utils/logger');

const videoAnalysis = require('../../services/videoAnalysis');

const simulationWorker = new Worker(
    'simulation-processing',
    async (job) => {
        const { sessionId, type, userId, details } = job.data;

        try {
            logger.info(`Processing simulation job ${job.id} for session ${sessionId} [Type: ${type}]`);

            if (type === 'OA_EVALUATION_COMPLETE') {
                await AuditLog.create({
                    sessionId,
                    userId,
                    action: 'METRICS_UPDATED',
                    details: { ...details, source: 'Background Worker' }
                });
            }

            if (type === 'VIDEO_ANALYSIS_REQUEST') {
                const { videoUrl, roundIndex } = details;

                // 1. Call Analysis Service
                const analysisResult = await videoAnalysis.analyzeSessionVideo(sessionId, videoUrl);

                // 2. Update Session Metrics
                const session = await SimulationSession.findById(sessionId);
                if (session && session.rounds[roundIndex]) {
                    session.rounds[roundIndex].metrics.set('videoBehavioral', analysisResult);
                    await session.save();
                }

                // 3. Audit Log
                await AuditLog.create({
                    sessionId,
                    userId,
                    action: 'METRICS_UPDATED',
                    details: { type: 'VIDEO_BEHAVIORAL', analysisResult }
                });
            }

            return { success: true };
        } catch (error) {
            logger.error(`Simulation job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 5
    }
);

simulationWorker.on('completed', (job) => logger.info(`✅ Simulation job ${job.id} completed`));
simulationWorker.on('failed', (job, err) => logger.error(`❌ Simulation job ${job.id} failed:`, err.message));

module.exports = simulationWorker;
