import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const CTABanner = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container px-4 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 p-12 md:p-20 overflow-hidden text-center"
                >
                    {/* Decorative blob */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10 leading-tight">
                        Start Your AI Interview <br /> Journey Today
                    </h2>
                    <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                        Join 50,000+ students landing jobs at top product companies. Start your first mock interview for free.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Button
                            size="lg"
                            variant="primary"
                            className="bg-white text-primary-600 hover:bg-slate-50 border-none w-full sm:w-auto px-10 h-14"
                            onClick={() => navigate('/login')}
                        >
                            Sign Up Now
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-white border-white/30 hover:bg-white/10 w-full sm:w-auto px-10 h-14"
                            onClick={() => navigate('/login')}
                        >
                            View Demo
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTABanner;
