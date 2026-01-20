/**
 * MongoDB Database Connection
 * Handles connection, error handling, and connection events
 */

const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            // Mongoose 6+ no longer needs these options, but keeping for compatibility
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);

        // Connection events
        mongoose.connection.on('connected', () => {
            console.log('🔗 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 Mongoose disconnected from MongoDB');
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

module.exports = connectDB;
