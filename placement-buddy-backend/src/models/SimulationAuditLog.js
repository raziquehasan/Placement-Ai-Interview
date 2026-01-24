const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SimulationSession',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'SESSION_STARTED',
            'ROUND_STARTED',
            'ROUND_COMPLETED',
            'DECISION_MADE',
            'SHORTLISTED',
            'REJECTED',
            'METRICS_UPDATED',
            'INTEGRITY_ALERT'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SimulationAuditLog', auditLogSchema);
