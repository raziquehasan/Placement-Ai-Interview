/**
 * Rate Limiter - Token Bucket Algorithm
 * Prevents API quota exhaustion by limiting request frequency
 */

const redisConnection = require('../config/redis');
const logger = require('./logger');

class RateLimiter {
    constructor(name, maxRequests, windowMs) {
        this.name = name;
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.redis = redisConnection;
    }

    /**
     * Check if request is allowed
     * @returns {Promise<{allowed: boolean, retryAfter?: number}>}
     */
    async checkLimit() {
        const key = `ratelimit:${this.name}`;
        const now = Date.now();
        const windowStart = now - this.windowMs;

        try {
            // Remove old entries outside the time window
            await this.redis.zremrangebyscore(key, 0, windowStart);

            // Count requests in current window
            const requestCount = await this.redis.zcard(key);

            if (requestCount >= this.maxRequests) {
                // Get oldest request timestamp to calculate retry-after
                const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
                const retryAfter = oldestRequest.length > 0
                    ? Math.ceil((parseInt(oldestRequest[1]) + this.windowMs - now) / 1000)
                    : Math.ceil(this.windowMs / 1000);

                logger.warn(`⚠️ Rate limit exceeded for ${this.name}. Retry after ${retryAfter}s`);

                return {
                    allowed: false,
                    retryAfter
                };
            }

            // Add current request
            await this.redis.zadd(key, now, `${now}-${Math.random()}`);
            await this.redis.expire(key, Math.ceil(this.windowMs / 1000));

            return { allowed: true };

        } catch (error) {
            logger.error(`❌ Rate limiter error for ${this.name}:`, error);
            // Fail open - allow request if Redis fails
            return { allowed: true };
        }
    }

    /**
     * Wait until rate limit allows request
     */
    async waitForSlot() {
        while (true) {
            const result = await this.checkLimit();
            if (result.allowed) {
                return;
            }

            // Wait for retry period
            const waitMs = (result.retryAfter || 1) * 1000;
            logger.info(`⏳ Waiting ${result.retryAfter}s for ${this.name} rate limit...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }

    /**
     * Get current usage stats
     */
    async getStats() {
        const key = `ratelimit:${this.name}`;
        const now = Date.now();
        const windowStart = now - this.windowMs;

        try {
            await this.redis.zremrangebyscore(key, 0, windowStart);
            const count = await this.redis.zcard(key);

            return {
                current: count,
                max: this.maxRequests,
                window: `${this.windowMs / 1000}s`,
                utilization: ((count / this.maxRequests) * 100).toFixed(1) + '%'
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Create rate limiters for each AI provider
const geminiLimiter = new RateLimiter('gemini', 15, 60000); // 15 req/min
const openaiLimiter = new RateLimiter('openai', 3, 60000);  // 3 req/min

module.exports = {
    RateLimiter,
    geminiLimiter,
    openaiLimiter
};
