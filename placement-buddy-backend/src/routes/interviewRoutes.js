/**
 * Interview Routes
 * Routes for interview management
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { startInterviewValidation, submitAnswerValidation } = require('../utils/validators');
const { validate } = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/interviews/start
 * @desc    Start a new interview
 * @access  Private
 */
router.post('/start', authenticate, startInterviewValidation, validate, interviewController.startInterview);

/**
 * @route   POST /api/interviews/:id/submit
 * @desc    Submit answers for an interview
 * @access  Private
 */
router.post('/:id/submit', authenticate, submitAnswerValidation, validate, interviewController.submitAnswers);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview by ID
 * @access  Private
 */
router.get('/:id', authenticate, interviewController.getInterview);

/**
 * @route   GET /api/interviews/user/me
 * @desc    Get interview history for current user
 * @access  Private
 */
router.get('/user/me', authenticate, interviewController.getInterviewHistory);

module.exports = router;
