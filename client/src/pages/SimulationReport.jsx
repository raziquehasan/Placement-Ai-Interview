import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FiTrendingUp,
    FiAward,
    FiBookOpen,
    FiTarget,
    FiArrowLeft,
    FiDownload,
    FiCheckCircle,
    FiXCircle,
    FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const SimulationReport = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const finalize = async () => {
            try {
                // Finalize call triggers calculation if not already done
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/session/${id}/finalize`, {}, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setData(res.data.data);
            } catch (err) {
                console.error('Finalization Error:', err);
            } finally {
                setLoading(false);
            }
        };
        finalize();
    }, [id, currentUser]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            <div className="text-center">
                <FiZap className="w-16 h-16 text-indigo-500 animate-pulse mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-2">Analyzing Performance</h2>
                <p className="text-slate-500">Normalizing scores and generating your mentor plan...</p>
            </div>
        </div>
    );

    const { probability, mentorPlan, status } = data;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Top Nav */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <button
                    onClick={() => navigate('/simulation')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <FiArrowLeft /> Back to Simulation
                </button>
                <div className="flex gap-4">
                    <button className="bg-slate-900 border border-slate-800 p-3 rounded-xl hover:bg-slate-800 transition-all">
                        <FiDownload />
                    </button>
                    <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transition-all">
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Hero Results Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Probability Gauge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] text-center backdrop-blur-xl"
                    >
                        <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-center">Offer Probability</h3>
                        <div className="relative inline-flex items-center justify-center mb-8">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" strokeWidth="12" stroke="currentColor" fill="transparent" className="text-slate-800" />
                                <motion.circle
                                    cx="96" cy="96" r="88" strokeWidth="12" strokeDasharray={552}
                                    initial={{ strokeDashoffset: 552 }}
                                    animate={{ strokeDashoffset: 552 - (552 * probability.value) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    stroke="currentColor" fill="transparent" strokeLinecap="round" className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black">{probability.value}%</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Hiring Chance</span>
                            </div>
                        </div>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {status === 'Completed' ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Mission Status: {status}
                        </div>
                    </motion.div>

                    {/* Breakdown Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] backdrop-blur-xl"
                    >
                        <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Diagnostic Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400 text-sm font-bold">Base Average</span>
                                        <span className="text-white font-bold">{probability.breakdown.rawAverage}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${probability.breakdown.rawAverage}%` }} className="h-full bg-slate-600" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400 text-sm font-bold">Tier Adjustment ({probability.breakdown.tierAdjustment})</span>
                                        <span className="text-indigo-400 font-bold">Normalized</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${probability.breakdown.normalized}%` }} className="h-full bg-indigo-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/30">
                                <h4 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">AI Panel Insight</h4>
                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                    "{probability.explanation}"
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-slate-800/30 p-4 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><FiTarget /></div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-black block">Integrity Penalty</span>
                                    <span className="text-lg font-bold">-{probability.breakdown.integrityPenalty}%</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-800/30 p-4 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><FiZap /></div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-black block">Tier Factor</span>
                                    <span className="text-lg font-bold">0.75x</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Mentor Roadmap Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Weekly Roadmap */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-10">
                                <FiBookOpen className="text-indigo-400" />
                                4-Week Mastery Roadmap
                            </h3>
                            <div className="space-y-6">
                                {mentorPlan.weeklyRoadmap && Object.entries(mentorPlan.weeklyRoadmap).map(([week, plan], idx) => (
                                    <div key={idx} className="relative pl-12 pb-8 border-l border-slate-800 last:pb-0">
                                        <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        </div>
                                        <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">Week {idx + 1}</h4>
                                        <p className="text-slate-300 font-medium leading-relaxed">{plan}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
                            <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                                <FiAward className="text-emerald-400" />
                                Recommended Skill Drills
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {mentorPlan.drills && mentorPlan.drills.map((drill, idx) => (
                                    <div key={idx} className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-3xl hover:border-emerald-500/30 transition-all cursor-default">
                                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400 leading-snug">{drill}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Target Companies & Weak Areas */}
                    <div className="space-y-8">
                        <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-[0_20px_40px_rgba(79,70,229,0.3)]">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Personal Coach Summary</h3>
                            <p className="text-white font-medium text-lg leading-relaxed mb-8">
                                "{mentorPlan.summary}"
                            </p>
                            <button className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
                                Chat with AI Mentor
                            </button>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
                            <h3 className="text-white font-bold mb-6">Target Companies</h3>
                            <div className="space-y-4">
                                {mentorPlan.targetCompanies && mentorPlan.targetCompanies.map((co, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                                        <span className="font-bold text-slate-300">{co}</span>
                                        <span className="text-[10px] font-black uppercase text-indigo-400">High fit</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem]">
                            <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6 text-center">Focus Skill Gaps</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {mentorPlan.weakAreas && mentorPlan.weakAreas.map((area, idx) => (
                                    <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold">
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationReport;
