/**
 * Feedback Generation Queue
 * BullMQ queue for async AI feedback generation
 */

const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const logger = require('../utils/logger');

// Create feedback queue
const feedbackQueue = new Queue('feedback-generation', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000
        },
        removeOnFail: {
            age: 7 * 24 * 3600 // Keep failed jobs for 7 days
        }
    }
});

// Queue event listeners
feedbackQueue.on('error', (err) => {
    logger.error('Feedback Queue Error:', err);
});

logger.info('📋 Feedback Queue initialized');

module.exports = feedbackQueue;
