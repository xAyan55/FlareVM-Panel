import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Plus, Play, Square, RotateCcw, Trash2, Clock, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

interface VPS {
    id: string;
    name: string;
    os: string;
    status: string;
    cpu: number;
    ram: number;
    disk: number;
    expiryDate: string | null;
    node: { name: string; ip: string };
    liveStatus?: string;
}

function StatusBadge({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    const map: Record<string, { color: string; dot: string; label: string }> = {
        running: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse', label: 'Running' },
        stopped: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400', label: 'Stopped' },
        suspended: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400', label: 'Suspended' },
        creating: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400 animate-pulse', label: 'Creating' },
        error: { color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'Error' },
    };
    const cfg = map[s] || map.stopped;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function UsageBar({ label, value, max, unit, icon }: { label: string; value: number; max: number; unit: string; icon: React.ReactNode }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-blue-500';
    return (
        <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <div className="flex items-center gap-1.5">{icon}<span>{label}</span></div>
                <span className="font-medium text-white">{value}{unit} / {max}{unit}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [vpsList, setVpsList] = useState<VPS[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchVPS = async () => {
        try {
            const res = await api.get('/vps');
            setVpsList(res.data);
        } catch (e) {
            setError('Failed to load VPS instances.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVPS(); }, []);

    const handleAction = async (id: string, action: string) => {
        setActionLoading(`${id}-${action}`);
        try {
            await api.post(`/vps/${id}/action`, { action });
            await fetchVPS();
        } catch (e: any) {
            alert(e?.response?.data?.error || `Action ${action} failed`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete VPS "${name}"? This action cannot be undone.`)) return;
        try {
            await api.delete(`/vps/${id}`);
            setVpsList((prev) => prev.filter((v) => v.id !== id));
        } catch (e: any) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    };

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const formatExpiry = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-white">My VPS Instances</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage and monitor your virtual servers</p>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: 'Total VPS', value: vpsList.length, icon: <Server size={18} />, color: 'text-blue-400' },
                        { label: 'Running', value: vpsList.filter((v) => v.status === 'running').length, icon: <Play size={18} />, color: 'text-emerald-400' },
                        { label: 'Stopped', value: vpsList.filter((v) => v.status === 'stopped').length, icon: <Square size={18} />, color: 'text-slate-400' },
                        { label: 'Suspended', value: vpsList.filter((v) => v.status === 'suspended').length, icon: <Clock size={18} />, color: 'text-yellow-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-slate-400 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Error */}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {/* VPS Cards */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-slate-900/40 rounded-2xl border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : vpsList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 rounded-2xl border border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                            <Server size={32} className="text-blue-400" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">No VPS instances yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Contact your administrator to create a VPS for you.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {vpsList.map((vps, i) => (
                            <motion.div
                                key={vps.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className={`bg-slate-900/60 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/20 ${isExpired(vps.expiryDate) ? 'border-red-500/20' : 'border-white/5'
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                <Server size={18} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/vps/${vps.id}`}
                                                    className="text-white font-semibold hover:text-blue-400 transition-colors"
                                                >
                                                    {vps.name}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-xs text-slate-500">{vps.os}</span>
                                                    <span className="text-slate-700">•</span>
                                                    <span className="text-xs text-slate-500">Node: {vps.node?.name || '—'}</span>
                                                </div>
                                            </div>
                                            <StatusBadge status={vps.status} />
                                            {isExpired(vps.expiryDate) && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Expired</span>
                                            )}
                                        </div>

                                        {/* Usage bars */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pl-12">
                                            <UsageBar label="CPU" value={Math.floor(Math.random() * 40 + 5)} max={vps.cpu * 100} unit="%" icon={<Cpu size={12} />} />
                                            <UsageBar label="RAM" value={Math.floor(Math.random() * (vps.ram * 0.7))} max={vps.ram} unit="MB" icon={<MemoryStick size={12} />} />
                                            <UsageBar label="Disk" value={Math.floor(Math.random() * (vps.disk * 0.5))} max={vps.disk} unit="GB" icon={<HardDrive size={12} />} />
                                        </div>

                                        <div className="flex items-center gap-2 mt-3 pl-12">
                                            <Clock size={12} className="text-slate-500" />
                                            <span className="text-xs text-slate-500">
                                                Expires: <span className={isExpired(vps.expiryDate) ? 'text-red-400' : 'text-slate-400'}>{formatExpiry(vps.expiryDate)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            id={`vps-start-${vps.id}`}
                                            onClick={() => handleAction(vps.id, 'start')}
                                            disabled={!!actionLoading}
                                            title="Start"
                                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                                        >
                                            <Play size={15} />
                                        </button>
                                        <button
                                            id={`vps-stop-${vps.id}`}
                                            onClick={() => handleAction(vps.id, 'stop')}
                                            disabled={!!actionLoading}
                                            title="Stop"
                                            className="p-2.5 rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-all disabled:opacity-40"
                                        >
                                            <Square size={15} />
                                        </button>
                                        <button
                                            id={`vps-restart-${vps.id}`}
                                            onClick={() => handleAction(vps.id, 'restart')}
                                            disabled={!!actionLoading}
                                            title="Restart"
                                            className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all disabled:opacity-40"
                                        >
                                            <RotateCcw size={15} />
                                        </button>
                                        <Link
                                            to={`/vps/${vps.id}`}
                                            className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium"
                                        >
                                            Manage
                                        </Link>
                                        <button
                                            id={`vps-delete-${vps.id}`}
                                            onClick={() => handleDelete(vps.id, vps.name)}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
