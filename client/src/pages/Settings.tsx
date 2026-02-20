import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Globe, Moon, Bell, Shield } from 'lucide-react';

export default function Settings() {
    const [language, setLanguage] = useState('en');
    const [notifications, setNotifications] = useState({
        vpsStatus: true,
        security: true,
        newsletter: false,
    });

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 text-sm mt-1">Configure your account preferences and notifications</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Language & Region */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                <Globe size={20} />
                            </div>
                            <h2 className="text-white font-semibold">Language & Region</h2>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Display Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full max-w-xs bg-slate-800 border border-white/5 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="en">English (US)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Theme */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                <Moon size={20} />
                            </div>
                            <h2 className="text-white font-semibold">Appearance</h2>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-medium">Dark Mode</p>
                                <p className="text-slate-500 text-xs mt-1">Dark theme is enabled by default for a premium hosting experience.</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-white font-semibold">Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'vpsStatus', label: 'VPS Status Changes', desc: 'Get notified when your VPS starts, stops, or experiences issues.' },
                                { id: 'security', label: 'Security Alerts', desc: 'Important alerts about login attempts and password changes.' },
                                { id: 'newsletter', label: 'Marketing Emails', desc: 'Updates about our products, features, and special offers.' },
                            ].map((n) => (
                                <div key={n.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-white text-sm font-medium">{n.label}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{n.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [n.id]: !(prev as any)[n.id] }))}
                                        className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 ${(notifications as any)[n.id] ? 'bg-blue-600' : 'bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${(notifications as any)[n.id] ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-white font-semibold">Security Management</h2>
                        </div>

                        <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                            Delete Account
                        </button>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
