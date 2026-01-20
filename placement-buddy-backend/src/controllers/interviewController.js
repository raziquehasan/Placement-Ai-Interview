/**
 * Interview Controller
 * Handles interview operations
 */

const interviewService = require('../services/interviewService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * Start a new interview
 * POST /api/interviews/start
 */
const startInterview = async (req, res, next) => {
    try {
        const { resumeId, jobRole, difficulty } = req.body;

        const interview = await interviewService.startInterview(
            req.user._id,
            resumeId,
            jobRole,
            difficulty
        );

        return successResponse(res, 201, 'Interview started successfully', { interview });

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

/**
 * Submit answers for an interview
 * POST /api/interviews/:id/submit
 */
const submitAnswers = async (req, res, next) => {
    try {
        const { answers } = req.body;

        const interview = await interviewService.submitAnswers(
            req.params.id,
            req.user._id,
            answers
        );

        return successResponse(res, 200, 'Answers submitted successfully', { interview });

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        if (error.message.includes('already completed')) {
            return errorResponse(res, 400, error.message);
        }
        next(error);
    }
};

/**
 * Get interview by ID
 * GET /api/interviews/:id
 */
const getInterview = async (req, res, next) => {
    try {
        const interview = await interviewService.getInterviewById(
            req.params.id,
            req.user._id
        );

        return successResponse(res, 200, 'Interview retrieved successfully', { interview });

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

/**
 * Get interview history
 * GET /api/interviews/user/me
 */
const getInterviewHistory = async (req, res, next) => {
    try {
        const interviews = await interviewService.getInterviewHistory(req.user._id);

        return successResponse(res, 200, 'Interview history retrieved successfully', { interviews });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    startInterview,
    submitAnswers,
    getInterview,
    getInterviewHistory
};
