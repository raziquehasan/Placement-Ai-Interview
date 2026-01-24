import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
    { label: "Mock Interviews", value: "50,000+" },
    { label: "Improvement Rate", value: "92%" },
    { label: "Colleges Reached", value: "1,000+" },
    { label: "Average CTC Hike", value: "45%" }
];

const SocialProof = () => {
    return (
        <section className="py-24 border-b border-slate-100 dark:border-slate-900">
            <div className="container px-4 mx-auto">
                <div className="mb-16 text-center">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">The Scale of Impact</h3>
                    <p className="text-xl font-medium text-slate-800 dark:text-slate-200">Trusted by students from top-tier product companies.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
