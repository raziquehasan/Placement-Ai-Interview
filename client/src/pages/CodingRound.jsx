import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as interviewAPI from '../api/interview';
import CodingEditor from '../components/CodingEditor';
import CodingResults from '../components/CodingResults';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    Clock,
    ChevronRight,
    CheckCircle,
    Lock,
    AlertTriangle,
    Save,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodingRound = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // UI State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeProblemId, setActiveProblemId] = useState(null);
    const [results, setResults] = useState(null);
    const [polling, setPolling] = useState(false);

    // Round Data
    const [roundData, setRoundData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);

    // Draft Auto-save ref
    const draftTimerRef = useRef(null);

    // Initialization
    const initRound = useCallback(async () => {
        try {
            setLoading(true);
            const data = await interviewAPI.startCodingRound(id);
            setRoundData(data);

            // Find current active problem
            const currentProblem = data.problems[data.currentProblemIndex];
            setActiveProblemId(currentProblem.problemId);

            // Setup Timer
            const deadline = new Date(data.deadline).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((deadline - now) / 1000)));

        } catch (error) {
            console.error('Failed to init coding round:', error);
            alert('Error loading coding round');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        initRound();
    }, [initRound]);

    // Global Timer Effect
    useEffect(() => {
        if (timeLeft <= 0) {
            if (timeLeft === 0 && roundData) setIsTimeUp(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, roundData]);

    // Integrity: Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                interviewAPI.logCodingIntegrity(id, 'tab_switch');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [id]);

    // Auto-save logic
    const handleCodeChange = (code) => {
        if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

        draftTimerRef.current = setTimeout(() => {
            interviewAPI.saveCodingDraft(id, {
                code,
                problemId: activeProblemId
            });
        }, 5000); // Save every 5 seconds of inactivity
    };

    const handleSubmit = async (codeData) => {
        try {
            setSubmitting(true);
            await interviewAPI.submitCode(id, {
                ...codeData,
                problemId: activeProblemId
            });

            setPolling(true);
            startPollingResults();
        } catch (error) {
            alert('Submission failed: ' + error.message);
            setSubmitting(false);
        }
    };

    const startPollingResults = async () => {
        let attempts = 0;
        const poll = async () => {
            try {
                const resultsData = await interviewAPI.getCodingResults(id);
                if (resultsData.evaluated) {
                    // Update local state to reflect the new solved problem
                    const nextData = await interviewAPI.startCodingRound(id);
                    setRoundData(nextData);

                    const nextProblem = nextData.problems[nextData.currentProblemIndex];
                    setActiveProblemId(nextProblem.problemId);

                    setPolling(false);
                    setSubmitting(false);

                    if (nextData.status === 'completed') {
                        navigate(`/report/${id}`);
                    }
                } else if (attempts < 20) {
                    attempts++;
                    setTimeout(poll, 3000);
                }
            } catch (err) {
                console.error('Polling error', err);
            }
        };
        poll();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <LoadingSpinner size="lg" label="Preparing your coding workspace..." />
        </div>
    );

    const activeProblem = roundData.problems.find(p => p.problemId === activeProblemId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Minimal Sticky Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary-600 text-white p-2 rounded-lg">
                        <Save className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-none">Coding Session</h1>
                        <p className="text-xs text-slate-500 mt-1">Interview ID: #{id.slice(-6)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
                        }`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-600"
                    >
                        Quit Session
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Side Navigation */}
                <aside className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto hidden lg:block">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                        CHALLENGES ({roundData.problems.length})
                    </h2>

                    <div className="space-y-3">
                        {roundData.problems.map((prob, idx) => {
                            const isLocked = idx > roundData.currentProblemIndex;
                            const isCompleted = idx < roundData.currentProblemIndex;
                            const isActive = prob.problemId === activeProblemId;

                            return (
                                <motion.div
                                    key={prob.problemId}
                                    whileHover={!isLocked ? { x: 4 } : {}}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${isActive
                                            ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500/20'
                                            : isLocked
                                                ? 'border-slate-100 bg-slate-50 opacity-60 grayscale pointer-events-none'
                                                : isCompleted
                                                    ? 'border-green-100 bg-green-50/30'
                                                    : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    onClick={() => !isLocked && setActiveProblemId(prob.problemId)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${prob.difficulty === 'Easy' ? 'text-emerald-600' :
                                                prob.difficulty === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                                            }`}>
                                            {prob.difficulty}
                                        </span>
                                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                                    </div>
                                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-primary-900' : 'text-slate-700'}`}>
                                        {idx + 1}. {prob.title}
                                    </h3>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"></div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-12 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex gap-2 text-amber-800 mb-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <h4 className="text-xs font-bold uppercase tracking-tight">Integrity Check</h4>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                            Pasting code and tab switching are monitored to ensure interview authenticity.
                        </p>
                    </div>
                </aside>

                {/* Main Content Areas */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <AnimatePresence mode="wait">
                        {polling || submitting ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="h-full flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-24 h-24 relative mb-6">
                                    <div className="absolute inset-0 bg-primary-200 rounded-full animate-ping opacity-25"></div>
                                    <div className="absolute inset-4 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    <CheckCircle className="absolute inset-0 m-auto w-8 h-8 text-primary-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Evaluating Solution</h2>
                                <p className="text-slate-500 max-w-sm">
                                    Our AI is currently running your code against hidden test cases and analyzing time complexity.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-7xl mx-auto space-y-6"
                            >
                                <CodingEditor
                                    problem={activeProblem}
                                    onSubmit={handleSubmit}
                                    isSubmitting={submitting}
                                    onCodeChange={handleCodeChange}
                                />

                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white p-3 rounded-lg border border-slate-200 w-fit">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    Cloud Draft Auto-saved
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Locked Screen for Time Up */}
            {isTimeUp && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Time's Up!</h2>
                        <p className="text-slate-600 mb-8">
                            The allocation for this coding round has expired. Your current progress has been saved.
                        </p>
                        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate(`/report/${id}`)}>
                            Go to Final Report
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodingRound;
