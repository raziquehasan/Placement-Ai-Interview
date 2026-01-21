/**
 * Interview Routes - Phase 2.1
 * Multi-round AI interview endpoints
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/v1/interviews
 * @desc    Create new interview (Phase 2.1)
 * @access  Private
 */
router.post('/', authenticate, interviewController.createInterview);

/**
 * @route   GET /api/v1/interviews
 * @desc    Get interview history for current user
 * @access  Private
 */
router.get('/', authenticate, interviewController.getInterviewHistory);

/**
 * @route   GET /api/v1/interviews/:id
 * @desc    Get interview by ID
 * @access  Private
 */
router.get('/:id', authenticate, interviewController.getInterview);
router.post('/:id/submit', authenticate, interviewController.submitBulkAnswers);

// ============================================
// Phase 2.1: Technical Round Endpoints
// ============================================

/**
 * @route   POST /api/v1/interviews/:id/technical/start
 * @desc    Start technical round
 * @access  Private
 */
router.post('/:id/technical/start', authenticate, interviewController.startTechnicalRound);

/**
 * @route   POST /api/v1/interviews/:id/technical/answer
 * @desc    Submit answer for current question
 * @access  Private
 */
router.post('/:id/technical/answer', authenticate, interviewController.submitAnswer);

/**
 * @route   GET /api/v1/interviews/:id/technical/evaluation/:questionId
 * @desc    Get evaluation for specific question (polling endpoint)
 * @access  Private
 */
router.get('/:id/technical/evaluation/:questionId', authenticate, interviewController.getEvaluation);

/**
 * @route   GET /api/v1/interviews/:id/technical/status
 * @desc    Get technical round progress and scores
 * @access  Private
 */
router.get('/:id/technical/status', authenticate, interviewController.getTechnicalStatus);

// ============================================
// Phase 2.2: HR Round Endpoints
// ============================================

/**
 * @route   POST /api/v1/interviews/:id/hr/start
 * @desc    Start HR behavioral round
 * @access  Private
 */
router.post('/:id/hr/start', authenticate, interviewController.startHRRound);

/**
 * @route   POST /api/v1/interviews/:id/hr/answer
 * @desc    Submit answer for HR question
 * @access  Private
 */
router.post('/:id/hr/answer', authenticate, interviewController.submitHRAnswer);

/**
 * @route   GET /api/v1/interviews/:id/hr/evaluation/:questionId
 * @desc    Get evaluation for HR question (polling)
 * @access  Private
 */
router.get('/:id/hr/evaluation/:questionId', authenticate, interviewController.getHREvaluation);

/**
 * @route   GET /api/v1/interviews/:id/hr/status
 * @desc    Get HR round status and personality analysis
 * @access  Private
 */
router.get('/:id/hr/status', authenticate, interviewController.getHRStatus);

// ============================================
// Phase 2.3: Coding Round Endpoints
// ============================================

/**
 * @route   POST /api/v1/interviews/:id/coding/start
 * @desc    Start coding round with AI-generated problem
 * @access  Private
 */
router.post('/:id/coding/start', authenticate, interviewController.startCodingRound);

/**
 * @route   POST /api/v1/interviews/:id/coding/submit
 * @desc    Submit code solution for evaluation
 * @access  Private
 */
router.post('/:id/coding/submit', authenticate, interviewController.submitCode);

/**
 * @route   GET /api/v1/interviews/:id/coding/results
 * @desc    Get coding round test results and AI review (polling)
 * @access  Private
 */
router.get('/:id/coding/results', authenticate, interviewController.getCodingResults);

// ============================================
// Phase 2.4: Final Hiring Report Endpoints
// ============================================

/**
 * @route   GET /api/v1/interviews/:id/report
 * @desc    Generate final hiring report with all round scores
 * @access  Private
 */
router.get('/:id/report', authenticate, interviewController.getHiringReport);

module.exports = router;
