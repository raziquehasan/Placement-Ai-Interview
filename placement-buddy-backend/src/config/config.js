/**
 * Centralized Configuration Management
 * All environment variables are accessed through this module
 */

module.exports = {
    // Server Configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database Configuration
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/placement-buddy',

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    jwtExpire: process.env.JWT_EXPIRE || '7d',

    // File Upload Configuration
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',

    // CORS Configuration
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // AI Service Configuration (Optional)
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',

    // Redis Configuration
    // Option 1: Use Redis URL (for Upstash or cloud Redis with TLS)
    redisUrl: process.env.REDIS_URL || '',

    // Option 2: Use individual config (for local Redis)
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT) || 6379,
    redisPassword: process.env.REDIS_PASSWORD || '',
};
