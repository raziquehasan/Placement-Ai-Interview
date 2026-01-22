/**
 * Admin Routes
 * Routes for administrative functions and monitoring
 */

const express = require('express');
const router = express.Router();
const { getAPIUsage, clearCaches } = require('../controllers/adminController');

// API Usage Monitoring
router.get('/api-usage', getAPIUsage);

// Cache Management
router.post('/clear-cache', clearCaches);

module.exports = router;
