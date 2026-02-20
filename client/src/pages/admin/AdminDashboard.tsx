import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import {
    Server, Users, Shield, Plus, Trash2,
    Activity, Cpu, MemoryStick, HardDrive, Network
} from 'lucide-react';

// ─── Admin Overview ──────────────────────────────────────────
function AdminOverview() {
    const [stats, setStats] = useState({ vps: 0, users: 0, nodes: 0, running: 0 });
    const [vpsList, setVpsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [vpsRes, nodesRes] = await Promise.all([
                    api.get('/vps'),
                    api.get('/nodes'),
                ]);
                const allVPS = vpsRes.data;
                const allNodes = nodesRes.data;
                setVpsList(allVPS.slice(0, 5));
                setStats({
                    vps: allVPS.length,
                    users: 0, // will add users endpoint later
                    nodes: allNodes.length,
                    running: allVPS.filter((v: any) => v.status === 'running').length,
                });
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
                <p className="text-slate-400 text-sm mt-1">System-wide statistics and activity</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total VPS', value: stats.vps, icon: <Server size={20} />, color: 'text-blue-400' },
                    { label: 'Running VPS', value: stats.running, icon: <Activity size={20} />, color: 'text-emerald-400' },
                    { label: 'Active Nodes', value: stats.nodes, icon: <Shield size={20} />, color: 'text-purple-400' },
                    { label: 'Total Users', value: stats.users, icon: <Users size={20} />, color: 'text-cyan-400' },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                        <div className={`${s.color} mb-3`}>{s.icon}</div>
                        <div className="text-2xl font-bold text-white">{loading ? '...' : s.value}</div>
                        <div className="text-slate-400 text-sm">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                    <h2 className="text-white font-semibold">Recent VPS Instances</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {loading ? (
                        [1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse bg-white/[0.02]" />)
                    ) : vpsList.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No VPS found</div>
                    ) : vpsList.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Server size={14} className="text-blue-400" /></div>
                                <div>
                                    <div className="text-white text-sm font-medium">{v.name}</div>
                                    <div className="text-slate-500 text-xs">{v.os} • {v.node?.name}</div>
                                </div>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${v.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                {v.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Admin VPS Manager ───────────────────────────────────────
function AdminVPSManager() {
    const [vpsList, setVpsList] = useState<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', os: 'ubuntu:24.04', cpu: '1', ram: '512', disk: '10', userId: '', nodeId: '', expiryDays: '30' });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const load = async () => {
        try {
            const [vpsRes, nodesRes] = await Promise.all([api.get('/vps'), api.get('/nodes')]);
            setVpsList(vpsRes.data);
            setNodes(nodesRes.data);
        } catch { } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        setCreateError('');
        setCreating(true);
        try {
            const expiryDate = form.expiryDays ? new Date(Date.now() + parseInt(form.expiryDays) * 86400000).toISOString() : undefined;
            await api.post('/vps', { ...form, expiryDate });
            setShowCreate(false);
            setForm({ name: '', os: 'ubuntu:24.04', cpu: '1', ram: '512', disk: '10', userId: '', nodeId: '', expiryDays: '30' });
            await load();
        } catch (err: any) {
            setCreateError(err?.response?.data?.error || 'Create failed');
        } finally { setCreating(false); }
    };

    const handleAction = async (id: string, action: string) => {
        try { await api.post(`/vps/${id}/action`, { action }); await load(); }
        catch (e: any) { alert(e?.response?.data?.error || 'Action failed'); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try { await api.delete(`/vps/${id}`); await load(); }
        catch (e: any) { alert(e?.response?.data?.error || 'Delete failed'); }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">VPS Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Create, manage, and monitor all VPS instances</p>
                </div>
                <button
                    id="admin-create-vps-btn"
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={16} /> Create VPS
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-white font-semibold mb-5">New VPS Instance</h2>
                    {createError && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{createError}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'VPS Name', key: 'name', placeholder: 'my-vps-01', type: 'text' },
                            { label: 'CPU Cores', key: 'cpu', placeholder: '1', type: 'number' },
                            { label: 'RAM (MB)', key: 'ram', placeholder: '512', type: 'number' },
                            { label: 'Disk (GB)', key: 'disk', placeholder: '10', type: 'number' },
                            { label: 'Expiry (days)', key: 'expiryDays', placeholder: '30', type: 'number' },
                            { label: 'User ID', key: 'userId', placeholder: 'User UUID', type: 'text' },
                        ].map((f) => (
                            <div key={f.key}>
                                <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                                <input
                                    id={`create-${f.key}`}
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={(form as any)[f.key]}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/5 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">OS</label>
                            <select
                                id="create-os"
                                value={form.os}
                                onChange={(e) => setForm((prev) => ({ ...prev, os: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/5 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="ubuntu:24.04">Ubuntu 24.04</option>
                                <option value="debian:12">Debian 12</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Node</label>
                            <select
                                id="create-node"
                                value={form.nodeId}
                                onChange={(e) => setForm((prev) => ({ ...prev, nodeId: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/5 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="">Select node...</option>
                                {nodes.map((n: any) => <option key={n.id} value={n.id}>{n.name} ({n.ip})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <button id="admin-confirm-create" onClick={handleCreate} disabled={creating} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all">
                            {creating ? 'Creating...' : 'Create VPS'}
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* VPS Table */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left">
                                {['Name', 'OS', 'User', 'Node', 'Status', 'Expiry', 'Actions'].map((h) => (
                                    <th key={h} className="px-5 py-3.5 text-xs font-medium text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                                ))
                            ) : vpsList.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No VPS instances</td></tr>
                            ) : vpsList.map((v: any) => (
                                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4 text-white text-sm font-medium">{v.name}</td>
                                    <td className="px-5 py-4 text-slate-400 text-sm">{v.os}</td>
                                    <td className="px-5 py-4 text-slate-400 text-sm font-mono text-xs">{v.userId?.slice(0, 8)}...</td>
                                    <td className="px-5 py-4 text-slate-400 text-sm">{v.node?.name}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${v.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : v.status === 'suspended' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400 text-sm">
                                        {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleAction(v.id, 'start')} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Start">▶</button>
                                            <button onClick={() => handleAction(v.id, 'stop')} className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-all" title="Stop">■</button>
                                            <button onClick={() => handleDelete(v.id, v.name)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Delete"><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Node Manager ──────────────────────────────────────
function AdminNodeManager() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', ip: '', cpu: '4', ram: '8192', disk: '500' });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try { const res = await api.get('/nodes'); setNodes(res.data); }
        catch { } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        setSaving(true);
        try { await api.post('/nodes', form); setShowForm(false); setForm({ name: '', ip: '', cpu: '4', ram: '8192', disk: '500' }); await load(); }
        catch (e: any) { alert(e?.response?.data?.error || 'Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete node "${name}"?`)) return;
        try { await api.delete(`/nodes/${id}`); await load(); }
        catch (e: any) { alert(e?.response?.data?.error || 'Failed'); }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Node Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage physical and virtual nodes</p>
                </div>
                <button id="add-node-btn" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={16} /> Add Node
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-6 mb-6">
                    <h2 className="text-white font-semibold mb-5">New Node</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Node Name', key: 'name', placeholder: 'US-East-1' },
                            { label: 'IP Address', key: 'ip', placeholder: '192.168.1.10' },
                            { label: 'CPU Cores', key: 'cpu', placeholder: '4' },
                            { label: 'Total RAM (MB)', key: 'ram', placeholder: '8192' },
                            { label: 'Total Disk (GB)', key: 'disk', placeholder: '500' },
                        ].map((f) => (
                            <div key={f.key}>
                                <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                                <input
                                    id={`node-${f.key}`}
                                    type="text"
                                    placeholder={f.placeholder}
                                    value={(form as any)[f.key]}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/5 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button id="confirm-add-node" onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm">
                            {saving ? 'Adding...' : 'Add Node'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm">Cancel</button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-44 bg-slate-900/40 rounded-2xl border border-white/5 animate-pulse" />)
                ) : nodes.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-slate-500">No nodes yet. Add your first node.</div>
                ) : nodes.map((node: any) => (
                    <motion.div key={node.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"><Network size={18} className="text-purple-400" /></div>
                                <div>
                                    <div className="text-white font-semibold">{node.name}</div>
                                    <div className="text-slate-500 text-xs font-mono">{node.ip}</div>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{node.status}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            {[
                                { icon: <Cpu size={13} />, label: 'CPU', val: `${node.cpu} cores` },
                                { icon: <MemoryStick size={13} />, label: 'RAM', val: `${node.ram} MB` },
                                { icon: <HardDrive size={13} />, label: 'Disk', val: `${node.disk} GB` },
                            ].map((r) => (
                                <div key={r.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-500">{r.icon}{r.label}</div>
                                    <span className="text-slate-300">{r.val}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            id={`delete-node-${node.id}`}
                            onClick={() => handleDelete(node.id, node.name)}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 text-sm rounded-xl transition-all"
                        >
                            <Trash2 size={14} /> Remove Node
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Admin User Manager ──────────────────────────────────────
function AdminUserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch { } finally { setLoading(false); }
    };
    useEffect(() => { loadUsers(); }, []);

    const toggleRole = async (id: string, currentRole: string) => {
        try {
            const newRole = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
            await api.patch(`/admin/users/${id}`, { role: newRole });
            await loadUsers();
        } catch (e: any) { alert(e?.response?.data?.error || 'Update failed'); }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            await loadUsers();
        } catch (e: any) { alert(e?.response?.data?.error || 'Delete failed'); }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-slate-400 text-sm mt-1">Manage user roles and accounts</p>
            </div>

            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-5 py-3.5 text-xs font-medium text-slate-400">User</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-slate-400">Role</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-slate-400">Joined</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-slate-400">VPS Count</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>)
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">{u.name.charAt(0)}</div>
                                            <div>
                                                <div className="text-white text-sm font-medium">{u.name}</div>
                                                <div className="text-slate-500 text-xs">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-slate-400 text-sm">{u._count?.vps || 0}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleRole(u.id, u.role)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all">
                                                Change Role
                                            </button>
                                            <button onClick={() => deleteUser(u.id, u.name)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Dashboard Wrapper ────────────────────────────────
export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <Routes>
                <Route path="/" element={<AdminOverview />} />
                <Route path="/vps" element={<AdminVPSManager />} />
                <Route path="/users" element={<AdminUserManager />} />
                <Route path="/nodes" element={<AdminNodeManager />} />
            </Routes>
        </DashboardLayout>
    );
}
