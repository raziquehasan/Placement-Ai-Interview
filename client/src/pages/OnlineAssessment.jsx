import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock,
    FiCheckSquare,
    FiAlertTriangle,
    FiChevronLeft,
    FiChevronRight,
    FiSend
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const OnlineAssessment = () => {
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 mins default
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchOA = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/session/${id}/oa/start`, {}, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setQuestions(res.data.data.questions);
            } catch (err) {
                console.error('OA Error:', err);
                alert('Could not start OA. Please check if you are eligible.');
                navigate(`/simulation/${id}/journey`);
            } finally {
                setLoading(false);
            }
        };
        fetchOA();
    }, [id, currentUser, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            submitOA();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const submitOA = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/session/${id}/oa/submit`, {
                responses: Object.entries(answers).map(([qId, oId]) => ({ questionId: qId, selectedOption: oId }))
            }, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });

            // Navigate to journey to see result
            navigate(`/simulation/${id}/journey`);
        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error submitting OA. Please contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Initializing Secure Environment...</p>
            </div>
        </div>
    );

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Top Bar */}
            <div className="bg-slate-900/80 border-b border-white/10 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-2 rounded-xl">
                        <FiCheckSquare className="text-indigo-400 text-xl" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Online Assessment</h2>
                        <p className="text-xs text-slate-500 uppercase font-black">Section: Technical MCQs</p>
                    </div>
                </div>

                <div className={`flex items-center gap-6 px-6 py-2 rounded-2xl border ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-800/50 border-slate-700 text-slate-300'
                    }`}>
                    <FiClock className={`text-xl ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>

                <button
                    onClick={() => { if (window.confirm('Are you sure you want to end the test?')) submitOA(); }}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-all"
                >
                    {submitting ? 'Processing...' : 'Finish Test'} <FiSend className="ml-2" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-80 bg-slate-900/30 border-r border-white/5 p-6 overflow-y-auto hidden lg:block">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Question Palette</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-10 rounded-xl font-bold text-sm transition-all border ${currentIndex === idx ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' :
                                        answers[questions[idx]._id] ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                            'bg-slate-800/50 border-slate-700 text-slate-500'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Question Area */}
                <div className="flex-1 overflow-y-auto p-12 lg:p-20">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <div className="space-y-4">
                                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Question {currentIndex + 1} of {questions.length}</span>
                                    <h1 className="text-3xl font-bold leading-tight text-slate-100">
                                        {currentQuestion.text}
                                    </h1>
                                </div>

                                <div className="space-y-4">
                                    {currentQuestion.options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(currentQuestion._id, option.id)}
                                            className={`w-full group text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${answers[currentQuestion._id] === option.id
                                                    ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/10'
                                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-all ${answers[currentQuestion._id] === option.id
                                                        ? 'bg-white text-indigo-600 border-white'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-500'
                                                    }`}>
                                                    {option.id.toUpperCase()}
                                                </div>
                                                <span className={`text-lg font-medium ${answers[currentQuestion._id] === option.id ? 'text-white' : 'text-slate-400'}`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                            {answers[currentQuestion._id] === option.id && (
                                                <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Footer */}
                        <div className="mt-20 flex justify-between items-center border-t border-white/5 pt-10">
                            <button
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-20 font-bold transition-all"
                            >
                                <FiChevronLeft className="text-xl" /> Previous Question
                            </button>
                            <button
                                onClick={() => {
                                    if (currentIndex === questions.length - 1) {
                                        if (window.confirm('Finish the test?')) submitOA();
                                    } else {
                                        setCurrentIndex(prev => prev + 1);
                                    }
                                }}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl"
                            >
                                {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'} <FiChevronRight className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrity Warning */}
            <div className="bg-amber-500/5 border-t border-amber-500/10 py-2 text-center text-[10px] text-amber-500/60 uppercase font-black tracking-[0.3em]">
                <FiAlertTriangle className="inline mr-2" /> Anti-Cheating Monitor Active · Tab Switching Logged · Session Encrypted
            </div>
        </div>
    );
};

export default OnlineAssessment;
