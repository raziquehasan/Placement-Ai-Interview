/**
 * Admin Controller - API Usage Monitoring
 * Provides endpoints to monitor AI API usage and quota status
 */

const { geminiLimiter, openaiLimiter } = require('../utils/rateLimiter');
const { questionCache, evaluationCache, hrQuestionCache } = require('../utils/aiCache');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const Interview = require('../models/Interview');
const TechnicalRound = require('../models/TechnicalRound');
const HRRound = require('../models/HRRound');
const { interviewQueue } = require('../queues/interviewQueue');

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

/**
 * Trigger Pending Evaluations for an Interview
 * POST /api/v1/admin/trigger-evaluations/:interviewId
 */
const triggerPendingEvaluations = async (req, res, next) => {
    try {
        const { interviewId } = req.params;

        const interview = await Interview.findById(interviewId)
            .populate('technicalRound')
            .populate('hrRound');

        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        let triggeredCount = 0;
        const results = {
            technical: { pending: 0, triggered: 0 },
            hr: { pending: 0, triggered: 0 }
        };

        // Check technical round for pending evaluations
        if (interview.technicalRound) {
            const techRound = interview.technicalRound;
            for (const question of techRound.questions) {
                if (question.userAnswer && (!question.aiEvaluation || !question.aiEvaluation.evaluatedAt)) {
                    results.technical.pending++;
                    try {
                        await interviewQueue.add('evaluate-answer', {
                            roundId: techRound._id,
                            questionId: question.questionId
                        }, {
                            attempts: 3,
                            backoff: { type: 'exponential', delay: 5000 }
                        });
                        results.technical.triggered++;
                        triggeredCount++;
                    } catch (err) {
                        logger.error(`Failed to queue technical evaluation: ${err.message}`);
                    }
                }
            }
        }

        // Check HR round for pending evaluations
        if (interview.hrRound) {
            const hrRound = interview.hrRound;
            for (const question of hrRound.questions) {
                if (question.userAnswer && (!question.aiEvaluation || !question.aiEvaluation.evaluatedAt)) {
                    results.hr.pending++;
                    try {
                        await interviewQueue.add('evaluate-hr-answer', {
                            roundId: hrRound._id,
                            questionId: question.questionId
                        }, {
                            attempts: 3,
                            backoff: { type: 'exponential', delay: 5000 }
                        });
                        results.hr.triggered++;
                        triggeredCount++;
                    } catch (err) {
                        logger.error(`Failed to queue HR evaluation: ${err.message}`);
                    }
                }
            }
        }

        logger.info(`✅ Triggered ${triggeredCount} pending evaluations for interview ${interviewId}`);

        return successResponse(res, 200, `Triggered ${triggeredCount} pending evaluations`, results);

    } catch (error) {
        logger.error('❌ Error triggering evaluations:', error);
        next(error);
    }
};

module.exports = {
    getAPIUsage,
    clearCaches,
    triggerPendingEvaluations
};
