const mongoose = require('mongoose');

const roundTemplateSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['OA', 'Technical', 'SystemDesign', 'HR', 'Panel'],
        required: true
    },
    title: String,
    config: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    shortlistThreshold: {
        type: Number, // Percentage 0-100
        default: 60
    },
    order: {
        type: Number,
        required: true
    }
});

const pipelineSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    version: {
        type: String,
        required: true
    },
    difficultyScale: {
        type: String,
        enum: ['Entry', 'Mid', 'Senior'],
        default: 'Entry'
    },
    rounds: [roundTemplateSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure uniqueness per company version and level
pipelineSchema.index({ companyId: 1, version: 1, difficultyScale: 1 }, { unique: true });

module.exports = mongoose.model('SimulationPipeline', pipelineSchema);
