import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as feedbackAPI from '../api/feedback';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Feedback = () => {
    const { id } = useParams();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const feedbackData = await feedbackAPI.getFeedback(id);
                if (feedbackData) {
                    setFeedback(feedbackData);
                    setLoading(false);
                } else {
                    // If no feedback found, try generating it
                    handleGenerate();
                }
            } catch (err) {
                console.error('Error fetching feedback:', err);
                handleGenerate();
            }
        };

        fetchFeedback();
    }, [id]);

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const result = await feedbackAPI.generateFeedback(id);
            // Since generation is async, we might need to poll, but for now we'll wait and inform user
            alert(result.message || 'AI is processing your feedback. Please refresh in a moment.');
            // Add a small delay then try to fetch again
            setTimeout(async () => {
                const freshFeedback = await feedbackAPI.getFeedback(id);
                if (freshFeedback) setFeedback(freshFeedback);
            }, 5000);
        } catch (err) {
            console.error('Error generating feedback:', err);
            // Fallback or error state
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    if (loading || generating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 font-medium">
                    {generating ? 'AI is analyzing your interview performance...' : 'Loading feedback...'}
                </p>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No feedback available</h2>
                <p className="text-gray-600 mb-8">We couldn't retrieve or generate feedback for this interview.</p>
                <Link to="/dashboard">
                    <Button variant="primary">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const { overallScore, strengths, improvements, detailedFeedback } = feedback;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Feedback</h1>
                    <p className="text-gray-600">Comprehensive AI analysis of your recent performance.</p>
                </div>
                <Link to="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </header>

            {/* Overview Score */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-white to-primary-50">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * (overallScore || 0)) / 100}
                                className="text-primary-600"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900">{overallScore}%</span>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Overall Performance</h2>
                        <p className="text-gray-700 leading-relaxed max-w-xl">
                            You scored {overallScore >= 80 ? 'exceptionally well' : overallScore >= 60 ? 'well' : 'fairly'}.
                            The AI has identified key areas of strength and specific opportunities where you can sharpen your edge.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Strengths */}
                <Card className="p-6 border-l-4 border-l-success-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🌟</span> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                        {strengths?.map((s, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                                <span className="text-success-500 mr-2">✓</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Improvements */}
                <Card className="p-6 border-l-4 border-l-warning-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📈</span> Areas for Growth
                    </h3>
                    <ul className="space-y-3">
                        {improvements?.map((i, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                                <span className="text-warning-500 mr-2">→</span>
                                {i}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Detailed Sections */}
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailedFeedback && Object.entries(detailedFeedback).map(([key, data]) => (
                    <Card key={key} className="p-6" hover>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-900 capitalize">{key}</h4>
                            <span className={`text-sm font-bold ${data.score >= 80 ? 'text-success-600' : data.score >= 50 ? 'text-warning-600' : 'text-red-600'
                                }`}>
                                {data.score}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                            <div
                                className={`h-1.5 rounded-full ${data.score >= 80 ? 'bg-success-500' : data.score >= 50 ? 'bg-warning-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${data.score}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed italic">"{data.comments}"</p>
                    </Card>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link to="/dashboard">
                    <Button variant="primary" size="lg" className="px-10">Start Next Practice</Button>
                </Link>
            </div>
        </div>
    );
};

export default Feedback;
