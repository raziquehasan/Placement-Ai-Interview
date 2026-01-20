/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const config = require('../config/config');

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 if status code is 200 (success)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Only show stack trace in development
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
        // Additional error details
        ...(err.errors && { errors: err.errors })
    });
};

module.exports = {
    notFound,
    errorHandler
};
