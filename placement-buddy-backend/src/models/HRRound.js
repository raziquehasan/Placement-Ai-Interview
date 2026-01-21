const mongoose = require('mongoose');

/**
 * HR Round Schema - Phase 2.2
 * Stores behavioral and soft skills interview data
 */
const HRRoundSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        index: true
    },

    aiPersona: {
        type: String,
        default: 'Senior HR Manager'
    },

    resumeContext: {
        type: String,
        required: true
    },

    // HR Interview Questions
    questions: [{
        questionId: { type: String, required: true },
        category: {
            type: String,
            enum: ['Behavioral', 'Situational', 'Communication', 'Teamwork', 'Leadership', 'Career Goals', 'Culture Fit'],
            required: true
        },
        questionText: { type: String, required: true },

        // Assessment Focus (AI hint)
        evaluationFocus: [String],

        // User Response
        userAnswer: String,
        answerTimestamp: Date,
        timeSpent: Number, // in seconds

        // AI Evaluation
        aiEvaluation: {
            score: { type: Number, min: 0, max: 10 },
            confidence: { type: Number, min: 0, max: 10 },
            clarity: { type: Number, min: 0, max: 10 },
            relevance: { type: Number, min: 0, max: 10 },
            authenticity: { type: Number, min: 0, max: 10 }, // STAR method adherence
            feedback: String,
            evaluatedAt: Date
        },

        // Adaptive Follow-up
        hasFollowUp: { type: Boolean, default: false },
        followUpQuestion: String,
        followUpAnswer: String,
        followUpScore: Number
    }],

    // Personality Traits (Derived from AI overall analysis)
    personalityTraits: [{
        trait: { type: String, required: true }, // e.g., 'Leadership', 'Emotional Intelligence'
        score: { type: Number, min: 0, max: 10 },
        evidence: [String] // Specific quotes or actions from the interview
    }],

    // HR Round Metrics
    totalQuestions: { type: Number, default: 8 },
    answeredQuestions: { type: Number, default: 0 },
    evaluatedQuestions: { type: Number, default: 0 },

    // Soft Skills Aggregate Scores (0-10)
    cultureFit: { type: Number, min: 0, max: 10, default: 0 },
    communicationSkills: { type: Number, min: 0, max: 10, default: 0 },
    leadershipPotential: { type: Number, min: 0, max: 10, default: 0 },
    attitudeScore: { type: Number, min: 0, max: 10, default: 0 },

    // Round Totals
    averageScore: { type: Number, min: 0, max: 10, default: 0 },
    totalScore: { type: Number, min: 0, max: 100, default: 0 },

    // Qualitative Summary
    strengths: [String],
    concerns: [String],
    keyRecommendations: String,

    // Status & Timing
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress',
        index: true
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    duration: Number // in minutes
}, { timestamps: true });

// Methods for metrics calculation
HRRoundSchema.methods.calculateScores = function () {
    const evaluated = this.questions.filter(q => q.aiEvaluation && q.aiEvaluation.evaluatedAt);
    if (evaluated.length === 0) return;

    const totalPoints = evaluated.reduce((sum, q) => sum + (q.aiEvaluation.score || 0), 0);
    this.averageScore = totalPoints / evaluated.length;

    // Scale to 100 for overall reporting
    this.totalScore = this.averageScore * 10;

    // Soft skills averages
    this.communicationSkills = evaluated.reduce((sum, q) => sum + (q.aiEvaluation.clarity || 0), 0) / evaluated.length;
    this.attitudeScore = evaluated.reduce((sum, q) => sum + (q.aiEvaluation.confidence || 0), 0) / evaluated.length;

    // Culture fit normally comes from situational/culture categories
    const cultureQuestions = evaluated.filter(q => q.category === 'Culture Fit' || q.category === 'Behavioral');
    if (cultureQuestions.length > 0) {
        this.cultureFit = cultureQuestions.reduce((sum, q) => sum + (q.aiEvaluation.score || 0), 0) / cultureQuestions.length;
    }
};

HRRoundSchema.methods.completeRound = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    if (this.startedAt) {
        this.duration = Math.round((this.completedAt - this.startedAt) / 60000);
    }
    this.calculateScores();
};

const HRRound = mongoose.model('HRRound', HRRoundSchema);

module.exports = HRRound;
