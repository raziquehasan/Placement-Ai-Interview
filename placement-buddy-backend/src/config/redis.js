const Redis = require('ioredis');
const config = require('./config');
const logger = require('../utils/logger');

/**
 * Get Redis Options for a specific type
 */
const getOptions = (type = 'local') => {
    const baseOptions = {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    };

    if (type === 'cloud' && config.redisUrl) {
        return {
            ...baseOptions,
            tls: config.redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
        };
    }

    return {
        ...baseOptions,
        host: config.redisHost || 'localhost',
        port: config.redisPort || 6379,
        password: config.redisPassword || undefined,
    };
};

/**
 * Adaptive Redis Connection
 * Attempts Cloud first, falls back to Local if quota exceeded or offline
 */
let redisConnection;

const initConnection = () => {
    if (config.redisUrl) {
        logger.info('🛰️ Attempting Cloud Redis connection...');
        const cloudConn = new Redis(config.redisUrl, getOptions('cloud'));

        // Handle errors and potential fallback
        cloudConn.on('error', (err) => {
            const isQuotaError = err.message.includes('max requests limit exceeded');
            const isDnsError = err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN';

            if (isQuotaError || isDnsError) {
                logger.error(`🚨 Cloud Redis Issue: ${isQuotaError ? 'Quota Exceeded' : 'DNS/Network Problem'}`);
                if (!redisConnection.isFallingBack) {
                    switchToLocal();
                }
            } else {
                logger.error('❌ Cloud Redis Error:', err.message);
            }
        });

        cloudConn.on('connect', () => logger.info('✅ Cloud Redis connected'));
        cloudConn.on('ready', () => logger.info('🔗 Cloud Redis ready'));

        redisConnection = cloudConn;
    } else {
        switchToLocal(true);
    }
};

const switchToLocal = (silent = false) => {
    if (!silent) logger.warn('🔄 Falling back to LOCAL Redis...');

    // If we're already local, don't do anything
    if (redisConnection && redisConnection.options.host === (config.redisHost || 'localhost')) return;

    const oldConn = redisConnection;
    const localConn = new Redis(getOptions('local'));

    localConn.isFallingBack = true;
    localConn.on('connect', () => logger.info('✅ Local Redis connected'));
    localConn.on('error', (err) => logger.error('❌ Local Redis Error:', err.message));

    // Swap the global instance and close the old one if it exists
    redisConnection = localConn;
    if (oldConn) oldConn.disconnect();
};

initConnection();

module.exports = redisConnection;
