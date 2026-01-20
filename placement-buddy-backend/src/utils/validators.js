/**
 * Input Validation Schemas
 * Using express-validator for request validation
 */

const { body, param } = require('express-validator');

// User Registration Validation
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .optional()
        .isIn(['student', 'admin']).withMessage('Role must be either student or admin')
];

// User Login Validation
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// Profile Update Validation
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('profile.phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

    body('profile.college')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('College name must not exceed 100 characters'),

    body('profile.degree')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Degree must not exceed 50 characters'),

    body('profile.year')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5')
];

// Interview Start Validation
const startInterviewValidation = [
    body('resumeId')
        .notEmpty().withMessage('Resume ID is required')
        .isMongoId().withMessage('Invalid Resume ID'),

    body('jobRole')
        .trim()
        .notEmpty().withMessage('Job role is required')
        .isLength({ max: 50 }).withMessage('Job role must not exceed 50 characters'),

    body('difficulty')
        .optional()
        .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard')
];

// Submit Answer Validation
const submitAnswerValidation = [
    param('id')
        .isMongoId().withMessage('Invalid Interview ID'),

    body('answers')
        .isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),

    body('answers.*.questionId')
        .notEmpty().withMessage('Question ID is required'),

    body('answers.*.answer')
        .trim()
        .notEmpty().withMessage('Answer cannot be empty')
];

// MongoDB ID Validation
const mongoIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    startInterviewValidation,
    submitAnswerValidation,
    mongoIdValidation
};
