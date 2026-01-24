import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 pt-20 pb-10">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                                <Rocket size={16} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold dark:text-white">PlacementBuddy</span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
                            Empowering the next generation of software engineers with world-class AI interview preparation.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-all">
                                <Github size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-all">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-500 transition-all">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-bold mb-6 dark:text-white">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Features</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">AI Coaching</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold mb-6 dark:text-white">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Docs</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Blog</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Community</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-6 dark:text-white">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Privacy</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Terms</a></li>
                            <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-900 flex flex-col md:row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {currentYear} PlacementBuddy AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-success-500" />
                            System Status: Online
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
