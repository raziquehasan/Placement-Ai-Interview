/**
 * Interview Model
 * Stores interview sessions, questions, and answers
 */

const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: [true, 'Resume ID is required']
    },
    jobRole: {
        type: String,
        required: [true, 'Job role is required'],
        trim: true,
        maxlength: [50, 'Job role cannot exceed 50 characters']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: [{
        questionId: {
            type: String,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['technical', 'behavioral', 'situational', 'general'],
            default: 'technical'
        },
        expectedAnswer: String
    }],
    answers: [{
        questionId: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// ============================================
// INDEXES (Critical for scale)
// ============================================
interviewSchema.index({ userId: 1 }); // Fast lookup by user
interviewSchema.index({ status: 1 }); // Filter by status
interviewSchema.index({ startedAt: -1 }); // Sort by date

// ============================================
// METHODS
// ============================================

// Mark interview as completed
interviewSchema.methods.complete = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
