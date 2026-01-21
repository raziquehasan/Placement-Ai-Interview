import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as interviewAPI from '../api/interview';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Interview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const interviewData = await interviewAPI.getInterview(id);
                setInterview(interviewData);
                setQuestions(interviewData.questions || []);

                // Initialize answers from existing ones if any
                const existingAnswers = {};
                interviewData.answers?.forEach(a => {
                    existingAnswers[a.questionId] = a.answer;
                });
                setAnswers(existingAnswers);

                if (interviewData.status === 'completed') {
                    navigate(`/feedback/${id}`);
                }
            } catch (err) {
                console.error('Error fetching interview:', err);
                alert('Failed to load interview');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [id, navigate]);

    const handleAnswerChange = (e) => {
        setAnswers({
            ...answers,
            [questions[currentIndex].questionId]: e.target.value
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer
            }));

            await interviewAPI.submitAnswers(id, formattedAnswers);
            navigate(`/feedback/${id}`);
        } catch (err) {
            alert(err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><LoadingSpinner size="lg" /></div>;
    if (!questions.length) return <div className="p-8 text-center text-gray-500">No questions found for this interview.</div>;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{interview.jobRole} Interview</h1>
                        <p className="text-sm text-gray-500 capitalize">{interview.difficulty} Level</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-gray-700">Question {currentIndex + 1} of {questions.length}</span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            <Card className="p-8 mb-8">
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                        {currentQuestion.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
                        {currentQuestion.question}
                    </h2>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                    <textarea
                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none resize-none bg-gray-50/50"
                        placeholder="Type your answer here... Be as detailed as possible."
                        value={answers[currentQuestion.questionId] || ''}
                        onChange={handleAnswerChange}
                    ></textarea>
                    <p className="text-xs text-gray-400">Pro-tip: Precise and structured answers receive better AI feedback.</p>
                </div>
            </Card>

            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0 || submitting}
                >
                    Previous
                </Button>

                {currentIndex === questions.length - 1 ? (
                    <Button
                        variant="secondary"
                        onClick={handleSubmit}
                        loading={submitting}
                        className="px-8"
                    >
                        Submit Interview
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.questionId]?.trim() || submitting}
                    >
                        Next Question
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Interview;
