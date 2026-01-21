/**
 * Resume Processing Queue
 * BullMQ queue for async resume parsing
 */

const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const logger = require('../utils/logger');

// Create resume queue
const resumeQueue = new Queue('resume-parsing', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 60000 // 1 minute backoff on failure
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
resumeQueue.on('error', (err) => {
    logger.error('Resume Queue Error:', err);
});

logger.info('📋 Resume Queue initialized');

module.exports = resumeQueue;
