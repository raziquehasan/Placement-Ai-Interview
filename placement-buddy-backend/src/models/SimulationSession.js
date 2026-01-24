const mongoose = require('mongoose');

const roundSessionSchema = new mongoose.Schema({
    roundTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In-Progress', 'Completed', 'Failed', 'Skipped'],
        default: 'Pending'
    },
    score: {
        type: Number,
        default: 0
    },
    metrics: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    startedAt: Date,
    completedAt: Date,
    feedback: String
});

const simulationSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    pipelineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SimulationPipeline',
        required: true
    },
    mode: {
        type: String,
        enum: ['Practice', 'Realistic'],
        default: 'Practice'
    },
    currentRoundIndex: {
        type: Number,
        default: 0
    },
    rounds: [roundSessionSchema],
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Rejected', 'On-Hold'],
        default: 'Active'
    },
    offerProbability: {
        value: { type: Number, default: 0 },
        breakdown: { type: Map, of: Number },
        explanation: String
    },
    integrityScore: {
        type: Number,
        default: 100
    },
    overallFeedback: String,
    mentorPlan: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SimulationSession', simulationSessionSchema);
