/**
 * Feedback Controller (with Background Jobs)
 * Handles feedback generation and retrieval with async processing
 */

const feedbackService = require('../services/feedbackService');
const feedbackQueue = require('../queues/feedbackQueue');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Generate feedback for an interview (with background processing)
 * POST /api/feedback/generate
 */
const generateFeedback = async (req, res, next) => {
    try {
        const { interviewId } = req.body;

        // Add job to queue instead of processing immediately
        const job = await feedbackQueue.add('generate-feedback', {
            interviewId,
            userId: req.user._id
        });

        logger.info(`Feedback generation job ${job.id} queued for interview ${interviewId}`);

        return successResponse(res, 202, 'Feedback generation started. Processing in background.', {
            jobId: job.id,
            status: 'processing',
            message: 'Your feedback is being generated. Check back shortly for results.'
        });

    } catch (error) {
        logger.error('Feedback generation error:', error);
        next(error);
    }
};

/**
 * Get feedback for an interview
 * GET /api/feedback/:interviewId
 */
const getFeedback = async (req, res, next) => {
    try {
        const feedback = await feedbackService.getFeedbackByInterview(
            req.params.interviewId,
            req.user._id
        );

        return successResponse(res, 200, 'Feedback retrieved successfully', { feedback });

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

module.exports = {
    generateFeedback,
    getFeedback
};
