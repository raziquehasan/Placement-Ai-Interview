const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: [{
        text: String,
        id: String // For frontend reference
    }],
    correctOption: {
        type: String, // Matches option.id
        required: true
    },
    category: {
        type: String,
        enum: ['Aptitude', 'DSA', 'Verbal', 'Logic', 'Domain-Specific'],
        required: true,
        index: true
    },
    skillTags: [String],
    difficulty: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced'],
        default: 'Basic'
    },
    explanation: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
