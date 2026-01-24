import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Define route categories
    const isMarketingPage = location.pathname === '/' || location.pathname === '/home';
    const isLoginPage = location.pathname === '/login' || location.pathname === '/register';

    // Login/Register have their own specialized full-screen layouts
    if (isLoginPage) {
        return <>{children}</>;
    }

    // If it is the Landing Page, show full marketing layout
    if (isMarketingPage) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        );
    }

    // For all other "App" pages (Dashboard, etc.)
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <main className="flex-grow pt-20"> {/* PT-20 prevents content from being hidden under fixed navbar */}
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
