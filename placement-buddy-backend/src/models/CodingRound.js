const mongoose = require('mongoose');

/**
 * Coding Round Schema - Phase 2.3
 * Stores coding interview problem, submission, and evaluation
 */
const CodingRoundSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        index: true
    },

    // Problem Details
    problem: {
        title: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        description: { type: String, required: true },
        inputFormat: String,
        outputFormat: String,
        constraints: [String],

        // Test Cases
        sampleTestCases: [{
            input: String,
            output: String,
            explanation: String
        }],
        hiddenTestCases: [{
            input: String,
            output: String
        }],

        // Complexity Targets
        timeComplexityTarget: String,
        spaceComplexityTarget: String,
        hints: [String]
    },

    // Code Submission
    submission: {
        code: String,
        language: {
            type: String,
            enum: ['javascript', 'python', 'java', 'cpp', 'c'],
            default: 'javascript'
        },
        submittedAt: Date,
        timeSpent: Number // in seconds
    },

    // Test Execution Results
    testResults: {
        totalTests: { type: Number, default: 0 },
        passedTests: { type: Number, default: 0 },
        failedTests: { type: Number, default: 0 },
        testPassRate: { type: Number, default: 0 }, // percentage

        // Individual test results
        results: [{
            testCase: String,
            input: String,
            expectedOutput: String,
            actualOutput: String,
            passed: Boolean,
            executionTime: Number, // milliseconds
            memory: Number, // KB
            error: String
        }],

        executedAt: Date
    },

    // AI Code Review
    codeReview: {
        correctness: { type: Number, min: 0, max: 10 },
        efficiency: { type: Number, min: 0, max: 10 },
        readability: { type: Number, min: 0, max: 10 },
        edgeCases: { type: Number, min: 0, max: 10 },

        timeComplexity: String,
        spaceComplexity: String,

        strengths: [String],
        improvements: [String],
        bugs: [String],
        feedback: String,

        overallScore: { type: Number, min: 0, max: 10 }, // AI quality score
        reviewedAt: Date
    },

    // Final Scores
    codeQualityScore: { type: Number, min: 0, max: 10, default: 0 },
    finalScore: { type: Number, min: 0, max: 100, default: 0 },

    // Status & Timing
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'submitted', 'evaluating', 'completed'],
        default: 'not_started',
        index: true
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    duration: Number // in minutes

}, { timestamps: true });

// Calculate final coding score
CodingRoundSchema.methods.calculateFinalScore = function () {
    if (!this.testResults || !this.codeReview) {
        return 0;
    }

    const testPassRate = this.testResults.testPassRate || 0;
    const codeQuality = this.codeReview.overallScore || 0;

    // Final Score = (Test Pass Rate * 0.5) + (Code Quality * 10 * 0.5)
    this.finalScore = (testPassRate * 0.5) + (codeQuality * 10 * 0.5);
    this.codeQualityScore = codeQuality;

    return this.finalScore;
};

// Mark round as complete
CodingRoundSchema.methods.completeRound = function () {
    this.status = 'completed';
    this.completedAt = new Date();

    if (this.startedAt) {
        this.duration = Math.round((this.completedAt - this.startedAt) / 60000);
    }

    this.calculateFinalScore();
};

const CodingRound = mongoose.model('CodingRound', CodingRoundSchema);

module.exports = CodingRound;
