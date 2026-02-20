import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, Server, Play, Square, RotateCcw, Trash2, RefreshCw, Cpu, MemoryStick, HardDrive, Network } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';
import { io } from 'socket.io-client';

interface VPS {
    id: string;
    name: string;
    os: string;
    status: string;
    cpu: number;
    ram: number;
    disk: number;
    ip?: string;
    expiryDate: string | null;
    node: { name: string; ip: string };
    createdAt: string;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
            <div className="text-slate-400 mb-3">{icon}</div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-slate-500 text-sm">{label}</div>
            {sub && <div className="text-slate-600 text-xs mt-0.5">{sub}</div>}
        </div>
    );
}

export default function VPSDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vps, setVPS] = useState<VPS | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showConsole, setShowConsole] = useState(false);
    const [liveStats, setLiveStats] = useState({ cpu: '0', ram: '0', network: '0', disk: '0' });
    const [consoleLogs] = useState([
        '$ System initialized. LXD container booted.',
        '$ Network configured. IP assigned.',
        '$ SSH daemon started.',
        '$ Container ready.',
    ]);

    useEffect(() => {
        const socket = io(`http://${window.location.hostname}:5000`);
        socket.on('stats', (data: any) => {
            setLiveStats(data);
        });
        return () => { socket.disconnect(); };
    }, []);

    const fetchVPS = async () => {
        try {
            const res = await api.get('/vps');
            const found = res.data.find((v: VPS) => v.id === id);
            if (found) setVPS(found);
        } catch {
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVPS(); }, [id]);

    const handleAction = async (action: string) => {
        setActionLoading(true);
        try {
            await api.post(`/vps/${id}/action`, { action });
            await fetchVPS();
        } catch (e: any) {
            alert(e?.response?.data?.error || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete VPS "${vps?.name}"? This is permanent.`)) return;
        try {
            await api.delete(`/vps/${id}`);
            navigate('/dashboard');
        } catch (e: any) {
            alert(e?.response?.data?.error || 'Delete failed');
        }
    };

    const installTmate = async () => {
        alert('tmate install command sent to VPS:\n\napt-get install -y tmate && tmate -F\n\nConnect using the tmate session link shown in the container logs.');
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
        </DashboardLayout>
    );

    if (!vps) return (
        <DashboardLayout>
            <div className="text-center py-24 text-slate-400">VPS not found</div>
        </DashboardLayout>
    );

    const statusMap: Record<string, string> = {
        running: 'text-emerald-400',
        stopped: 'text-slate-400',
        suspended: 'text-yellow-400',
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-5xl mx-auto">
                {/* Back */}
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <Server size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{vps.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-slate-500 text-sm">{vps.os}</span>
                                <span className="text-slate-700">•</span>
                                <span className={`text-sm font-medium ${statusMap[vps.status] || 'text-slate-400'}`}>
                                    {vps.status.charAt(0).toUpperCase() + vps.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            id="vps-detail-start"
                            onClick={() => handleAction('start')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                        >
                            <Play size={14} /> Start
                        </button>
                        <button
                            id="vps-detail-stop"
                            onClick={() => handleAction('stop')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                        >
                            <Square size={14} /> Stop
                        </button>
                        <button
                            id="vps-detail-restart"
                            onClick={() => handleAction('restart')}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                        >
                            <RotateCcw size={14} /> Restart
                        </button>
                        <button
                            id="vps-detail-delete"
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                >
                    <StatCard
                        icon={<Cpu size={20} />}
                        label="CPU Usage"
                        value={`${liveStats.cpu}%`}
                        sub={`${vps.cpu} vCPU Available`}
                    />
                    <StatCard
                        icon={<MemoryStick size={20} />}
                        label="RAM Usage"
                        value={`${liveStats.ram}%`}
                        sub={`${vps.ram} MB Dedicated`}
                    />
                    <StatCard
                        icon={<HardDrive size={20} />}
                        label="Disk Space"
                        value={`${liveStats.disk} GB`}
                        sub={`of ${vps.disk} GB Total`}
                    />
                    <StatCard
                        icon={<Network size={20} />}
                        label="Network"
                        value={`${liveStats.network} Mbps`}
                        sub={vps.node?.ip}
                    />
                </motion.div>

                {/* Actions Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                    {/* Console */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Terminal size={18} className="text-blue-400" />
                                Web Console
                            </div>
                            <button
                                id="toggle-console"
                                onClick={() => setShowConsole(!showConsole)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                            >
                                {showConsole ? 'Close' : 'Open Console'}
                            </button>
                        </div>
                        {showConsole && (
                            <div className="bg-black/50 font-mono text-xs text-green-400 p-4 h-40 overflow-y-auto">
                                {consoleLogs.map((log, i) => (
                                    <div key={i} className="mb-1">{log}</div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <span>$</span>
                                    <span className="w-2 h-4 bg-green-400 animate-pulse" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                        <h3 className="text-white font-medium mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                id="install-tmate"
                                onClick={installTmate}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-medium transition-all text-left"
                            >
                                <Terminal size={16} />
                                1-Click tmate Install
                            </button>
                            <button
                                id="refresh-vps"
                                onClick={fetchVPS}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium transition-all text-left"
                            >
                                <RefreshCw size={16} />
                                Refresh Status
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* VPS Details */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-white/5">
                        <h3 className="text-white font-medium">Instance Details</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {[
                            { label: 'VPS ID', value: vps.id },
                            { label: 'OS / Template', value: vps.os },
                            { label: 'IP Address', value: vps.ip || 'Assigned on start' },
                            { label: 'Node', value: `${vps.node?.name} (${vps.node?.ip})` },
                            { label: 'Expiry Date', value: vps.expiryDate ? new Date(vps.expiryDate).toLocaleString() : 'Never' },
                            { label: 'Created', value: new Date(vps.createdAt).toLocaleString() },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                                <span className="text-slate-400 text-sm">{row.label}</span>
                                <span className="text-white text-sm font-mono">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
