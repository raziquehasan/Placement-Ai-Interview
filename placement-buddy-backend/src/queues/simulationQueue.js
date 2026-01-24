const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

const simulationQueue = new Queue('simulation-processing', {
    connection: redisConnection
});

module.exports = simulationQueue;
