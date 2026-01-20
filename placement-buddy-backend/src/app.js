/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS Configuration
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logging with Morgan
if (config.nodeEnv === 'development') {
    app.use(morgan('dev')); // Console logging in development
} else {
    app.use(morgan('combined', { stream: logger.stream })); // File logging in production
}

// ============================================
// ROUTES
// ============================================

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Placement Buddy API is running',
        version: '1.0.0',
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
        documentation: '/docs'
    });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// Backward compatibility (optional - can be removed later)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/feedback', feedbackRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Not Found Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
