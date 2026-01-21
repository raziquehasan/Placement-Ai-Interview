import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home = () => {
    const steps = [
        {
            number: '01',
            title: 'Upload Resume',
            description: 'Upload your resume in PDF format to help our AI understand your unique skills and experience.'
        },
        {
            number: '02',
            title: 'Set Your Goal',
            description: 'Select your target job role and preferred difficulty level for a tailored interview experience.'
        },
        {
            number: '03',
            title: 'Face AI Interview',
            description: 'Answer dynamic, role-specific questions generated in real-time by Google Gemini AI.'
        },
        {
            number: '04',
            title: 'Get Instant Feedback',
            description: 'Receive a comprehensive score and detailed insights on how to improve your performance.'
        }
    ];

    const features = [
        {
            title: 'AI Question Generation',
            icon: '🤖',
            description: 'High-quality, relevant questions generated using state-of-the-art Google Gemini AI.'
        },
        {
            title: 'Resume Personalized',
            icon: '📄',
            description: 'We analyze your resume to ask questions about your actual skills and projects.'
        },
        {
            title: 'In-Depth Evaluation',
            icon: '📊',
            description: 'Get scored on technical skills, communication, problem-solving, and confidence.'
        }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                            Master Your Next Interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">AI Precision</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Placement Buddy uses advanced AI to simulate realistic, resume-tailored interviews. Practice anytime, anywhere, and get instant feedback to land your dream job.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/register">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto px-10">
                                    Start Free Interview
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto px-10">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Placement Buddy?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Built for the modern job market using Google Gemini Pro to give you the most accurate interview simulation.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <Card key={idx} className="p-8 text-center border-none" hover>
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Four simple steps to ace your placement preparations.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-5xl font-black text-gray-100 absolute -top-4 left-0 -z-10">{step.number}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{step.title}</h3>
                                <p className="text-gray-600 relative z-10">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to nail your dream job?</h2>
                    <p className="text-primary-100 mb-10 text-lg max-w-2xl mx-auto">Join thousands of students and professionals using Placement Buddy to prepare for top-tier company interviews.</p>
                    <Link to="/register">
                        <Button variant="outline" className="bg-white border-white text-primary-600 hover:bg-gray-100 px-12 py-4">
                            Get Started Now — It's Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
