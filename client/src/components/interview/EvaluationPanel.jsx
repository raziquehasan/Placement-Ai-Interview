/**
 * Evaluation Panel Component - Phase 2.1
 * Displays AI evaluation feedback and scores
 */

import React from 'react';
import { Loader2, CheckCircle, Star, TrendingUp, AlertCircle } from 'lucide-react';

const EvaluationPanel = ({ evaluation, status = 'not_started', hasFollowUp, followUpQuestion }) => {
    // Evaluating state
    if (status === 'evaluating') {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                        <div className="font-medium text-blue-900">Evaluating your answer...</div>
                        <div className="text-sm text-blue-700">AI is analyzing your response</div>
                    </div>
                </div>
            </div>
        );
    }

    // Not evaluated yet
    if (!evaluation || status === 'not_started') {
        return null;
    }

    // Evaluation complete
    const { score, feedback, strengths, weaknesses } = evaluation;
    const percentage = (score / 10) * 100;

    return (
        <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm opacity-90">Your Score</div>
                        <div className="text-4xl font-bold">{score}/10</div>
                        <div className="flex gap-1 mt-2">
                            {[...Array(10)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < score ? 'fill-yellow-300 text-yellow-300' : 'text-white opacity-30'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <CheckCircle className="w-16 h-16 opacity-80" />
                        <div className="text-sm mt-2">{percentage}%</div>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">AI Feedback</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{feedback}</p>
            </div>

            {/* Strengths */}
            {strengths && strengths.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Strengths</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-800">{strength}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Weaknesses */}
            {weaknesses && weaknesses.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h4 className="font-medium text-orange-900">Areas to Improve</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-orange-800">{weakness}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Follow-up Question */}
            {hasFollowUp && followUpQuestion && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Follow-up Question</h4>
                    </div>
                    <p className="text-sm text-purple-800">{followUpQuestion}</p>
                </div>
            )}
        </div>
    );
};

export default EvaluationPanel;
