/**
 * Resume Routes
 * Routes for resume upload and management
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/authMiddleware');
const { mongoIdValidation } = require('../utils/validators');
const { validate } = require('../middleware/validationMiddleware');

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes for current user
 * @access  Private
 */
router.get('/', authenticate, resumeController.getUserResumes);

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload and parse resume
 * @access  Private
 */
router.post('/upload', authenticate, resumeController.upload.single('resume'), resumeController.uploadResume);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get resume by ID
 * @access  Private
 */
router.get('/:id', authenticate, mongoIdValidation, validate, resumeController.getResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete('/:id', authenticate, mongoIdValidation, validate, resumeController.deleteResume);

module.exports = router;
