/**
 * Answer Editor Component - Phase 2.1
 * Text area for typing interview answers
 */

import React, { useState, useEffect } from 'react';

const AnswerEditor = ({ value, onChange, placeholder = "Type your answer here...", disabled = false }) => {
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        setCharCount(value?.length || 0);
    }, [value]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">
                    Your Answer
                </label>
                <span className="text-xs text-gray-500">
                    {charCount} characters
                </span>
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                style={{ minHeight: '200px', maxHeight: '400px' }}
            />

            <div className="mt-2 text-xs text-gray-500">
                💡 Tip: Be specific and provide examples when possible
            </div>
        </div>
    );
};

export default AnswerEditor;
