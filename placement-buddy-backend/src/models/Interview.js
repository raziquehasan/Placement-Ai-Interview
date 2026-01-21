/**
 * Interview Model - Phase 2.1 Multi-Round Architecture
 * Orchestrates Technical → HR → Coding interview pipeline
 */

const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: [true, 'Resume ID is required'],
        index: true
    },

    // ============================================
    // Phase 2.1: Role-based Interview
    // ============================================
    role: {
        type: String,
        enum: [
            'Software Engineer',
            'Backend Developer',
            'Frontend Developer',
            'Full Stack Developer',
            'Data Scientist',
            'DevOps Engineer'
        ],
        required: [true, 'Job role is required']
    },

    // Legacy field (backward compatibility)
    jobRole: {
        type: String,
        trim: true,
        maxlength: [50, 'Job role cannot exceed 50 characters']
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },

    // ============================================
    // Phase 2.1: Multi-Round References
    // ============================================
    technicalRound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TechnicalRound'
    },
    hrRound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HRRound'
    },
    codingRound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodingRound'
    },

    // ============================================
    // Phase 2.1: Multi-Round Status Lifecycle
    // ============================================
    status: {
        type: String,
        enum: [
            'not_started',
            'technical_in_progress',
            'technical_completed',
            'hr_in_progress',
            'hr_completed',
            'coding_in_progress',
            'coding_completed',
            'completed',
            // Legacy statuses (backward compatibility)
            'in-progress',
            'abandoned'
        ],
        default: 'not_started',
        index: true
    },

    // ============================================
    // Phase 2.1: Final Results
    // ============================================
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    hiringDecision: {
        type: String,
        enum: ['Strong Hire', 'Hire', 'Consider', 'Reject']
    },
    hiringProbability: {
        type: Number,
        min: 0,
        max: 100
    },
    roleReadiness: {
        type: String,
        enum: ['Ready', 'Nearly Ready', 'Needs Improvement', 'Not Ready']
    },

    // ============================================
    // Legacy fields (backward compatibility - Phase 1)
    // ============================================
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
            enum: ['technical', 'behavioral', 'situational', 'general', 'communication'],
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

    // ============================================
    // Timestamps
    // ============================================
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    totalDuration: {
        type: Number // in minutes
    }
}, {
    timestamps: true
});

// ============================================
// INDEXES (Critical for scale)
// ============================================
interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ startedAt: -1 });
interviewSchema.index({ createdAt: -1 });

// ============================================
// METHODS
// ============================================

// Mark interview as completed
interviewSchema.methods.complete = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    this.totalDuration = Math.round((this.completedAt - this.startedAt) / 60000); // minutes
    return this.save();
};

// Check if resume is shortlisted (ATS >= 60)
interviewSchema.statics.validateResumeEligibility = async function (resumeId) {
    const Resume = mongoose.model('Resume');
    const resume = await Resume.findById(resumeId);

    if (!resume) {
        throw new Error('Resume not found');
    }

    const atsScore = resume.parsedData?.atsAnalysis?.atsScore || 0;
    if (atsScore < 60) {
        throw new Error(`Resume not shortlisted. ATS Score: ${atsScore}/100. Minimum required: 60.`);
    }

    return resume;
};

// Start technical round
interviewSchema.methods.startTechnicalRound = async function () {
    if (this.status !== 'not_started') {
        throw new Error('Interview already started');
    }

    this.status = 'technical_in_progress';
    return this.save();
};

// Complete technical round
interviewSchema.methods.completeTechnicalRound = async function () {
    this.status = 'technical_completed';
    return this.save();
};

// Start HR round
interviewSchema.methods.startHRRound = async function () {
    if (this.status !== 'technical_completed') {
        throw new Error('Technical round not completed');
    }

    this.status = 'hr_in_progress';
    return this.save();
};

// Complete HR round
interviewSchema.methods.completeHRRound = async function () {
    this.status = 'hr_completed';
    return this.save();
};

// Start coding round
interviewSchema.methods.startCodingRound = async function () {
    if (this.status !== 'hr_completed') {
        throw new Error('HR round not completed');
    }

    this.status = 'coding_in_progress';
    return this.save();
};

// Complete coding round
interviewSchema.methods.completeCodingRound = async function () {
    this.status = 'coding_completed';
    return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
