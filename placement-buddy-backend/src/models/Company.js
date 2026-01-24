const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Tech-Giant', 'Service-Based', 'Startup', 'Unicorn'],
        required: [true, 'Category is required']
    },
    difficultyCurve: {
        type: [Number],
        default: [1.0, 1.2, 1.5, 2.0], // Multipliers for each round
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Difficulty curve must have at least one entry'
        }
    },
    weightage: {
        dsa: { type: Number, default: 40 },
        design: { type: Number, default: 20 },
        culture: { type: Number, default: 20 },
        softSkills: { type: Number, default: 20 }
    },
    attemptPolicy: {
        maxAttempts: { type: Number, default: 1 },
        cooldownDays: { type: Number, default: 180 }
    },
    featureFlags: {
        enableOA: { type: Boolean, default: true },
        enableVideo: { type: Boolean, default: true },
        enablePanel: { type: Boolean, default: true }
    },
    version: {
        type: String,
        default: '2025.1'
    },
    logoUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
