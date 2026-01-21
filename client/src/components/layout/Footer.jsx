const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">P</span>
                            </div>
                            <span className="text-xl font-bold text-white">Placement Buddy</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            AI-powered interview preparation platform to help you ace your next job interview.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/" className="hover:text-primary-400 transition-colors">Home</a>
                            </li>
                            <li>
                                <a href="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</a>
                            </li>
                            <li>
                                <a href="/login" className="hover:text-primary-400 transition-colors">Login</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-400">support@placementbuddy.com</li>
                            <li className="text-gray-400">© 2026 Placement Buddy</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>Built with ❤️ for aspiring professionals</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
