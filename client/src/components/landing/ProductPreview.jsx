import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { CheckCircle2, TrendingUp, UserCheck } from 'lucide-react';

const ProductPreview = () => {
    return (
        <section className="py-24 bg-primary-50/30 dark:bg-primary-950/10">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                            Real-time Analytics <br /> for <span className="text-primary-600">Peak Performance</span>
                        </h2>

                        <ul className="space-y-6">
                            {[
                                "Behavioral analysis (eye contact, tone of voice)",
                                "Technical correctness scoring (DSA/System Design)",
                                "Comparison with 10k+ successful candidates",
                                "Instant roadmap to bridge skill gaps"
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 text-slate-700 dark:text-slate-300"
                                >
                                    <CheckCircle2 className="text-primary-500" size={24} />
                                    <span className="font-medium">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 relative">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10"
                        >
                            <GlassCard className="p-0 border-none overflow-hidden max-w-lg mx-auto shadow-2xl">
                                <div className="bg-slate-900 p-4 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono italic">ai-interview-session.v1</span>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Interview Score</div>
                                            <div className="text-4xl font-bold">87/100</div>
                                        </div>
                                        <TrendingUp className="text-success-500" size={48} />
                                    </div>

                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "87%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs text-slate-500 mb-1">Communication</div>
                                            <div className="font-bold text-success-500">Strong</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs text-slate-500 mb-1">Logic</div>
                                            <div className="font-bold text-primary-500">8.5/10</div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Background elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/20 blur-[100px] -z-10 rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductPreview;
