/**
 * Feedback Processor
 * Worker for processing AI feedback generation jobs
 */

const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const feedbackService = require('../../services/feedbackService');
const logger = require('../../utils/logger');

// Feedback processing worker
const feedbackWorker = new Worker(
    'feedback-generation',
    async (job) => {
        const { interviewId, userId } = job.data;

        try {
            logger.info(`Processing feedback job ${job.id} for interview ${interviewId}`);

            // Generate feedback (AI operation)
            const feedback = await feedbackService.generateFeedback(interviewId, userId);

            logger.info(`Feedback job ${job.id} completed successfully`);

            return {
                success: true,
                feedbackId: feedback._id,
                message: 'Feedback generated successfully'
            };

        } catch (error) {
            logger.error(`Feedback job ${job.id} failed:`, error);
            throw error; // Will trigger retry
        }
    },
    {
        connection: redisConnection,
        concurrency: 3, // Process 3 feedback jobs concurrently
        limiter: {
            max: 5, // Max 5 jobs
            duration: 1000 // per second
        }
    }
);

// Worker event listeners
feedbackWorker.on('completed', (job) => {
    logger.info(`✅ Feedback job ${job.id} completed`);
});

feedbackWorker.on('failed', (job, err) => {
    logger.error(`❌ Feedback job ${job.id} failed:`, err.message);
});

feedbackWorker.on('error', (err) => {
    logger.error('Feedback Worker Error:', err);
});

logger.info('👷 Feedback Worker started');

module.exports = feedbackWorker;
