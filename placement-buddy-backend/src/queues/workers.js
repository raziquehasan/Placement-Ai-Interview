/**
 * Worker Starter
 * Initializes all background job workers
 */

const logger = require('../utils/logger');

// Import workers
const resumeWorker = require('./processors/resumeProcessor');
const feedbackWorker = require('./processors/feedbackProcessor');

logger.info('🚀 All workers initialized and ready');

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Closing workers...');
    await resumeWorker.close();
    await feedbackWorker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Closing workers...');
    await resumeWorker.close();
    await feedbackWorker.close();
    process.exit(0);
});

module.exports = {
    resumeWorker,
    feedbackWorker
};
