import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, FileCheck } from 'lucide-react';

const STEPS = [
    {
        title: "Upload Resume",
        description: "Our AI parses your experience to tailor questions specifically for your background.",
        icon: <Upload size={24} className="text-primary-500" />,
    },
    {
        title: "Take Interview",
        description: "Engage in a live technical or HR round with our real-time cognitive AI recruiter.",
        icon: <Play size={24} className="text-secondary-500" />,
    },
    {
        title: "Get Hired",
        description: "Review detailed analytics and actionable steps to improve your weak areas instantly.",
        icon: <FileCheck size={24} className="text-success-500" />,
    }
];

const HowItWorks = () => {
    return (
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-900">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works?</h2>
                    <p className="text-slate-600 dark:text-slate-400">Three steps to placement readiness.</p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-success-500/20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center group"
                            >
                                <div className="w-24 h-24 mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-8 shadow-xl group-hover:shadow-primary/10 transition-all duration-300 relative">
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-[250px] mx-auto text-sm">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
