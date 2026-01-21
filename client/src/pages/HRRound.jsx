/**
 * HR Round Page - Phase 2.2
 * Behavioral interview interface with soft-skills analysis
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, SkipForward, Brain, Shield, UserCheck } from 'lucide-react';
import interviewService from '../services/interviewService';
import Timer from '../components/interview/Timer';
import ProgressTracker from '../components/interview/ProgressTracker';
import QuestionCard from '../components/interview/QuestionCard';
import AnswerEditor from '../components/interview/AnswerEditor';
import EvaluationPanel from '../components/interview/EvaluationPanel';

const HRRound = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [round, setRound] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [questionTime, setQuestionTime] = useState(0);
    const [evaluation, setEvaluation] = useState(null);
    const [evaluationStatus, setEvaluationStatus] = useState('not_started');
    const [progress, setProgress] = useState({ answered: 0, total: 8 }); // HR round is usually shorter
    const [error, setError] = useState(null);

    // Start HR round on mount
    useEffect(() => {
        startRound();
    }, [id]);

    // Poll for HR evaluation after submission
    useEffect(() => {
        if (evaluationStatus === 'evaluating' && currentQuestion) {
            const pollInterval = setInterval(async () => {
                try {
                    const result = await interviewService.getHREvaluation(id, currentQuestion.questionId);

                    if (result.evaluated) {
                        setEvaluation(result.evaluation);
                        setEvaluationStatus('complete');
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Error polling HR evaluation:', err);
                }
            }, 3000);

            return () => clearInterval(pollInterval);
        }
    }, [evaluationStatus, currentQuestion, id]);

    // Auto-save draft
    useEffect(() => {
        if (answer && currentQuestion) {
            const saveInterval = setInterval(() => {
                localStorage.setItem(`draft_hr_${currentQuestion.questionId}`, answer);
            }, 30000);

            return () => clearInterval(saveInterval);
        }
    }, [answer, currentQuestion]);

    const startRound = async () => {
        try {
            setLoading(true);
            const data = await interviewService.startHRRound(id);

            setRound(data);
            setCurrentQuestion(data.firstQuestion);
            setProgress({ answered: 0, total: data.totalQuestions });

            // Restore draft
            const draft = localStorage.getItem(`draft_hr_${data.firstQuestion.questionId}`);
            if (draft) {
                setAnswer(draft);
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) {
            alert('Please provide your response before submitting');
            return;
        }

        try {
            setSubmitting(true);
            setEvaluationStatus('evaluating');

            const result = await interviewService.submitHRAnswer(
                id,
                currentQuestion.questionId,
                answer,
                questionTime
            );

            // Update progress
            setProgress(result.progress);

            // Clear draft
            localStorage.removeItem(`draft_hr_${currentQuestion.questionId}`);

            // Check if interview is complete
            if (!result.nextQuestion) {
                // Round complete
                setTimeout(() => {
                    navigate(`/interview/${id}/results`);
                }, 3000);
                return;
            }

            // Set next question after a brief feedback period
            setTimeout(() => {
                setCurrentQuestion(result.nextQuestion);
                setAnswer('');
                setQuestionTime(0);
                setEvaluation(null);
                setEvaluationStatus('not_started');
                setSubmitting(false);
            }, 5000);

        } catch (err) {
            setError(err.message);
            setSubmitting(false);
            setEvaluationStatus('not_started');
        }
    };

    const handleSkip = () => {
        if (window.confirm('Skip this behavioral question? Detailed answers help in personality profiling.')) {
            handleSubmit();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <div className="text-gray-600 text-lg font-medium">Preparing behavioral interview...</div>
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
                    <h2 className="text-gray-900 text-xl font-bold mb-2">Round Error</h2>
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
            <div className="max-w-5xl mx-auto px-4">
                {/* HR Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-50 p-3 rounded-xl text-green-600">
                                <UserCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Behavioral Interview
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Conducted by: <span className="text-green-600 font-medium">{round?.aiPersona || 'Senior HR Lead'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tone Check</span>
                                <span className="text-sm font-medium text-gray-700">Conversational</span>
                            </div>
                            <Timer
                                label="Question Timer"
                                onTimeUpdate={setQuestionTime}
                                isPaused={submitting}
                            />
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                                <span className="text-lg font-bold text-gray-900">{Math.round((progress.answered / progress.total) * 100)}%</span>
                            </div>
                            <ProgressTracker
                                answered={progress.answered}
                                total={progress.total}
                            />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <Brain className="w-8 h-8 opacity-80" />
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest">Live Analysis</span>
                        </div>
                        <div>
                            <p className="text-xs opacity-80 mb-1 leading-tight">Current Focus</p>
                            <p className="text-lg font-bold truncate">Soft Skills & STAR Method</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Question Card */}
                    <QuestionCard
                        question={currentQuestion}
                        questionNumber={progress.answered + 1}
                        total={progress.total}
                    />

                    {/* Editor */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                        <AnswerEditor
                            value={answer}
                            onChange={setAnswer}
                            disabled={submitting || evaluationStatus === 'evaluating'}
                            placeholder="Share your experience using the STAR method (Situation, Task, Action, Result)..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-10">
                        <button
                            onClick={handleSkip}
                            disabled={submitting}
                            className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-white hover:text-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                            <SkipForward className="w-5 h-5" />
                            Skip for Now
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !answer.trim()}
                            className="w-full sm:w-auto px-10 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-xl shadow-green-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 font-bold text-lg"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Response</span>
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Real-time Feedback Panel */}
                    {evaluationStatus !== 'not_started' && (
                        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <EvaluationPanel
                                evaluation={evaluation}
                                status={evaluationStatus}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRRound;
