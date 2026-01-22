/**
 * Admin Controller - API Usage Monitoring
 * Provides endpoints to monitor AI API usage and quota status
 */

const { geminiLimiter, openaiLimiter } = require('../utils/rateLimiter');
const { questionCache, evaluationCache, hrQuestionCache } = require('../utils/aiCache');
const { successResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Get API Usage Statistics
 * GET /api/v1/admin/api-usage
 */
const getAPIUsage = async (req, res, next) => {
    try {
        // Get rate limiter stats
        const geminiStats = await geminiLimiter.getStats();
        const openaiStats = await openaiLimiter.getStats();

        // Get cache stats
        const questionCacheStats = await questionCache.getStats();
        const evaluationCacheStats = await evaluationCache.getStats();
        const hrQuestionCacheStats = await hrQuestionCache.getStats();

        const stats = {
            rateLimits: {
                gemini: geminiStats,
                openai: openaiStats
            },
            caches: {
                questions: questionCacheStats,
                evaluations: evaluationCacheStats,
                hrQuestions: hrQuestionCacheStats
            },
            timestamp: new Date()
        };

        logger.info('📊 API usage stats retrieved');

        return successResponse(res, 200, 'API usage statistics', stats);

    } catch (error) {
        next(error);
    }
};

/**
 * Clear All Caches
 * POST /api/v1/admin/clear-cache
 */
const clearCaches = async (req, res, next) => {
    try {
        await Promise.all([
            questionCache.clear(),
            evaluationCache.clear(),
            hrQuestionCache.clear()
        ]);

        logger.info('🗑️ All AI caches cleared');

        return successResponse(res, 200, 'All caches cleared successfully');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAPIUsage,
    clearCaches
};
