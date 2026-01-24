/**
 * Worker Starter
 * Initializes all background job workers
 */

const logger = require('../utils/logger');

// Import workers
const resumeWorker = require('./processors/resumeProcessor');
const feedbackWorker = require('./processors/feedbackProcessor');
const interviewWorker = require('./processors/interviewProcessor'); // Phase 2.1
const simulationWorker = require('./processors/simulationProcessor'); // Phase 2.2

logger.info('🚀 All workers initialized and ready');

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Closing workers...');
    await resumeWorker.close();
    await feedbackWorker.close();
    await interviewWorker.close();
    await simulationWorker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Closing workers...');
    await resumeWorker.close();
    await feedbackWorker.close();
    await interviewWorker.close();
    await simulationWorker.close();
    process.exit(0);
});

module.exports = {
    resumeWorker,
    feedbackWorker,
    interviewWorker,
    simulationWorker
};
