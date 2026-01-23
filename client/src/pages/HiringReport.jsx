import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHiringReport } from '../api/interview';
import {
    Trophy, TrendingUp, TrendingDown, Award, Target,
    BookOpen, Calendar, CheckCircle, XCircle, AlertCircle,
    Download, ArrowLeft, Sparkles
} from 'lucide-react';

const HiringReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await getHiringReport(id);
            setReport(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hiring report');
        } finally {
            setLoading(false);
        }
    };

    const getDecisionColor = (decision) => {
        switch (decision) {
            case 'Strong Hire': return 'bg-green-100 text-green-800 border-green-300';
            case 'Hire': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Consider': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Reject': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getDecisionIcon = (decision) => {
        switch (decision) {
            case 'Strong Hire': return <Trophy className="w-6 h-6" />;
            case 'Hire': return <Award className="w-6 h-6" />;
            case 'Consider': return <AlertCircle className="w-6 h-6" />;
            case 'Reject': return <XCircle className="w-6 h-6" />;
            default: return <CheckCircle className="w-6 h-6" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating your hiring report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Error</h2>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Final Hiring Report</h1>
                    <p className="text-gray-600">Interview completed on {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>

                {/* Hiring Decision Card */}
                <div className={`rounded-lg border-2 p-8 mb-8 ${getDecisionColor(report.hiringDecision)}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getDecisionIcon(report.hiringDecision)}
                            <div className="ml-4">
                                <h2 className="text-3xl font-bold mb-1">{report.hiringDecision}</h2>
                                <p className="text-lg">
                                    {report.probability ? `${report.probability}% hiring probability • ` : ''}{report.roleReadiness || 'Evaluation in Progress'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold">{report.scores.overall ? report.scores.overall.toFixed(1) : '0.0'}</div>
                            <div className="text-sm">Overall Score</div>
                        </div>
                    </div>
                </div>

                {/* Scores Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Round-wise Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Technical */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#3b82f6"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(report.scores.technical / 100) * 352} 352`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-2xl font-bold text-gray-900">
                                    {report.scores.technical}
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Technical Round</h4>
                            <p className="text-sm text-gray-600">40% weightage</p>
                        </div>

                        {/* HR */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#10b981"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(report.scores.hr / 100) * 352} 352`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-2xl font-bold text-gray-900">
                                    {report.scores.hr}
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">HR Round</h4>
                            <p className="text-sm text-gray-600">25% weightage</p>
                        </div>

                        {/* Coding */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#8b5cf6"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(report.scores.coding / 100) * 352} 352`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-2xl font-bold text-gray-900">
                                    {report.scores.coding ? report.scores.coding.toFixed(1) : '0'}
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Coding Round</h4>
                            <p className="text-sm text-gray-600">35% weightage</p>
                        </div>
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                {report.overallStrengths && report.overallWeaknesses && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Strengths */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                                Key Strengths
                            </h3>
                            <ul className="space-y-3">
                                {report.overallStrengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <TrendingDown className="w-6 h-6 text-yellow-600 mr-2" />
                                Areas for Improvement
                            </h3>
                            <ul className="space-y-3">
                                {report.overallWeaknesses.map((weakness, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Improvement Plan */}
                {report.improvementPlan && report.status === 'completed' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Sparkles className="w-7 h-7 text-primary-600 mr-2" />
                            Personalized Improvement Plan
                        </h3>

                        {/* Skill Gaps */}
                        {report.improvementPlan.skillGaps && report.improvementPlan.skillGaps.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Skill Gaps to Address</h4>
                                <div className="space-y-4">
                                    {report.improvementPlan.skillGaps.map((gap, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-semibold text-gray-900">{gap.skill}</h5>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${gap.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                    gap.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {gap.priority} Priority
                                                </span>
                                            </div>
                                            <div className="flex items-center mb-2">
                                                <span className="text-sm text-gray-600 mr-4">Current: {gap.currentLevel}/10</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${(gap.currentLevel / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 mr-4">Target: {gap.targetLevel}/10</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${(gap.targetLevel / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {gap.reasoning && (
                                                <p className="text-sm text-gray-600 mt-2">{gap.reasoning}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learning Path */}
                        {report.improvementPlan.learningPath && report.improvementPlan.learningPath.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Learning Roadmap
                                </h4>
                                <div className="space-y-6">
                                    {report.improvementPlan.learningPath.map((phase, idx) => (
                                        <div key={idx} className="border-l-4 border-primary-500 pl-6 pb-6 relative">
                                            <div className="absolute -left-3 top-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {idx + 1}
                                            </div>
                                            <h5 className="font-semibold text-gray-900 mb-2">{phase.phase}</h5>

                                            <div className="mb-3">
                                                <h6 className="text-sm font-medium text-gray-700 mb-1">Goals:</h6>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {phase.goals.map((goal, gIdx) => (
                                                        <li key={gIdx}>{goal}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mb-3">
                                                <h6 className="text-sm font-medium text-gray-700 mb-1">Resources:</h6>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {phase.resources.map((resource, rIdx) => (
                                                        <li key={rIdx}>{resource}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h6 className="text-sm font-medium text-gray-700 mb-1">Milestones:</h6>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {phase.milestones.map((milestone, mIdx) => (
                                                        <li key={mIdx}>{milestone}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Courses */}
                        {report.improvementPlan.recommendedCourses && report.improvementPlan.recommendedCourses.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Recommended Courses
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {report.improvementPlan.recommendedCourses.map((course, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">{course}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {report.improvementPlan.estimatedTimeToReady && (
                            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                                <p className="text-sm text-primary-900">
                                    <strong>Estimated Time to Ready:</strong> {report.improvementPlan.estimatedTimeToReady}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HiringReport;
