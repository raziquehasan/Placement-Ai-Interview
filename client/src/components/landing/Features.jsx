import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import GradientText from '../common/GradientText';
import {
    Bot,
    Code2,
    FileSearch,
    LineChart,
    Map,
    Zap
} from 'lucide-react';

const FEATURE_DATA = [
    {
        title: "AI Mock Interviews",
        description: "Realistic conversation-based interviews with role-specific AI coaches and dynamic follow-up questions.",
        icon: <Bot className="text-blue-500" size={24} />,
        color: "blue"
    },
    {
        title: "Coding Rounds",
        description: "Real-time code execution and evaluation for 20+ programming languages with cognitive AI review.",
        icon: <Code2 className="text-violet-500" size={24} />,
        color: "violet"
    },
    {
        title: "Resume ATS Analyzer",
        description: "Instantly check your resume score against top-tier product company requirements and get fixes.",
        icon: <FileSearch className="text-emerald-500" size={24} />,
        color: "emerald"
    },
    {
        title: "Skill Analytics",
        description: "Deep-dive into your performance with detailed metrics on communication, logic, and technicality.",
        icon: <LineChart className="text-orange-500" size={24} />,
        color: "orange"
    },
    {
        title: "Personalized Roadmap",
        description: "AI-generated study plans based on your weaknesses discovered during practice sessions.",
        icon: <Map className="text-rose-500" size={24} />,
        color: "rose"
    },
    {
        title: "Instant Feedback",
        description: "No more waiting. Get your results, Strengths, and behavioral feedback within seconds of finishing.",
        icon: <Zap className="text-amber-500" size={24} />,
        color: "amber"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        Everything you need to <GradientText>Secure the Offer</GradientText>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                    >
                        Stop guessing what triggers an interview. Our AI platform covers every edge case from first-look to final offer.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURE_DATA.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="h-full border-slate-200 dark:border-slate-800">
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
