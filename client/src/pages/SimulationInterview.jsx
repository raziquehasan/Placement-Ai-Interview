import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageSquare,
    FiSend,
    FiTerminal,
    FiCheckCircle,
    FiAlertCircle,
    FiUser,
    FiCpu
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const PERSONA_COLORS = {
    'LeadEngineer': 'text-indigo-400',
    'BehavioralJudge': 'text-emerald-400',
    'SilentScorer': 'text-slate-400'
};

const SimulationInterview = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/session/${id}/panel/start`, {}, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setSession(res.data.data);

                // Initial AI Message
                setMessages([{
                    role: 'LeadEngineer',
                    text: `Hello ${currentUser.displayName || 'Candidate'}. I'm the Lead Engineer on this panel. We've reviewed your OA results. Let's start with a technical deep dive. Can you explain your approach to optimizing high-concurrency database writes?`,
                    timestamp: new Date()
                }]);
            } catch (err) {
                console.error('Interview Start Error:', err);
                navigate(`/simulation/${id}/journey`);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [id, currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || evaluating) return;

        const userMsg = { role: 'candidate', text: inputValue, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setEvaluating(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/session/${id}/panel/submit`, {
                response: {
                    question: messages[messages.length - 1].text,
                    answer: inputValue
                }
            }, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });

            const { evaluation } = res.data.data;

            // Add Agent Responses
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'LeadEngineer',
                    text: evaluation.agentLogs.leadEngineer,
                    timestamp: new Date()
                }]);
            }, 1000);

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'BehavioralJudge',
                    text: evaluation.agentLogs.behavioralJudge,
                    timestamp: new Date()
                }]);
            }, 3000);

            // If passed, add "next round" internal logic or show "Continue"
            if (res.data.data.passed) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'system',
                        text: "Congratulations! The panel has shortlisted you for the next phase. You can now return to the journey tracker.",
                        type: 'success'
                    }]);
                    setEvaluating(false);
                }, 5000);
            } else {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'system',
                        text: "Thank you for your time. The panel has decided not to move forward at this stage. You can review the mentor plan in your dashboard.",
                        type: 'error'
                    }]);
                    setEvaluating(false);
                }, 5000);
            }

        } catch (err) {
            console.error('Submit Error:', err);
            setEvaluating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto h-screen flex flex-col p-4 md:p-8">
            {/* Header */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 mb-6 flex justify-between items-center backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-500/20 p-3 rounded-2xl">
                        <FiTerminal className="text-indigo-400 text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{session.roundInfo.title}</h2>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">AI Panel Interview</span>
                    </div>
                </div>
                <div className="flex -space-x-3">
                    {['LE', 'BJ', 'SS'].map((agent, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {agent}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-8 px-4 py-8 custom-scrollbar">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'system' ? (
                            <div className={`w-full text-center p-4 rounded-2xl border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-500'
                                }`}>
                                <FiCheckCircle className="inline mr-2" /> {msg.text}
                                {msg.type === 'success' && (
                                    <button
                                        onClick={() => navigate(`/simulation/${id}/journey`)}
                                        className="block mx-auto mt-4 underline font-bold"
                                    >
                                        Return to Journey
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`max-w-[80%] flex gap-4 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${msg.role === 'candidate' ? 'bg-indigo-600' : 'bg-slate-800'
                                    }`}>
                                    {msg.role === 'candidate' ? <FiUser /> : <FiCpu className={PERSONA_COLORS[msg.role]} />}
                                </div>
                                <div className={`p-6 rounded-[2rem] ${msg.role === 'candidate'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-900/80 text-slate-300 rounded-tl-none border border-slate-800'
                                    } shadow-xl`}>
                                    {msg.role !== 'candidate' && (
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${PERSONA_COLORS[msg.role]}`}>
                                            {msg.role.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                    )}
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
                {evaluating && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Panel is deliberating...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-8 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-3xl py-6 pl-8 pr-24 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-2xl transition-all"
                    disabled={evaluating}
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || evaluating}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-lg"
                >
                    <FiSend className="text-xl" />
                </button>
            </form>
        </div>
    );
};

export default SimulationInterview;
