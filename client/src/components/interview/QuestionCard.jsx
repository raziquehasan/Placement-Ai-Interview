/**
 * Question Card Component - Phase 2.1
 * Displays interview question with category and difficulty
 */

import React from 'react';
import { Brain, Code, Network, Wrench, FolderGit2 } from 'lucide-react';

const QuestionCard = ({ question, questionNumber, total }) => {
    const categoryIcons = {
        'Core CS': Brain,
        'DSA': Code,
        'System Design': Network,
        'Framework': Wrench,
        'Projects': FolderGit2
    };

    const difficultyColors = {
        'Easy': 'bg-green-100 text-green-700',
        'Medium': 'bg-yellow-100 text-yellow-700',
        'Hard': 'bg-red-100 text-red-700'
    };

    const Icon = categoryIcons[question?.category] || Brain;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">
                        {question?.category || 'Technical'}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[question?.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                    {question?.difficulty || 'Medium'}
                </span>
            </div>

            {/* Question Number */}
            <div className="text-sm text-gray-500 mb-2">
                Question {questionNumber}/{total}
            </div>

            {/* Question Text */}
            <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
                {question?.questionText || 'Loading question...'}
            </div>
        </div>
    );
};

export default QuestionCard;
