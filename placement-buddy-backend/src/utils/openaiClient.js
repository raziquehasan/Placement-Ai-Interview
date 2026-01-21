/**
 * OpenAI Client Configuration
 * Initializes OpenAI SDK for AI-powered features
 */

const OpenAI = require("openai");
const config = require("../config/config");
const logger = require("./logger");

// Validate API key
if (!config.openaiApiKey) {
    logger.warn('⚠️ OPENAI_API_KEY not configured. OpenAI features will be disabled.');
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: config.openaiApiKey
});

logger.info('✅ OpenAI client initialized successfully');

module.exports = openai;
