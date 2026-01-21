/**
 * Interview Queue - Phase 2.1
 * Background job queue for AI interview processing
 */

const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const logger = require('../utils/logger');

// Create Interview Queue
const interviewQueue = new Queue('interview-processing', {
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

// Event listeners for monitoring
interviewQueue.on('error', (err) => {
    logger.error('❌ Interview Queue Error:', err);
});

logger.info('📋 Interview Queue initialized');

module.exports = interviewQueue;
