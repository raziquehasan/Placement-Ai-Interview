const mongoose = require('mongoose');

/**
 * Coding Round Schema - Phase 2.3+
 * Stores multiple coding interview problems, submissions, and evaluations
 */
const CodingRoundSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        index: true
    },

    // Multi-Problem Structure
    problems: [{
        problemId: { type: String, required: true },
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
        sampleTestCases: [{
            input: String,
            output: String,
            explanation: String
        }],
        hiddenTestCases: [{
            input: String,
            output: String
        }],
        timeComplexityTarget: String,
        spaceComplexityTarget: String,
        hints: [String],

        // Submission per problem
        submission: {
            code: String,
            language: String,
            submittedAt: Date,
            timeSpent: Number, // in seconds
            draft: String // Auto-save draft
        },

        // Test Results per problem
        testResults: {
            totalTests: { type: Number, default: 0 },
            passedTests: { type: Number, default: 0 },
            testPassRate: { type: Number, default: 0 },
            results: [{
                testCase: String,
                input: String,
                expectedOutput: String,
                actualOutput: String,
                passed: Boolean,
                executionTime: Number,
                memory: Number,
                error: String,
                verdict: {
                    type: String,
                    enum: ['Accepted', 'Wrong Answer', 'TLE', 'Runtime Error', 'Partial'],
                }
            }]
        },

        // Evaluation per problem
        evaluation: {
            score: { type: Number, min: 0, max: 10 },
            timeComplexity: String,
            spaceComplexity: String,
            feedback: String,
            improvements: [String],
            status: {
                type: String,
                enum: ['not_started', 'accepted', 'partial', 'tle', 'failed'],
                default: 'not_started'
            }
        }
    }],

    // Round Progress
    totalProblems: { type: Number, default: 3 },
    solvedProblems: { type: Number, default: 0 },
    currentProblemIndex: { type: Number, default: 0 },

    // Adaptive Logic
    isAdaptive: { type: Boolean, default: true },
    expansionTriggered: { type: Boolean, default: false },

    // Integrity signals
    integrity: {
        tabSwitches: { type: Number, default: 0 },
        pastedCount: { type: Number, default: 0 },
        lostFocusTime: { type: Number, default: 0 } // in ms
    },

    // Timing
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'evaluating', 'completed'],
        default: 'not_started',
        index: true
    },
    startedAt: { type: Date, default: Date.now },
    deadline: Date,
    completedAt: Date,
    totalScore: { type: Number, default: 0 }

}, { timestamps: true });

// MARK: Methods

CodingRoundSchema.methods.calculateOverallScore = function () {
    if (!this.problems || this.problems.length === 0) return 0;

    // Average of individual problem scores (0-10) scaled to 0-100
    const totalPossiblePoints = this.problems.length * 10;
    const earnedPoints = this.problems.reduce((sum, p) => sum + (p.evaluation?.score || 0), 0);

    this.totalScore = Math.round((earnedPoints / totalPossiblePoints) * 100);
    return this.totalScore;
};

const CodingRound = mongoose.model('CodingRound', CodingRoundSchema);
module.exports = CodingRound;
