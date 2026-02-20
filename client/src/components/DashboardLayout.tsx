import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Server, LayoutDashboard, User, Settings, LogOut, Shield, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
    label: string;
    icon: ReactNode;
    href: string;
}

const clientNavItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard' },
    { label: 'Profile', icon: <User size={18} />, href: '/profile' },
    { label: 'Settings', icon: <Settings size={18} />, href: '/settings' },
];

const adminNavItems: SidebarItem[] = [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, href: '/admin' },
    { label: 'VPS Manager', icon: <Server size={18} />, href: '/admin/vps' },
    { label: 'Users', icon: <User size={18} />, href: '/admin/users' },
    { label: 'Nodes', icon: <Shield size={18} />, href: '/admin/nodes' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navItems = user?.role === 'ADMIN' ? adminNavItems : clientNavItems;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (href: string) =>
        location.pathname === href || (href !== '/dashboard' && href !== '/admin' && location.pathname.startsWith(href));

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <Server size={16} className="text-white" />
                </div>
                {sidebarOpen && (
                    <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                        Flare<span className="text-blue-400">VM</span>
                    </span>
                )}
            </div>

            {/* Role badge */}
            {sidebarOpen && (
                <div className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user?.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {user?.role === 'ADMIN' ? 'Administrator' : 'Client'}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive(item.href)
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-white/5 p-3">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200`}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 border-r border-white/5 z-50 md:hidden"
                        >
                            <div className="absolute top-4 right-4">
                                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Topbar */}
                <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:block h-4 w-px bg-white/10" />
                        <span className="text-slate-400 text-sm hidden md:block">
                            {navItems.find((n) => isActive(n.href))?.label || 'Dashboard'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 rounded-xl bg-slate-800/60 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors relative">
                            <Bell size={16} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-white font-medium hidden sm:block">{user?.name}</span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                            <User size={15} /> Profile
                                        </Link>
                                        <Link to="/settings" className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                            <Settings size={15} /> Settings
                                        </Link>
                                        <div className="border-t border-white/5" />
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                                            <LogOut size={15} /> Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
