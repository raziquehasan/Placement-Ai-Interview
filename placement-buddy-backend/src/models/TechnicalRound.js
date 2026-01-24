/**
 * Technical Round Model - Phase 2.1
 * AI-powered technical interview with resume-aware questioning
 */

const mongoose = require('mongoose');

const technicalRoundSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: [true, 'Interview ID is required'],
        index: true
    },

    // ============================================
    // AI Configuration
    // ============================================
    aiPersona: {
        type: String,
        default: 'Senior Software Engineer'
    },
    resumeContext: {
        type: String, // Compressed resume data for AI context
        required: true
    },

    // ============================================
    // Questions Array
    // ============================================
    questions: [{
        questionId: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['Core CS', 'DSA', 'System Design', 'Framework', 'Projects', 'Behavioral'],
            required: true
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        questionText: {
            type: String,
            required: true
        },
        expectedAnswer: {
            type: String
        },
        evaluationRubric: [{
            point: String,
            weight: Number
        }],

        // ============================================
        // User Response
        // ============================================
        userAnswer: {
            type: String
        },
        answerTimestamp: {
            type: Date
        },
        timeSpent: {
            type: Number // seconds
        },

        // ============================================
        // AI Evaluation
        // ============================================
        aiEvaluation: {
            score: {
                type: Number,
                min: 0,
                max: 10
            },
            strengths: [String],
            weaknesses: [String],
            missingPoints: [String],
            feedback: String,
            evaluatedAt: Date
        },

        // ============================================
        // Follow-up Logic
        // ============================================
        hasFollowUp: {
            type: Boolean,
            default: false
        },
        followUpQuestion: {
            type: String
        },
        followUpAnswer: {
            type: String
        },
        followUpScore: {
            type: Number,
            min: 0,
            max: 10
        },
        followUpTimestamp: Date
    }],

    // ============================================
    // Round Metrics
    // ============================================
    totalQuestions: {
        type: Number,
        default: 10
    },
    answeredQuestions: {
        type: Number,
        default: 0
    },
    evaluatedQuestions: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    totalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    // ============================================
    // Category-wise Breakdown
    // ============================================
    scoreBreakdown: {
        coreCS: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        dsa: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        systemDesign: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        framework: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        projects: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },

    // ============================================
    // Status & Timing
    // ============================================
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress',
        index: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    duration: {
        type: Number // in minutes
    }
}, {
    timestamps: true
});

// ============================================
// INDEXES (Critical for performance)
// ============================================
technicalRoundSchema.index({ createdAt: -1 });

// ============================================
// METHODS
// ============================================

// Complete the technical round
technicalRoundSchema.methods.completeRound = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    this.duration = Math.round((this.completedAt - this.startedAt) / 60000); // minutes
    return this.save();
};

// Get current question number
technicalRoundSchema.methods.getCurrentQuestionNumber = function () {
    return this.answeredQuestions + 1;
};

// Check if round is complete
technicalRoundSchema.methods.isComplete = function () {
    return this.answeredQuestions >= this.totalQuestions;
};

// Get next unanswered question
technicalRoundSchema.methods.getNextQuestion = function () {
    return this.questions.find(q => !q.userAnswer) || null;
};

// Calculate average score
technicalRoundSchema.methods.calculateAverageScore = function () {
    const evaluatedQuestions = this.questions.filter(q => q.aiEvaluation && q.aiEvaluation.score !== undefined);

    if (evaluatedQuestions.length === 0) {
        return 0;
    }

    const totalScore = evaluatedQuestions.reduce((sum, q) => sum + q.aiEvaluation.score, 0);
    return totalScore / evaluatedQuestions.length;
};

// Calculate total score (0-100 scale)
technicalRoundSchema.methods.calculateTotalScore = function () {
    const avgScore = this.calculateAverageScore();
    return Math.round(avgScore * 10); // Convert 0-10 to 0-100
};

// Calculate category-wise scores
technicalRoundSchema.methods.calculateCategoryScores = function () {
    const categories = {
        'Core CS': [],
        'DSA': [],
        'System Design': [],
        'Framework': [],
        'Projects': []
    };

    // Group scores by category
    this.questions.forEach(q => {
        if (q.aiEvaluation && q.aiEvaluation.score !== undefined) {
            if (categories[q.category]) {
                categories[q.category].push(q.aiEvaluation.score);
            }
        }
    });

    // Calculate average for each category
    const breakdown = {};
    for (const [category, scores] of Object.entries(categories)) {
        if (scores.length > 0) {
            const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            breakdown[category] = Math.round(avg * 10); // Convert to 0-100 scale
        } else {
            breakdown[category] = 0;
        }
    }

    return {
        coreCS: breakdown['Core CS'] || 0,
        dsa: breakdown['DSA'] || 0,
        systemDesign: breakdown['System Design'] || 0,
        framework: breakdown['Framework'] || 0,
        projects: breakdown['Projects'] || 0
    };
};

// Update scores (call after new evaluation)
technicalRoundSchema.methods.updateScores = function () {
    this.evaluatedQuestions = this.questions.filter(q => q.aiEvaluation && q.aiEvaluation.score !== undefined).length;
    this.averageScore = this.calculateAverageScore();
    this.totalScore = this.calculateTotalScore();
    this.scoreBreakdown = this.calculateCategoryScores();
    return this.save();
};

module.exports = mongoose.model('TechnicalRound', technicalRoundSchema);
