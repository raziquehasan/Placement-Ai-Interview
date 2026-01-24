import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import ProductPreview from '../components/landing/ProductPreview';
import SocialProof from '../components/landing/SocialProof';
import CompanyPrep from '../components/landing/CompanyPrep';
import CTABanner from '../components/landing/CTABanner';

const Home = () => {
    return (
        <div className="min-h-screen selection:bg-primary-500/10 dark:bg-slate-950">
            <main>
                <Hero />
                <SocialProof />
                <div id="features">
                    <Features />
                </div>
                <ProductPreview />
                <div id="process">
                    <HowItWorks />
                </div>
                <div id="companies">
                    <CompanyPrep />
                </div>
                <CTABanner />
            </main>
        </div>
    );
};

export default Home;
