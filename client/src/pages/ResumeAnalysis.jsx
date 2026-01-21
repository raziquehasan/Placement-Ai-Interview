import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as resumeAPI from '../api/resume';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResumeAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const data = await resumeAPI.getResumeById(id);
                setResume(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch analysis');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    if (loading) return <div className="p-8"><LoadingSpinner size="lg" /></div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!resume || !resume.parsedData.atsAnalysis) return <div className="p-8">No analysis found.</div>;

    const analysis = resume.parsedData.atsAnalysis;
    const isPending = analysis.status === 'Pending';
    const isShortlisted = analysis.status === 'Shortlisted';

    if (isPending) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium flex items-center mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Analysis in Progress</h1>
                        <p className="text-gray-500">{resume.fileName}</p>
                    </div>
                </div>

                <Card className="p-12 mb-8 border-l-8 border-amber-500 bg-amber-50/30 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.908-.588l3.358-7.605a1 1 0 00-.908-1.407H14.12l.142-4.142a1 1 0 00-1.693-.762l-7.377 7.377a1 1 0 00.707 1.707h4.571l-.142 4.142a1 1 0 001.336 1.107z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">Our AI is Screening Your Resume</h2>
                    <p className="text-gray-700 max-w-md">
                        We are currently simulating an ATS evaluation for Software Engineer roles. This usually takes 10-20 seconds.
                    </p>
                    <div className="mt-8 flex items-center space-x-3 text-amber-600 font-bold tracking-widest text-xs uppercase">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span>Processing</span>
                    </div>
                    <Button variant="outline" className="mt-10" onClick={() => window.location.reload()}>
                        Refresh Status
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium flex items-center mb-2">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 text-shimmer">Resume Analysis</h1>
                    <p className="text-gray-500">{resume.fileName}</p>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-black ${isShortlisted ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.atsScore}%
                    </div>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">ATS Score</p>
                </div>
            </div>

            {/* Analysis Summary Card */}
            <Card className={`p-8 mb-8 border-l-8 ${isShortlisted ? 'border-green-500 bg-green-50/30' : 'border-red-500 bg-red-50/30'}`}>
                <div className="flex items-start">
                    <div className={`p-3 rounded-full mr-5 ${isShortlisted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isShortlisted ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold mb-2 ${isShortlisted ? 'text-green-900' : 'text-red-900'}`}>
                            {isShortlisted ? 'You are Shortlisted!' : 'Needs Improvement'}
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            {isShortlisted
                                ? "Great job! Your resume meets the quality threshold for our hiring simulator. You've unlocked all interview rounds."
                                : "Your resume currently doesn't meet the minimum threshold (60%) for shortlisting. Follow the suggestions below to improve your score and unlock interviews."}
                        </p>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-600">
                                Job Readiness: <span className={`font-bold ${analysis.jobReadiness === 'High' ? 'text-green-600' : analysis.jobReadiness === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>
                                    {analysis.jobReadiness}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-green-500 mr-2">✅</span> Strengths
                    </h3>
                    <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-700">
                                <span className="text-green-500 mr-2">•</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Weaknesses */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-red-500 mr-2">❌</span> Weaknesses
                    </h3>
                    <ul className="space-y-3">
                        {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-700">
                                <span className="text-red-500 mr-2">•</span>
                                {w}
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Suggestions - Full Width */}
                <div className="md:col-span-2">
                    <Card className="p-6 border-t-4 border-primary-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <span className="text-primary-500 mr-2">💡</span> Improvement Roadmap
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.improvementSuggestions.map((s, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-700">{s}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mt-10 flex justify-center space-x-4">
                {isShortlisted ? (
                    <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                        Start Interviewing Now
                    </Button>
                ) : (
                    <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                        Re-upload Improved Resume
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalysis;
