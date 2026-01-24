/**
 * Placement Buddy Backend - Server Entry Point
 * Production-grade AI Interview Simulator with Background Jobs
 */

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');

// Initialize background workers
require('./src/queues/workers');

// Connect to MongoDB
connectDB();

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
    logger.info(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║        🚀 Placement Buddy Backend Server 🚀          ║
  ║                                                       ║
  ║  Status: Running                                      ║
  ║  Port: ${PORT}                                        ║
  ║  Environment: ${config.nodeEnv}                       ║
  ║  Database: Connected                                  ║
  ║  Workers: Active                                      ║
  ║                                                       ║
  ║  API Base URL: http://localhost:${PORT}/api/v1        ║
  ║  API Docs: http://localhost:${PORT}/docs              ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('❌ Unhandled Promise Rejection:', err.message);
    logger.error(err.stack);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('❌ Uncaught Exception:', err.message);
    logger.error(err.stack);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('✅ Process terminated');
    });
});
// server restart
// redis updated
// server restart log
