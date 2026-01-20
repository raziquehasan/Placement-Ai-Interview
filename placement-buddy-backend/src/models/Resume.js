/**
 * Resume Model
 * Stores uploaded resumes and parsed data
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    parsedData: {
        skills: [{
            type: String,
            trim: true
        }],
        education: [{
            institution: String,
            degree: String,
            field: String,
            startYear: Number,
            endYear: Number,
            grade: String
        }],
        experience: [{
            company: String,
            position: String,
            startDate: String,
            endDate: String,
            description: String,
            current: {
                type: Boolean,
                default: false
            }
        }]
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ============================================
// INDEXES (Critical for scale)
// ============================================
resumeSchema.index({ userId: 1 }); // Fast lookup by user
resumeSchema.index({ uploadedAt: -1 }); // Sort by upload date

module.exports = mongoose.model('Resume', resumeSchema);
