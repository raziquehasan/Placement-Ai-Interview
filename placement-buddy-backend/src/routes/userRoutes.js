/**
 * User Routes
 * Routes for user profile management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { updateProfileValidation } = require('../utils/validators');
const { validate } = require('../middleware/validationMiddleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfileValidation, validate, userController.updateProfile);

module.exports = router;
