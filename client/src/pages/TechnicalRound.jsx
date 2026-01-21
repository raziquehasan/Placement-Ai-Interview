/**
 * Technical Round Page - Phase 2.1
 * Main interview interface with real-time evaluation
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, SkipForward } from 'lucide-react';
import interviewService from '../services/interviewService';
import Timer from '../components/interview/Timer';
import ProgressTracker from '../components/interview/ProgressTracker';
import QuestionCard from '../components/interview/QuestionCard';
import AnswerEditor from '../components/interview/AnswerEditor';
import EvaluationPanel from '../components/interview/EvaluationPanel';

const TechnicalRound = () => {
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
    const [progress, setProgress] = useState({ answered: 0, total: 10 });
    const [error, setError] = useState(null);

    // Start technical round on mount
    useEffect(() => {
        startRound();
    }, [id]);

    // Poll for evaluation after submission
    useEffect(() => {
        if (evaluationStatus === 'evaluating' && currentQuestion) {
            const pollInterval = setInterval(async () => {
                try {
                    const result = await interviewService.getEvaluation(id, currentQuestion.questionId);

                    if (result.evaluated) {
                        setEvaluation(result.evaluation);
                        setEvaluationStatus('complete');
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Error polling evaluation:', err);
                }
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(pollInterval);
        }
    }, [evaluationStatus, currentQuestion, id]);

    // Auto-save draft every 30 seconds
    useEffect(() => {
        if (answer && currentQuestion) {
            const saveInterval = setInterval(() => {
                localStorage.setItem(`draft_${currentQuestion.questionId}`, answer);
            }, 30000);

            return () => clearInterval(saveInterval);
        }
    }, [answer, currentQuestion]);

    const startRound = async () => {
        try {
            setLoading(true);
            const data = await interviewService.startTechnicalRound(id);

            setRound(data);
            setCurrentQuestion(data.firstQuestion);
            setProgress({ answered: 0, total: data.totalQuestions });

            // Restore draft if exists
            const draft = localStorage.getItem(`draft_${data.firstQuestion.questionId}`);
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
            alert('Please provide an answer before submitting');
            return;
        }

        try {
            setSubmitting(true);
            setEvaluationStatus('evaluating');

            const result = await interviewService.submitAnswer(
                id,
                currentQuestion.questionId,
                answer,
                questionTime
            );

            // Update progress
            setProgress(result.progress);

            // Clear draft
            localStorage.removeItem(`draft_${currentQuestion.questionId}`);

            // Check if interview is complete
            if (!result.nextQuestion) {
                // Interview complete, redirect to results
                setTimeout(() => {
                    navigate(`/interview/${id}/results`);
                }, 2000);
                return;
            }

            // Set next question after showing evaluation
            setTimeout(() => {
                setCurrentQuestion(result.nextQuestion);
                setAnswer('');
                setQuestionTime(0);
                setEvaluation(null);
                setEvaluationStatus('not_started');
            }, 5000); // Wait 5 seconds to show evaluation

            setSubmitting(false);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
            setEvaluationStatus('not_started');
        }
    };

    const handleSkip = () => {
        if (window.confirm('Are you sure you want to skip this question? You won\'t be able to come back.')) {
            handleSubmit();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Starting technical round...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
                    <h2 className="text-red-800 font-semibold mb-2">Error</h2>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Technical Interview
                            </h1>
                            <p className="text-gray-600">
                                AI Persona: {round?.aiPersona || 'Senior Software Engineer'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Timer
                                label="Question Time"
                                onTimeUpdate={setQuestionTime}
                                isPaused={submitting}
                            />
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <ProgressTracker
                        answered={progress.answered}
                        total={progress.total}
                    />
                </div>

                {/* Question */}
                <div className="mb-6">
                    <QuestionCard
                        question={currentQuestion}
                        questionNumber={progress.answered + 1}
                        total={progress.total}
                    />
                </div>

                {/* Answer Editor */}
                <div className="mb-6">
                    <AnswerEditor
                        value={answer}
                        onChange={setAnswer}
                        disabled={submitting || evaluationStatus === 'evaluating'}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mb-6">
                    <button
                        onClick={handleSkip}
                        disabled={submitting}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <SkipForward className="w-5 h-5" />
                        Skip Question
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !answer.trim()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                        {!submitting && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>

                {/* Evaluation Panel */}
                {evaluationStatus !== 'not_started' && (
                    <div className="mb-6">
                        <EvaluationPanel
                            evaluation={evaluation}
                            status={evaluationStatus}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicalRound;
