/**
 * Interview Results Page - Phase 2.1 & 2.2
 * Displays technical and HR round performance
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowRight, TrendingUp, Award, UserCheck, CheckCircle, Shield } from 'lucide-react';
import interviewService from '../services/interviewService';

const InterviewResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [interview, setInterview] = useState(null);
    const [technicalStatus, setTechnicalStatus] = useState(null);
    const [hrStatus, setHRStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const interviewData = await interviewService.getInterview(id);
            setInterview(interviewData);

            // Load technical status
            if (interviewData.technicalRound) {
                try {
                    const tech = await interviewService.getTechnicalStatus(id);
                    setTechnicalStatus(tech);
                } catch (err) {
                    console.error('Failed to load technical status:', err);
                }
            }

            // Load HR status
            if (interviewData.hrRound) {
                try {
                    const hr = await interviewService.getHRStatus(id);
                    setHRStatus(hr);
                } catch (err) {
                    console.error('Failed to load HR status:', err);
                }
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            // TODO: Implement actual PDF generation
            // For now, navigate to hiring report page
            navigate(`/report/${id}`);
        } catch (err) {
            alert('Failed to generate PDF report');
        }
    };

    const getPerformanceLevel = (score) => {
        if (score >= 85) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
        if (score >= 70) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (score >= 55) return { text: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { text: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-100' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600 font-medium">Generating your interview appraisal...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white border border-red-100 rounded-xl shadow-lg p-8 max-w-lg text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-gray-900 text-xl font-bold mb-2">Failed to Load Results</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Completion Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl p-10 mb-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="w-32 h-32" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 relative z-10">Interview Performance Report</h1>
                    <p className="text-blue-100 text-lg relative z-10">Role: {interview?.role} • Mode: {interview?.difficulty}</p>
                </div>

                {/* Technical Round Section */}
                {technicalStatus && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">1</div>
                                Technical Assessment
                            </h2>
                            {technicalStatus.status === 'completed' && (
                                <span className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Completed
                                </span>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
                            <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Technical Proficiency</div>
                            <div className="text-7xl font-black text-blue-600 mb-4 tracking-tight">
                                {technicalStatus.scores.totalScore}/100
                            </div>
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${getPerformanceLevel(technicalStatus.scores.totalScore).bg} ${getPerformanceLevel(technicalStatus.scores.totalScore).color} font-bold text-sm`}>
                                {getPerformanceLevel(technicalStatus.scores.totalScore).text}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Knowledge Pillars
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {[
                                    { name: 'Core CS Concepts', score: technicalStatus.scores.breakdown.coreCS },
                                    { name: 'Data Structures & Algo', score: technicalStatus.scores.breakdown.dsa },
                                    { name: 'System Architecture', score: technicalStatus.scores.breakdown.systemDesign },
                                    { name: 'Framework Proficiency', score: technicalStatus.scores.breakdown.framework },
                                    { name: 'Project Experience', score: technicalStatus.scores.breakdown.projects }
                                ].map(({ name, score }) => (
                                    <div key={name}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-600">{name}</span>
                                            <span className="text-sm font-bold text-gray-900">{score}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-blue-600' : score >= 50 ? 'bg-blue-400' : 'bg-red-400'}`}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* HR Round Section */}
                {hrStatus && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">2</div>
                                Behavioral & Culture Fit
                            </h2>
                            {hrStatus.status === 'completed' && (
                                <span className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Completed
                                </span>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
                            <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Communication & Attitude</div>
                            <div className="text-7xl font-black text-green-600 mb-4 tracking-tight">
                                {hrStatus.scores.totalScore.toFixed(0)}/100
                            </div>
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${getPerformanceLevel(hrStatus.scores.totalScore).bg} ${getPerformanceLevel(hrStatus.scores.totalScore).color} font-bold text-sm`}>
                                {getPerformanceLevel(hrStatus.scores.totalScore).text}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                    Soft Skill Pulse
                                </h3>
                                <div className="space-y-8">
                                    {[
                                        { name: 'Verbal Communication', score: (hrStatus.scores.communication || 0) * 10 },
                                        { name: 'Cultural Alignment', score: (hrStatus.scores.cultureFit || 0) * 10 }
                                    ].map(({ name, score }) => (
                                        <div key={name}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-600">{name}</span>
                                                <span className="text-sm font-bold text-gray-900">{score.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-green-600' : 'bg-emerald-400'}`}
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Personality Traits</h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {hrStatus.personalityTraits?.length > 0 ? (
                                        hrStatus.personalityTraits.map((trait, idx) => (
                                            <div key={idx} className="group relative">
                                                <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl flex flex-col items-center">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{trait.trait}</span>
                                                    <span className="text-lg font-black text-green-600">{trait.score}/10</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-4 px-6 border-2 border-dashed border-gray-100 rounded-2xl opacity-40">
                                            <p className="text-gray-400 text-sm italic">Trait analysis in progress...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Platform Navigation */}
                <div className="flex flex-col sm:flex-row gap-5 mb-20">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 font-bold transition-all shadow-sm"
                    >
                        Back to Dashboard
                    </button>

                    {interview?.status === 'technical_completed' && (
                        <button
                            onClick={() => navigate(`/interview/${id}/hr`)}
                            className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 font-bold flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all active:scale-95 group"
                        >
                            Next: HR Round
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    {interview?.status === 'hr_completed' && (
                        <button
                            onClick={() => navigate(`/interview/${id}`)}
                            className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95 group"
                        >
                            Next: Coding Round
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    <button
                        onClick={handleExportPDF}
                        className="sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        <Download className="w-6 h-6" />
                        <span className="hidden md:inline">Export Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewResults;
