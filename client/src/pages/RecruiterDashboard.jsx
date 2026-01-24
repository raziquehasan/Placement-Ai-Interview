import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiCheckCircle,
    FiTrendingUp,
    FiPieChart,
    FiActivity,
    FiSearch
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/simulation/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setStats(res.data.data);
            } catch (err) {
                console.error('Admin Dashboard Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [currentUser]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Recruiter <span className="text-indigo-500">Analytics</span></h1>
                    <p className="text-slate-500 font-medium italic">High-integrity hiring funnel & candidate intelligence.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-400">
                        <FiSearch />
                    </div>
                </div>
            </header>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Simulations', v: stats.metrics.total, icon: <FiUsers />, color: 'text-indigo-500' },
                    { label: 'Hiring Sessions', v: stats.metrics.completed, icon: <FiCheckCircle />, color: 'text-emerald-500' },
                    { label: 'Avg Prob', v: '68%', icon: <FiTrendingUp />, color: 'text-amber-500' },
                    { label: 'Integrity Rating', v: '94%', icon: <FiActivity />, color: 'text-indigo-400' }
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4 ${m.color}`}>
                            {m.icon}
                        </div>
                        <div className="text-3xl font-black text-white">{m.v}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{m.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pipeline Health (Bar Chart Sim) */}
                <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                        <FiPieChart className="text-indigo-500" /> Pipeline Health
                    </h3>
                    <div className="space-y-6">
                        {stats.stats.map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    <span>{s._id}</span>
                                    <span>{s.count} Candidates</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(s.count / stats.metrics.total) * 100}%` }}
                                        className={`h-full ${s._id === 'Completed' ? 'bg-emerald-500' : s._id === 'Rejected' ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                        <FiActivity className="text-indigo-500" /> Recent Audit Logs
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-800">
                                <tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                    <th className="pb-4 px-2">Candidate</th>
                                    <th className="pb-4 px-2">Action</th>
                                    <th className="pb-4 px-2">Platform Context</th>
                                    <th className="pb-4 px-2">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {stats.recentActivity.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 px-2">
                                            <div className="text-sm font-bold text-slate-200">{log.userId?.name || 'User'}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{log.userId?.email}</div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-black uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-xs text-slate-500">
                                            {log.details?.roundType || 'General'} Phase
                                        </td>
                                        <td className="py-4 px-2">
                                            {log.action === 'SHORTLISTED' ? (
                                                <span className="text-emerald-500 font-bold text-xs uppercase">Advancing</span>
                                            ) : log.action === 'REJECTED' ? (
                                                <span className="text-red-500 font-bold text-xs uppercase">Halted</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-bold uppercase">Logged</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
