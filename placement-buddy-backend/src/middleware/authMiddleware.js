/**
 * Authentication Middleware
 * Handles JWT verification and role-based access control
 */

const { verifyToken } = require('../utils/jwtUtils');
const { errorResponse } = require('../utils/responseUtils');
const User = require('../models/User');

/**
 * Authenticate user via JWT token
 * Adds user object to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'No token provided, authorization denied');
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database (exclude password)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return errorResponse(res, 401, 'User not found, authorization denied');
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        return errorResponse(res, 401, 'Invalid token, authorization denied');
    }
};

/**
 * Authorize based on user roles
 * @param  {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 403, `Access denied. Required role: ${roles.join(' or ')}`);
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
