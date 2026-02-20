import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Shield, Zap, Globe, BarChart2, Terminal } from 'lucide-react';

// Particle canvas background
function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let animationId: number;
        let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.6 + 0.1,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            particles.forEach((p, i) => {
                particles.slice(i + 1).forEach((q) => {
                    const dist = Math.hypot(p.x - q.x, p.y - q.y);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59,130,246,${0.15 * (1 - dist / 130)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                });
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
                ctx.fill();

                // Move
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            animationId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}

const features = [
    {
        icon: <Server size={28} />,
        title: 'LXC/LXD Virtualization',
        desc: 'Enterprise-grade container virtualization powered by LXD for blazing-fast VPS performance.',
    },
    {
        icon: <Shield size={28} />,
        title: 'Secure by Default',
        desc: 'Bcrypt-hashed passwords, JWT authentication, CSRF protection, and full container isolation.',
    },
    {
        icon: <Zap size={28} />,
        title: 'Instant Deployment',
        desc: 'Deploy Ubuntu 24.04 or Debian 12 instances in seconds with one-click provisioning.',
    },
    {
        icon: <Globe size={28} />,
        title: 'Multi-Node Support',
        desc: 'Manage VPS across multiple nodes globally with real-time monitoring and failover.',
    },
    {
        icon: <BarChart2 size={28} />,
        title: 'Real-Time Monitoring',
        desc: 'Live CPU, RAM, and disk usage tracking via WebSockets. Always know your server health.',
    },
    {
        icon: <Terminal size={28} />,
        title: 'Web Console & tmate',
        desc: 'Access your VPS via browser-based terminal or install tmate with a single click.',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 50%)',
                    zIndex: 1,
                }}
            />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Server size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Flare<span className="text-blue-400">VM</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center pt-28 pb-24 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Powered by LXC / LXD Virtualization
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
                        <span className="text-white">FlareVM</span>{' '}
                        <span
                            className="text-transparent bg-clip-text"
                            style={{
                                backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)',
                            }}
                        >
                            Panel
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        A production-ready VPS management panel with LXD virtualization, real-time monitoring,
                        and a beautifully crafted dark UI — inspired by Convoy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="group px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Get Started Free
                            <Zap size={16} className="group-hover:animate-bounce" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
                        >
                            Sign In
                        </Link>
                    </div>
                </motion.div>

                {/* Floating Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-8 mt-16 text-sm"
                >
                    {[
                        { label: 'Uptime', value: '99.9%' },
                        { label: 'Deploy Time', value: '<10s' },
                        { label: 'OS Options', value: '2+' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 px-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Everything you need to manage{' '}
                            <span className="text-blue-400">your infrastructure</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            FlareVM Panel comes with all the tools you need out-of-the-box, with no extra configuration.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-purple-900/10 p-14 backdrop-blur-sm"
                >
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Ready to launch your VPS?
                    </h2>
                    <p className="text-slate-400 mb-8 text-lg">
                        Join FlareVM Panel and manage your entire VPS infrastructure from one powerful dashboard.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-lg transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-1"
                    >
                        Create Your Account
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 px-8 py-8 text-center text-slate-500 text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Server size={11} className="text-white" />
                    </div>
                    <span className="font-medium text-slate-400">FlareVM Panel</span>
                </div>
                <p>© 2024 FlareVM Panel. Built with LXD, Node.js, and React.</p>
            </footer>
        </div>
    );
}
