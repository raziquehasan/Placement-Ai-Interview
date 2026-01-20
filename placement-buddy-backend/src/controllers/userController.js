/**
 * User Controller
 * Handles user profile operations
 */

const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
    try {
        // User is already attached by auth middleware
        const user = await User.findById(req.user._id);

        return successResponse(res, 200, 'Profile retrieved successfully', { user });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, profile } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Update fields
        if (name) user.name = name;
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };
        }

        await user.save();

        return successResponse(res, 200, 'Profile updated successfully', { user });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};
