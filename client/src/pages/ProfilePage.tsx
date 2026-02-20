import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';
import { User, Mail, Lock, Camera, Save } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.put('/auth/profile', { name, email });
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
        if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await api.put('/auth/password', { currentPassword: currentPass, newPassword: newPass });
            setSuccess('Password changed successfully!');
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Password change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
                </motion.div>

                {success && <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">{success}</div>}
                {error && <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}

                {/* Avatar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-5"
                >
                    <h2 className="text-white font-semibold mb-5 text-lg">Avatar</h2>
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-3">Upload a profile photo (PNG, JPG up to 2MB)</p>
                            <label id="avatar-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/5 hover:border-white/10 rounded-xl text-sm text-slate-300 cursor-pointer transition-all">
                                <Camera size={16} />
                                Choose photo
                                <input type="file" className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* Personal Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-5"
                >
                    <h2 className="text-white font-semibold mb-5 text-lg">Personal Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Full name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-800/60 border border-white/5 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/60 border border-white/5 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <button
                            id="save-profile"
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Save size={15} /> Save Changes
                        </button>
                    </form>
                </motion.div>

                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                >
                    <h2 className="text-white font-semibold mb-5 text-lg">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {[
                            { id: 'curr-pass', label: 'Current password', value: currentPass, set: setCurrentPass },
                            { id: 'new-pass', label: 'New password', value: newPass, set: setNewPass },
                            { id: 'confirm-pass', label: 'Confirm new password', value: confirmPass, set: setConfirmPass },
                        ].map((field) => (
                            <div key={field.id}>
                                <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        id={field.id}
                                        type="password"
                                        value={field.value}
                                        onChange={(e) => field.set(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-800/60 border border-white/5 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            id="save-password"
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Lock size={15} /> Update Password
                        </button>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
