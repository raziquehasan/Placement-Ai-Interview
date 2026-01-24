import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const COMPANIES = [
    { name: "Google", color: "from-blue-500 to-red-500" },
    { name: "Amazon", color: "from-orange-400 to-yellow-500" },
    { name: "Microsoft", color: "from-blue-600 to-teal-400" },
    { name: "Meta", color: "from-blue-500 to-indigo-600" },
    { name: "TCS", color: "from-blue-800 to-slate-900" },
    { name: "Zomato", color: "from-red-500 to-red-700" }
];

const CompanyPrep = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container px-4 mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">Target Your Dream Company</h2>

                <div className="flex flex-wrap items-center justify-center gap-6">
                    {COMPANIES.map((company, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="py-4 px-8 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${company.color}`} />
                                <span className="font-bold text-slate-800 dark:text-slate-200">{company.name}</span>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                <p className="mt-12 text-slate-500 max-w-xl mx-auto italic">
                    "The mock interviews were indistinguishable from my real Google interview. The AI caught even my smallest stutter."
                </p>
            </div>
        </section>
    );
};

export default CompanyPrep;
