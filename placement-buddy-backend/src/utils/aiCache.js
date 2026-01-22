/**
 * AI Response Cache
 * Reduces duplicate API calls by caching responses in Redis
 */

const crypto = require('crypto');
const redisConnection = require('../config/redis');
const logger = require('./logger');

class AICache {
    constructor(prefix, ttlSeconds) {
        this.prefix = prefix;
        this.ttl = ttlSeconds;
        this.redis = redisConnection;
    }

    /**
     * Generate cache key from parameters
     */
    generateKey(params) {
        const hash = crypto
            .createHash('md5')
            .update(JSON.stringify(params))
            .digest('hex');
        return `${this.prefix}:${hash}`;
    }

    /**
     * Get cached response
     */
    async get(params) {
        try {
            const key = this.generateKey(params);
            const cached = await this.redis.get(key);

            if (cached) {
                logger.info(`✅ Cache HIT for ${this.prefix}`);
                return JSON.parse(cached);
            }

            logger.info(`❌ Cache MISS for ${this.prefix}`);
            return null;
        } catch (error) {
            logger.error(`Cache get error:`, error);
            return null;
        }
    }

    /**
     * Set cached response
     */
    async set(params, response) {
        try {
            const key = this.generateKey(params);
            await this.redis.setex(key, this.ttl, JSON.stringify(response));
            logger.info(`💾 Cached response for ${this.prefix} (TTL: ${this.ttl}s)`);
        } catch (error) {
            logger.error(`Cache set error:`, error);
        }
    }

    /**
     * Clear all cache for this prefix
     */
    async clear() {
        try {
            const keys = await this.redis.keys(`${this.prefix}:*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                logger.info(`🗑️ Cleared ${keys.length} cache entries for ${this.prefix}`);
            }
        } catch (error) {
            logger.error(`Cache clear error:`, error);
        }
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        try {
            const keys = await this.redis.keys(`${this.prefix}:*`);
            return {
                prefix: this.prefix,
                entries: keys.length,
                ttl: this.ttl
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Create caches for different AI operations
const questionCache = new AICache('ai:question', 86400); // 24 hours
const evaluationCache = new AICache('ai:evaluation', 3600); // 1 hour
const hrQuestionCache = new AICache('ai:hr-question', 86400); // 24 hours

module.exports = {
    AICache,
    questionCache,
    evaluationCache,
    hrQuestionCache
};
