import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';
import GradientText from '../components/common/GradientText';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
    Rocket,
    CheckCircle2,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe
} from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            return setError('Please fill in all fields');
        }

        setLocalLoading(true);
        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLocalLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLocalLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();

            const userData = {
                id: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                avatar: result.user.photoURL,
                provider: 'google'
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            window.location.href = '/dashboard';
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error signing in with Google');
        } finally {
            setLocalLoading(false);
        }
    };

    const features = [
        { icon: <Zap size={18} />, text: "Real-time AI Interview Feedback" },
        { icon: <ShieldCheck size={18} />, text: "Personalized Skill Roadmaps" },
        { icon: <Globe size={18} />, text: "Target Top Product Companies" },
    ];

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 -z-10" />

            {/* Left Column: Visual/Marketing */}
            <div className="hidden lg:flex flex-col justify-center px-12 xl:px-24 bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] -z-10" />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <Rocket size={20} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-bold dark:text-white">PlacementBuddy</span>
                    </Link>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Your Personal <br />
                        <GradientText>AI Interview Coach</GradientText>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-md leading-relaxed">
                        Practice mock interviews, get cognitive feedback, and land your dream offer with our industry-leading AI platform.
                    </p>

                    <div className="space-y-6 mb-16">
                        {features.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-medium">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-500 shadow-sm">
                                    {item.icon}
                                </div>
                                {item.text}
                            </div>
                        ))}
                    </div>

                    {/* Simple Testimonial Hook */}
                    <div className="p-6 rounded-2xl glass-card bg-white/50 backdrop-blur-sm border-slate-200/50 max-w-sm">
                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 bg-amber-400 rounded-sm" />)}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">
                            "The mock rounds were indistinguishable from my real Google interview. Highly recommended!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                            <div className="text-xs font-bold uppercase tracking-wider">Software Engineer @ Google</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Column: Login Form */}
            <div className="flex flex-col justify-center items-center px-4 py-12 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <GlassCard className="p-8 md:p-10 border-slate-200/60 dark:border-slate-800/60 shadow-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold mb-3 tracking-tight">Welcome back</h2>
                            <p className="text-slate-500 dark:text-slate-400">Sign in to continue your journey</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-lg shadow-red-600/50" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4 mb-8">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 flex justify-center items-center gap-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-500/50 transition-all font-semibold"
                                onClick={handleGoogleLogin}
                                disabled={localLoading}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                    <span className="px-3 bg-white dark:bg-[#0f172a]/0 text-slate-400">Or use email</span>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-right">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 float-left">Password</label>
                                <a href="#" className="text-xs text-primary-500 hover:underline font-medium">Forgot password?</a>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary-500/20 mt-4"
                                loading={localLoading}
                            >
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-10 text-center text-sm">
                            <span className="text-slate-500">New around here?</span>{' '}
                            <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600 transition-colors ml-1">
                                Create your account <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Footer simple link in login page */}
                <div className="mt-12 text-xs text-slate-400 flex gap-6">
                    <a href="#" className="hover:text-slate-600 transition-colors underline decoration-slate-200 underline-offset-4">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors underline decoration-slate-200 underline-offset-4">Contact Support</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
