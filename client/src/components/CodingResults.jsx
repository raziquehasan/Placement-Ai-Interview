import React from 'react';
import { CheckCircle, XCircle, Clock, Zap, Code, TrendingUp } from 'lucide-react';

const CodingResults = ({ results }) => {
    if (!results || !results.evaluated) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluating Your Code...</h3>
                    <p className="text-gray-600 text-center">
                        Running test cases and performing AI code review. This may take 10-15 seconds.
                    </p>
                </div>
            </div>
        );
    }

    const { testResults, codeReview, finalScore } = results;

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Final Score</h2>
                        <p className="text-primary-100">Your coding round performance</p>
                    </div>
                    <div className="text-5xl font-bold">{finalScore.toFixed(1)}<span className="text-2xl">/100</span></div>
                </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                    Test Cases
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Total Tests</div>
                        <div className="text-2xl font-bold text-gray-900">{testResults.totalTests}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">Passed</div>
                        <div className="text-2xl font-bold text-green-700">{testResults.passedTests}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-sm text-red-600 mb-1">Failed</div>
                        <div className="text-2xl font-bold text-red-700">{testResults.failedTests}</div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                        <span className="text-sm font-bold text-gray-900">{testResults.testPassRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${testResults.testPassRate >= 80 ? 'bg-green-500' :
                                testResults.testPassRate >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                            style={{ width: `${testResults.testPassRate}%` }}
                        ></div>
                    </div>
                </div>

                {/* Individual Test Results */}
                {testResults.results && testResults.results.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-3">Test Case Details:</h4>
                        {testResults.results.map((result, idx) => (
                            <div key={idx} className={`border rounded-lg p-3 ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        {result.passed ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                        )}
                                        <span className="font-medium text-gray-900">{result.testCase}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {result.executionTime}ms
                                    </div>
                                </div>
                                {!result.passed && result.error && (
                                    <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                                        <strong>Error:</strong> {result.error}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Code Review */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Code className="w-6 h-6 mr-2 text-primary-600" />
                    AI Code Review
                </h3>

                {/* Quality Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{codeReview.correctness}/10</div>
                        <div className="text-sm text-gray-600 mt-1">Correctness</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{codeReview.efficiency}/10</div>
                        <div className="text-sm text-gray-600 mt-1">Efficiency</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{codeReview.readability}/10</div>
                        <div className="text-sm text-gray-600 mt-1">Readability</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{codeReview.edgeCases}/10</div>
                        <div className="text-sm text-gray-600 mt-1">Edge Cases</div>
                    </div>
                </div>

                {/* Complexity Analysis */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Complexity Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-600">Time Complexity:</span>
                            <div className="font-mono font-bold text-gray-900">{codeReview.timeComplexity}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Space Complexity:</span>
                            <div className="font-mono font-bold text-gray-900">{codeReview.spaceComplexity}</div>
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Overall Feedback</h4>
                    <p className="text-gray-700 leading-relaxed">{codeReview.feedback}</p>
                </div>

                {/* Strengths */}
                {codeReview.strengths && codeReview.strengths.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Strengths
                        </h4>
                        <ul className="space-y-2">
                            {codeReview.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    <span className="text-gray-700">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Improvements */}
                {codeReview.improvements && codeReview.improvements.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                            {codeReview.improvements.map((improvement, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span className="text-gray-700">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodingResults;
