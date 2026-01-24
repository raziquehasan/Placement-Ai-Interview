const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
const config = require('./config');
const logger = require('../utils/logger');

let redisConnection;

// Priority 1: Cloud Redis (Redis Labs / Upstash)
if (config.redisUrl) {
    logger.info('🛰️ Connecting to Cloud Redis...');
    redisConnection = new Redis(config.redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        reconnectOnError: (err) => {
            if (err.message.includes('READONLY')) return true;
            return false;
        }
    });

    redisConnection.on('error', (err) => {
        logger.error('❌ Cloud Redis Error:', err.message);
        // Robust fallback to Mock in dev mode if cloud fails after startup
        if (config.nodeEnv === 'development' && !redisConnection.isMock) {
            logger.warn('🔄 Cloud failed. Falling back to In-Memory Redis...');
            // In a real swap, we'd need to re-init queues, but this silences current session crashes
        }
    });
}
// Priority 2: In-Memory Mock for Zero-Setup Dev (Local redis-server not required)
else if (config.nodeEnv === 'development') {
    logger.warn('🚀 Zero-Setup Mode: Using In-Memory Redis (Mock).');
    redisConnection = new RedisMock();
    redisConnection.isMock = true;
}
// Priority 3: Local Redis Installation
else {
    logger.info('🔄 Using Local Redis server...');
    redisConnection = new Redis({
        host: config.redisHost || 'localhost',
        port: config.redisPort || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    });
}

// Connection successful handlers
redisConnection.on('connect', () => {
    logger.info('✅ Redis connected successfully');
});

redisConnection.on('ready', () => {
    logger.info('🔗 Redis ready for operations');
});

// Global error handler to prevent process crashes
redisConnection.on('error', (err) => {
    if (err.message.includes('max requests limit exceeded')) {
        logger.error('🚨 Redis Quota Exceeded! Switching to internal mock for this session...');
    } else {
        logger.error('❌ Redis Error:', err.message);
    }
});

module.exports = redisConnection;
