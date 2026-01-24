import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import GradientText from '../common/GradientText';
import { cn } from '../../lib/utils';
import { Sparkles, ArrowRight, Bot, Code, Cpu } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 blur-[120px] rounded-full animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 blur-[120px] rounded-full animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-blue-400/10 blur-[100px] rounded-full animate-blob animation-delay-4000" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light" />
            <div className="absolute inset-0 -z-10 bg-grid-slate-900/[0.04] bg-[size:40px_40px] dark:bg-grid-slate-100/[0.04]" />

            <div className="container px-4 mx-auto text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8"
                >
                    <Sparkles size={14} className="animate-pulse" />
                    <span>New: AI-Powered Coding Feedback</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto"
                >
                    Ace Your Placements <br />
                    with <GradientText className="animate-shine">AI Intelligence</GradientText>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Practice real-world interviews with our cognitive AI coach.
                    Get instant scores, deep feedback, and a personalized roadmap to your dream job.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        variant="premium"
                        size="lg"
                        className="w-full sm:w-auto h-14"
                        onClick={() => navigate('/login')}
                    >
                        Start Free Mock <ArrowRight className="ml-2" size={18} />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-14 backdrop-blur-md"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </Button>
                </motion.div>

                {/* Floating Icons/Elements */}
                <div className="hidden lg:block">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-[10%] p-4 rounded-2xl glass-card rotate-12"
                    >
                        <Code className="text-primary-500" size={32} />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-40 right-[10%] p-4 rounded-2xl glass-card -rotate-12 outline shadow-glow shadow-primary/20"
                    >
                        <Bot className="text-secondary-500" size={32} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
