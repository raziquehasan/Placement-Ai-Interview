/**
 * Gemini AI Client Configuration
 * Initializes Google Generative AI SDK for interview generation
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config/config");
const logger = require("./logger");

// Validate API key
if (!config.geminiApiKey) {
    logger.warn('⚠️ GEMINI_API_KEY not configured. AI features will use fallback logic.');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Get the Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

logger.info('✅ Gemini AI client initialized successfully');

module.exports = model;
