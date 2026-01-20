/**
 * Redis Configuration
 * Connection setup for BullMQ job queues
 * Supports both local Redis and Upstash (cloud Redis with TLS)
 */

const Redis = require('ioredis');
const config = require('./config');
const logger = require('../utils/logger');

// Parse Redis URL if provided (for Upstash or other cloud Redis)
let redisOptions;

if (config.redisUrl) {
    // Use Redis URL (supports rediss:// for TLS)
    redisOptions = {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        // TLS configuration for Upstash
        tls: config.redisUrl.startsWith('rediss://') ? {
            rejectUnauthorized: false // Required for Upstash
        } : undefined
    };
} else {
    // Use individual Redis config (for local Redis)
    redisOptions = {
        host: config.redisHost || 'localhost',
        port: config.redisPort || 6379,
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    };

    // Add password if provided
    if (config.redisPassword) {
        redisOptions.password = config.redisPassword;
    }
}

// Create Redis connection
const redisConnection = config.redisUrl
    ? new Redis(config.redisUrl, redisOptions)
    : new Redis(redisOptions);

// Connection event handlers
redisConnection.on('connect', () => {
    logger.info('✅ Redis connected successfully');
});

redisConnection.on('error', (err) => {
    logger.error('❌ Redis connection error:', err);
});

redisConnection.on('ready', () => {
    logger.info('🔗 Redis ready for operations');
});

redisConnection.on('close', () => {
    logger.warn('🔌 Redis connection closed');
});

module.exports = redisConnection;
