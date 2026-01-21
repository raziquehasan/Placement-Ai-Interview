/**
 * Progress Tracker Component - Phase 2.1
 * Visual progress indicator for interview questions
 */

import React from 'react';

const ProgressTracker = ({ answered, total }) => {
    const percentage = (answered / total) * 100;

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600">
                    {answered}/{total} ({Math.round(percentage)}%)
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Question Dots */}
            <div className="flex gap-1 mt-3">
                {Array.from({ length: total }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 flex-1 rounded-full ${index < answered
                                ? 'bg-blue-600'
                                : 'bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressTracker;
