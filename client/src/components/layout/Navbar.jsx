import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { cn } from '../../lib/utils';
import { Menu, X, Rocket, Sparkles } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Process', href: '#process' },
        { name: 'Companies', href: '#companies' },
    ];

    const isMarketingPage = location.pathname === '/' || location.pathname === '/home';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled || !isMarketingPage ? "py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/40" : "py-6 bg-transparent"
        )}>
            <div className="container px-4 mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
                        <Rocket size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
                        PlacementBuddy
                    </span>
                </Link>

                {/* Desktop Links - Only show on marketing page */}
                <div className="hidden md:flex items-center gap-8">
                    {isMarketingPage ? navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            {link.name}
                        </a>
                    )) : (
                        <>
                            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Dashboard</Link>
                            <Link to="/simulation" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1">
                                Simulations <Sparkles size={14} className="text-indigo-500" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Desktop CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    {isMarketingPage ? (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors px-4"
                            >
                                Login
                            </button>
                            <Button
                                variant="premium"
                                size="sm"
                                onClick={() => navigate('/login')}
                            >
                                Get Started
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </Button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 dark:text-slate-400"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 overflow-hidden"
                    >
                        <div className="container px-4 py-8 flex flex-col gap-6">
                            {isMarketingPage ? (
                                <>
                                    {navLinks.map((link) => (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-lg font-semibold text-slate-900 dark:text-white"
                                        >
                                            {link.name}
                                        </a>
                                    ))}
                                    <hr className="border-slate-100 dark:border-slate-900" />
                                    <Button variant="premium" className="w-full h-12" onClick={() => navigate('/login')}>
                                        Get Started Free
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-red-500 border-red-100 hover:bg-red-50"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    Logout
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
