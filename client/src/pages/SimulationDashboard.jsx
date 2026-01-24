import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowRight,
    FiBriefcase,
    FiActivity,
    FiTarget,
    FiLock,
    FiSearch
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const SimulationDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/simulation/companies`, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                setCompanies(res.data.data);
            } catch (err) {
                console.error('Error fetching companies:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [currentUser]);

    const startSimulation = async (companyId) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/simulation/start`, {
                companyId,
                mode: 'Realistic',
                difficultyScale: 'Entry'
            }, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });

            navigate(`/simulation/${res.data.data._id}/journey`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error starting simulation');
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header section */}
            <div className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold text-white sm:text-5xl"
                >
                    Hiring Simulations <span className="text-indigo-500">2.0</span>
                </motion.h1>
                <p className="mt-4 text-xl text-slate-400">
                    Master the actual hiring patterns of top-tier companies.
                </p>

                {/* Search Bar */}
                <div className="mt-8 relative max-w-xl mx-auto">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                    <input
                        type="text"
                        placeholder="Search Company (Google, Amazon, TCS...)"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Company Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompanies.map((company, index) => (
                    <motion.div
                        key={company._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-slate-900/40 border border-slate-700/50 rounded-3xl p-6 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all backdrop-blur-xl overflow-hidden"
                    >
                        {/* Status Badges */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${company.category === 'Tech-Giant' ? 'bg-indigo-500/20 text-indigo-400' :
                                        company.category === 'Startup' ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {company.category}
                                </span>
                                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold">
                                    V1.2
                                </span>
                            </div>
                            <div className="flex items-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <FiActivity className="mr-1" />
                                <span className="text-xs font-medium">98% Match</span>
                            </div>
                        </div>

                        {/* Company Content */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{company.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                {company.description || `Simulated ${company.name} interview pipeline covering OA, Tech rounds, and Behavioral evaluation.`}
                            </p>
                        </div>

                        {/* Pipeline Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/30">
                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Rounds</span>
                                <span className="text-white text-sm font-semibold">4/4 Enabled</span>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/30">
                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Pass Ratio</span>
                                <span className="text-white text-sm font-semibold">12.5%</span>
                            </div>
                        </div>

                        {/* Features Chips */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {['OA', 'Panel', 'Video'].map(feature => (
                                <span key={feature} className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-800/80 px-2 py-1 rounded-md">
                                    <FiTarget className="mr-1" /> {feature}
                                </span>
                            ))}
                        </div>

                        {/* Action CTA */}
                        <button
                            onClick={() => startSimulation(company._id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                        >
                            Start Realistic Simulation
                            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Animated background element */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-colors"></div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Notice */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-3 text-slate-500 text-sm backdrop-blur-md">
                    <FiLock className="mr-2" /> Realistic mode preserves company cooldown policies (Cooldown: 180 Days)
                </div>
            </div>
        </div>
    );
};

export default SimulationDashboard;
