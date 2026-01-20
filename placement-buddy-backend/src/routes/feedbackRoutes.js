/**
 * Feedback Routes
 * Routes for feedback generation and retrieval
 */

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/feedback/generate
 * @desc    Generate feedback for an interview
 * @access  Private
 */
router.post('/generate',
    authenticate,
    [body('interviewId').isMongoId().withMessage('Invalid interview ID')],
    validate,
    feedbackController.generateFeedback
);

/**
 * @route   GET /api/feedback/:interviewId
 * @desc    Get feedback for an interview
 * @access  Private
 */
router.get('/:interviewId', authenticate, feedbackController.getFeedback);

module.exports = router;
