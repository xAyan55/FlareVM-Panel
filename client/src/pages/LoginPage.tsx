import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Server, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Server size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold">Flare<span className="text-blue-400">VM</span></span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your FlareVM account</p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-900/80 border border-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
                >
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@flarevm.com"
                                    className="w-full bg-slate-800/60 border border-white/5 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800/60 border border-white/5 text-white placeholder-slate-500 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 text-sm"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="mt-5 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                        <p className="text-xs text-slate-500">Demo: <span className="text-slate-400 font-mono">admin@flarevm.com</span> / <span className="text-slate-400 font-mono">admin123</span></p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
