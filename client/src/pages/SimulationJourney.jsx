import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FiCheckCircle,
    FiPlay,
    FiClock,
    FiAlertCircle,
    FiChevronRight,
    FiFileText,
    FiUsers,
    FiMonitor
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ROUND_ICONS = {
    'OA': <FiClock />,
    'Technical': <FiFileText />,
    'Panel': <FiUsers />,
    'HR': <FiMonitor />,
    'Final': <FiCheckCircle />
};

const SimulationJourney = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/simulation/session/${id}`, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setSession(res.data.data);
            } catch (err) {
                console.error('Error fetching session:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id, currentUser]);

    const handleContinue = (round) => {
        if (round.type === 'OA') {
            navigate(`/simulation/session/${id}/oa`);
        } else {
            navigate(`/simulation/session/${id}/panel`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    const currentRound = session.rounds[session.currentRoundIndex];
    const progress = (session.currentRoundIndex / session.rounds.length) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header / Meta */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-[2.5rem] p-8 mb-12 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2 block">Active Mission</span>
                        <h1 className="text-4xl font-extrabold text-white mb-2">
                            {session.pipelineId?.name || 'Simulation'} <span className="text-slate-500">Hiring Track</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Session ID: <span className="text-slate-500 font-mono text-xs">{id}</span></p>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-black text-indigo-500">{Math.round(progress)}%</div>
                        <div className="text-slate-500 font-bold uppercase tracking-tighter text-xs">Overall Progress</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-[34px] top-4 bottom-4 w-1 bg-slate-800 rounded-full" />

                {session.rounds.map((round, idx) => {
                    const isCompleted = idx < session.currentRoundIndex;
                    const isCurrent = idx === session.currentRoundIndex;
                    const isPending = idx > session.currentRoundIndex;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative flex items-start gap-8 p-6 rounded-3xl transition-all border ${isCurrent ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' :
                                isCompleted ? 'bg-slate-900/40 border-slate-700/30 opacity-70' :
                                    'bg-slate-900/20 border-transparent grayscale'
                                }`}
                        >
                            {/* Round Icon */}
                            <div className={`z-10 w-12 h-12 flex items-center justify-center rounded-2xl text-xl shrink-0 ${isCurrent ? 'bg-indigo-500 text-white animate-pulse' :
                                isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-slate-800 text-slate-500'
                                }`}>
                                {isCompleted ? <FiCheckCircle /> : ROUND_ICONS[round.type] || <FiActivity />}
                            </div>

                            {/* Round Content */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className={`text-xl font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                                            Step {idx + 1}: {round.title || round.type}
                                        </h3>
                                        <div className="flex gap-4 mt-2">
                                            <span className="text-slate-500 text-xs font-bold uppercase flex items-center">
                                                <FiTarget className="mr-1" /> {round.type} Phase
                                            </span>
                                            {isCompleted && (
                                                <span className="text-emerald-500 text-xs font-bold uppercase flex items-center">
                                                    <FiCheckCircle className="mr-1" /> Score: {Math.round(round.score || 0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {isCurrent && session.status === 'Active' && (
                                        <button
                                            onClick={() => handleContinue(round)}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center transition-all shadow-lg hover:shadow-indigo-500/20"
                                        >
                                            <FiPlay className="mr-2" /> Start Phase
                                        </button>
                                    )}
                                    {isPending && (
                                        <div className="text-slate-600 px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold flex items-center">
                                            <FiLock className="mr-2" /> Locked
                                        </div>
                                    )}
                                </div>

                                {isCurrent && session.status === 'Active' && (
                                    <div className="mt-4 p-4 bg-slate-900/60 rounded-2xl border border-indigo-500/10">
                                        <p className="text-slate-400 text-sm italic">
                                            "This phase evaluates your {round.type === 'OA' ? 'problem-solving and analytical speed' : 'technical depth and system-design intuition'} under company-realistic conditions."
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Final Report CTA */}
            {(session.status === 'Completed' || session.currentRoundIndex >= session.rounds.length) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-[2.5rem] text-center shadow-2xl"
                >
                    <h2 className="text-2xl font-bold text-white mb-2">Simulation Complete!</h2>
                    <p className="text-indigo-100 mb-6 font-medium">Your performance data has been analyzed by the AI Panel.</p>
                    <button
                        onClick={() => navigate(`/simulation/session/${id}/report`)}
                        className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl"
                    >
                        View Final Insights & Roadmap
                    </button>
                </motion.div>
            )}

            {/* Exit/Abandon Button */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => navigate('/simulation')}
                    className="text-slate-500 hover:text-white font-bold text-sm flex items-center transition-colors"
                >
                    Abandon Mission <FiAlertCircle className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default SimulationJourney;
