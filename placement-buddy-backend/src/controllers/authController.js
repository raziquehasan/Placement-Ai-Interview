/**
 * Authentication Controller
 * Handles user registration and login requests
 */

const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const result = await authService.registerUser({ name, email, password, role });

        return successResponse(res, 201, 'User registered successfully', result);

    } catch (error) {
        if (error.message.includes('already exists')) {
            return errorResponse(res, 409, error.message);
        }
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser(email, password);

        return successResponse(res, 200, 'Login successful', result);

    } catch (error) {
        if (error.message.includes('Invalid')) {
            return errorResponse(res, 401, error.message);
        }
        next(error);
    }
};

module.exports = {
    register,
    login
};
