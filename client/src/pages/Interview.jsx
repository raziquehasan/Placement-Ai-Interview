import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as interviewAPI from '../api/interview';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CodingEditor from '../components/CodingEditor';
import CodingResults from '../components/CodingResults';

const Interview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core States
    const [interview, setInterview] = useState(null);
    const [roundData, setRoundData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    // Status States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [evaluatingQuestionId, setEvaluatingQuestionId] = useState(null);
    const [roundComplete, setRoundComplete] = useState(false);

    // Coding Round States - Phase 2.3
    const [codingProblem, setCodingProblem] = useState(null);
    const [codingResults, setCodingResults] = useState(null);
    const [submittingCode, setSubmittingCode] = useState(false);
    const [pollingResults, setPollingResults] = useState(false);

    // Initial Fetch & Round Management
    const initInterview = useCallback(async () => {
        try {
            setLoading(true);
            const interviewData = await interviewAPI.getInterview(id);
            setInterview(interviewData);

            if (interviewData.status === 'completed') {
                navigate(`/feedback/${id}`);
                return;
            }

            // Redirect to HR round page ONLY if HR is in progress (not completed)
            if (interviewData.status === 'hr_in_progress') {
                navigate(`/interview/${id}/hr`);
                return;
            }

            // Start round if not started
            if (interviewData.status === 'not_started') {
                const startedData = await interviewAPI.startTechnicalRound(id);
                setRoundData(startedData);
                setCurrentQuestion(startedData.firstQuestion);
                setInterview(prev => ({ ...prev, status: 'technical_in_progress' }));
            } else if (interviewData.status.includes('technical')) {
                // Restore technical round state
                const techRound = interviewData.technicalRound;
                if (techRound) {
                    setRoundData(techRound);

                    if (techRound.status === 'completed') {
                        setRoundComplete(true);
                    } else {
                        // Find the current question (the first one without an answer)
                        const currentQ = techRound.questions.find(q => !q.userAnswer) ||
                            techRound.questions[techRound.questions.length - 1];

                        setCurrentQuestion({
                            questionId: currentQ.questionId,
                            questionNumber: techRound.questions.indexOf(currentQ) + 1,
                            category: currentQ.category,
                            questionText: currentQ.questionText
                        });

                        // Check if previous question is still evaluating
                        const lastIndex = techRound.questions.indexOf(currentQ) - 1;
                        if (lastIndex >= 0) {
                            const lastQ = techRound.questions[lastIndex];
                            if (!lastQ.aiEvaluation || !lastQ.aiEvaluation.evaluatedAt) {
                                setEvaluatingQuestionId(lastQ.questionId);
                            } else {
                                setFeedback(lastQ.aiEvaluation);
                            }
                        }
                    }
                }
            } else if (interviewData.status === 'hr_completed') {
                // HR completed, start coding round
                try {
                    const data = await interviewAPI.startCodingRound(id);
                    setCodingProblem(data.problem);
                    // Update interview status
                    const updated = await interviewAPI.getInterview(id);
                    setInterview(updated);
                } catch (err) {
                    console.error('Failed to start coding round:', err);
                    alert('Failed to start coding round');
                }
            } else if (interviewData.status.includes('coding')) {
                // Restore coding round state - Phase 2.3
                if (interviewData.status === 'coding_completed') {
                    // Fetch results
                    try {
                        const results = await interviewAPI.getCodingResults(id);
                        if (results.evaluated) {
                            setCodingResults(results);
                            setRoundComplete(true);
                        }
                    } catch (err) {
                        console.error('Failed to load coding results:', err);
                    }
                } else if (interviewData.status === 'coding_in_progress') {
                    // Start coding round
                    try {
                        const data = await interviewAPI.startCodingRound(id);
                        setCodingProblem(data.problem);
                    } catch (err) {
                        console.error('Failed to load coding problem:', err);
                    }
                }
            }

        } catch (err) {
            console.error('Error initializing interview:', err);
            alert('Failed to initialize interview session');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        initInterview();
    }, [initInterview]);

    // Polling for feedback
    useEffect(() => {
        let pollInterval;
        if (evaluatingQuestionId) {
            pollInterval = setInterval(async () => {
                try {
                    const result = await interviewAPI.getTechnicalEvaluation(id, evaluatingQuestionId);
                    if (result.evaluated) {
                        setFeedback(result.evaluation);
                        setEvaluatingQuestionId(null);
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [evaluatingQuestionId, id]);

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;

        try {
            setSubmitting(true);
            const submittedQId = currentQuestion.questionId;
            const response = await interviewAPI.submitTechnicalAnswer(id, {
                questionId: submittedQId,
                answer: answer,
                timeSpent: 60 // Dummy for now
            });

            setFeedback(null); // Clear old feedback for UI
            setEvaluatingQuestionId(submittedQId); // Start polling for THIS answer's feedback

            // Move to next question immediately
            if (response.nextQuestion) {
                setAnswer(''); // Clear textarea
                setCurrentQuestion(response.nextQuestion);
            } else {
                setRoundComplete(true);
            }
        } catch (err) {
            alert(err.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartHRRound = async () => {
        try {
            setLoading(true);
            await interviewAPI.startHRRound(id);
            // Navigate to HR round page
            navigate(`/interview/${id}/hr`);
        } catch (err) {
            alert('Failed to start HR round');
            setLoading(false);
        }
    };

    // Coding Round Handlers - Phase 2.3
    const handleStartCodingRound = async () => {
        try {
            setLoading(true);
            const data = await interviewAPI.startCodingRound(id);
            setCodingProblem(data.problem);
            setRoundComplete(false);
            // Refresh interview status
            const updated = await interviewAPI.getInterview(id);
            setInterview(updated);
        } catch (err) {
            alert('Failed to start coding round');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = async (codeData) => {
        try {
            setSubmittingCode(true);
            await interviewAPI.submitCode(id, codeData);
            // Start polling for results
            setPollingResults(true);
            pollCodingResults();
        } catch (err) {
            alert('Failed to submit code');
            setSubmittingCode(false);
        }
    };

    const pollCodingResults = async () => {
        let attempts = 0;
        const maxAttempts = 30; // 1 minute max

        const poll = async () => {
            try {
                const results = await interviewAPI.getCodingResults(id);

                if (results.evaluated) {
                    setCodingResults(results);
                    setSubmittingCode(false);
                    setPollingResults(false);
                    setRoundComplete(true);
                    // Refresh interview
                    const updated = await interviewAPI.getInterview(id);
                    setInterview(updated);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, 2000); // Poll every 2 seconds
                } else {
                    alert('Evaluation timeout. Please refresh the page.');
                    setSubmittingCode(false);
                    setPollingResults(false);
                }
            } catch (err) {
                console.error('Polling error:', err);
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, 2000);
                }
            }
        };

        poll();
    };

    const handleViewReport = () => {
        navigate(`/report/${id}`);
    };

    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>;

    if (roundComplete) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {interview?.status === 'coding_completed' || codingResults?.evaluated ? 'All Rounds Complete!' :
                        interview?.status === 'hr_completed' ? 'HR Round Complete!' :
                            'Technical Round Completed!'}
                </h1>
                <p className="text-gray-600 mb-8">
                    {interview?.status === 'coding_completed' || codingResults?.evaluated ? 'Congratulations! Your interview is complete. View your final hiring report.' :
                        interview?.status === 'hr_completed' ? 'Great job! Ready for the coding challenge?' :
                            'Great job! You\'ve successfully finished the technical assessment. The next stage is the Behavioral/HR round.'}
                </p>
                <div className="flex gap-4 justify-center">
                    {(interview?.status === 'coding_completed' || codingResults?.evaluated) ? (
                        <Button variant="primary" size="lg" onClick={handleViewReport}>
                            View Hiring Report
                        </Button>
                    ) : interview?.status === 'hr_completed' ? (
                        <Button variant="primary" size="lg" onClick={handleStartCodingRound}>
                            Start Coding Round
                        </Button>
                    ) : (
                        <Button variant="primary" size="lg" onClick={handleStartHRRound}>
                            Start HR Round
                        </Button>
                    )}
                    <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Coding Round Rendering - Phase 2.3
    if (interview?.status === 'coding_in_progress' || interview?.status === 'coding_completed') {
        if (codingResults?.evaluated) {
            // Show results
            return (
                <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Round Results</h1>
                            <p className="text-gray-600">Interview for {interview.role}</p>
                        </div>
                        <CodingResults results={codingResults} />
                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleViewReport}
                                className="px-12"
                            >
                                View Final Hiring Report
                            </Button>
                        </div>
                    </div>
                </div>
            );
        } else if (codingProblem) {
            // Show editor
            return (
                <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Round</h1>
                            <p className="text-gray-600">Interview for {interview.role}</p>
                        </div>
                        <CodingEditor
                            problem={codingProblem}
                            onSubmit={handleSubmitCode}
                            isSubmitting={submittingCode || pollingResults}
                        />
                    </div>
                </div>
            );
        }
    }

    if (!currentQuestion) return null;

    const totalQuestions = roundData?.totalQuestions || 10;
    const currentNum = currentQuestion.questionNumber || 1;
    const progress = (currentNum / totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {interview.role} - {interview.status.includes('technical') ? 'Technical Round' : 'HR Round'}
                        </h1>
                        <p className="text-sm text-gray-500">Target Level: {interview.difficulty}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-gray-700">Question {currentNum} of {totalQuestions}</span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-8 mb-6 border-none shadow-premium bg-white">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                                {currentQuestion.category}
                            </span>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
                                {currentQuestion.questionText}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Response Console</label>
                            <textarea
                                className="w-full h-64 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none bg-gray-50/30 text-lg"
                                placeholder="Analyze the problem and provide your structured solution here..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={submitting}
                            ></textarea>
                        </div>
                    </Card>

                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400 font-medium">Session auto-persisted to cloud</p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSubmitAnswer}
                            loading={submitting}
                            disabled={!answer.trim() || submitting}
                            className="px-12 shadow-lg shadow-primary-200"
                        >
                            {currentNum === totalQuestions ? 'Finish Round' : 'Submit & Next'}
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <aside className="sticky top-10 space-y-6">
                        <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Live AI Evaluation
                            </h3>

                            {evaluatingQuestionId ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                    <div className="py-4 text-center text-slate-400 text-sm italic">
                                        Analyzing your previous answer logic...
                                    </div>
                                </div>
                            ) : feedback ? (
                                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Score</span>
                                        <span className={`text-xl font-bold ${feedback.score >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {feedback.score}/10
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Strengths</h4>
                                        <div className="text-sm text-slate-200 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                            {Array.isArray(feedback.strengths) ? feedback.strengths.join(', ') : feedback.strengths}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Areas to Improve</h4>
                                        <div className="text-sm text-slate-200 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                            {Array.isArray(feedback.weaknesses) ? feedback.weaknesses.join(', ') : feedback.weaknesses}
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800">
                                        <p className="text-[10px] text-slate-500">Evaluation based on industry standards for {interview.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="mb-4 opacity-20 transform scale-125">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400 text-sm">Submit your first answer to activate real-time AI feedback.</p>
                                </div>
                            )}
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Interview;
