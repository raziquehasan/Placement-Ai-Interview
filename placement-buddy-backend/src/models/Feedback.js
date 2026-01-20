/**
 * Feedback Model
 * Stores AI-generated feedback for interviews
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: [true, 'Interview ID is required'],
        unique: true // One feedback per interview
    },
    overallScore: {
        type: Number,
        required: [true, 'Overall score is required'],
        min: [0, 'Score cannot be less than 0'],
        max: [100, 'Score cannot exceed 100']
    },
    strengths: [{
        type: String,
        trim: true
    }],
    improvements: [{
        type: String,
        trim: true
    }],
    detailedFeedback: {
        technical: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            comments: String
        },
        communication: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            comments: String
        },
        problemSolving: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            comments: String
        },
        confidence: {
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            comments: String
        }
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ============================================
// INDEXES (Critical for scale)
// ============================================
feedbackSchema.index({ userId: 1 }); // Fast lookup by user
feedbackSchema.index({ interviewId: 1 }); // Fast lookup by interview
feedbackSchema.index({ generatedAt: -1 }); // Sort by date

module.exports = mongoose.model('Feedback', feedbackSchema);
