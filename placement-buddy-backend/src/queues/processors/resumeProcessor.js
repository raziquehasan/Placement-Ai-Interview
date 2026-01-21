/**
 * Resume Processor
 * Worker for processing resume parsing jobs
 */

const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const resumeService = require('../../services/resumeService');
const Resume = require('../../models/Resume');
const logger = require('../../utils/logger');

// Resume processing worker
const resumeWorker = new Worker(
    'resume-parsing',
    async (job) => {
        const { file, userId, resumeId } = job.data;

        try {
            logger.info(`Processing resume job ${job.id} for user ${userId}, resumeId: ${resumeId}`);

            // Parse resume (this is the heavy operation)
            const resume = await resumeService.parseResume(file, userId, resumeId);

            logger.info(`Resume job ${job.id} completed successfully`);

            return {
                success: true,
                resumeId: resume._id,
                message: 'Resume parsed successfully'
            };

        } catch (error) {
            logger.error(`Resume job ${job.id} failed:`, error);
            throw error; // Will trigger retry
        }
    },
    {
        connection: redisConnection,
        concurrency: 1, // Process 1 resume at a time to stay within free tier limits
        limiter: {
            max: 5, // Max 5 jobs
            duration: 60000 // per minute (safe for Gemini 15 RPM limit)
        }
    }
);

// Worker event listeners
resumeWorker.on('completed', (job) => {
    logger.info(`✅ Resume job ${job.id} completed`);
});

resumeWorker.on('failed', (job, err) => {
    logger.error(`❌ Resume job ${job.id} failed:`, err.message);
});

resumeWorker.on('error', (err) => {
    logger.error('Resume Worker Error:', err);
});

logger.info('👷 Resume Worker started');

module.exports = resumeWorker;
