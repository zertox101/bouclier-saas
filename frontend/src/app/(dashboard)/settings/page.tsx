"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    Settings, User, Shield, Bell, Key,
    Database, Globe, Palette, Mail,
    Trash2, CreditCard, Lock, Eye,
    EyeOff, Check, AlertCircle, Zap,
    Monitor, Cpu, Cloud, Terminal, Radio,
    Target, Fingerprint, Layers, Activity, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";

const COLORS = {
    critical: '#ff1744', 
    high: '#ff9100',     
    medium: '#ffea00',   
    normal: '#00e676',   
    info: '#2979ff',     
    purple: '#d500f9',   
    bgDark: '#05070a'
};

const SECTIONS = [
    { id: "organization", label: "Organization", icon: Globe, desc: "Workspace and team control" },
    { id: "security", label: "Security & Auth", icon: Shield, desc: "Encryption and protection" },
    { id: "notifications", label: "Intelligence Alerts", icon: Bell, desc: "Traffic and scan notifications" },
    { id: "api", label: "API & Uplinks", icon: Terminal, desc: "External system integrations" },
    { id: "billing", label: "Billing & Plans", icon: CreditCard, desc: "Subscription and invoices" },
    { id: "system", label: "Core Modules", icon: Database, desc: "Node health and logging" },
    { id: "profile", label: "My Profile", icon: User, desc: "Personal identity and access" }, 
];

import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeSection, setActiveSection] = useState("organization");

    return (
        <div className="min-h-screen bg-[#05070a] text-slate-400 font-sans p-4 lg:p-6 selection:bg-blue-600/30 overflow-x-hidden relative">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[0]" 
                 style={{ backgroundImage: 'linear-gradient(#2979ff 1px, transparent 1px), linear-gradient(90deg, #2979ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#05070a_100%)] z-[1]" />

            <header className="flex items-center justify-between mb-8 relative z-10 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Settings className="w-5 h-5 text-blue-500" />
                        </div>
                        BOUCLIER <span className="text-blue-500">CONTROL</span>
                    </h1>
                    <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase mt-2">System Parameters // Global Neural Configuration</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shadow-[0_0_15px_rgba(41,121,255,0.2)]">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Uplink Encrypted</span>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8 items-start relative z-10">
                <div className="col-span-12 lg:col-span-3 space-y-3">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden backdrop-blur-xl",
                                activeSection === section.id
                                    ? "bg-blue-500/10 border-blue-500/40 text-white shadow-[0_0_20px_rgba(41,121,255,0.1)]"
                                    : "bg-[#0d1117]/70 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                            )}
                        >
                            <section.icon className={cn(
                                "w-4 h-4 transition-colors",
                                activeSection === section.id ? "text-blue-500" : "text-slate-500 group-hover:text-blue-400"
                            )} />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">{section.label}</div>
                                <div className="text-[8px] text-slate-600 font-bold uppercase">{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="col-span-12 lg:col-span-9">
                    <div className="bg-[#0d1117]/70 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 min-h-[600px] shadow-2xl relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="relative z-10"
                            >
                                {activeSection === "profile" && <ProfileSection session={session} />}
                                {activeSection === "security" && <SecuritySection session={session} />}
                                {activeSection === "organization" && <OrganizationSection session={session} />}
                                {activeSection === "api" && <ApiSection session={session} />}
                                {activeSection === "notifications" && <NotificationsSection session={session} />}
                                {activeSection === "billing" && <BillingSection session={session} />}
                                {activeSection === "system" && <SystemSection />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(41, 121, 255, 0.3); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(41, 121, 255, 0.6); }
            `}</style>
        </div>
    );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="mb-10 space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">{title}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{desc}</p>
        </div>
    );
}

function authHeaders(session: any) {
    const token = session?.user?.accessToken || typeof window !== 'undefined' && localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function apiGet(path: string, session: any) {
    return apiClient(path);
}

async function apiPut(path: string, body: any, session: any) {
    return apiClient(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

async function apiPost(path: string, body: any, session: any) {
    return apiClient(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

async function apiDelete(path: string, session: any) {
    return apiClient(path, { method: 'DELETE' });
}

function ProfileSection({ session }: any) {
    const [profile, setProfile] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        apiGet('/api/settings/profile', session).then(d => {
            if (d) { setProfile(d); setUsername(d.username); setEmail(d.email); }
        });
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        const res = await apiPut('/api/settings/profile', { username, email }, session);
        if (res) setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-10">
            <SectionHeader title="Neural Identity" desc="Operator verification credentials" />

            <div className="flex items-center gap-10 p-8 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-blue-400">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-blue-500" />
                        )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-blue-500 text-white rounded-xl shadow-xl hover:scale-110 transition-transform">
                        <Palette className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <div className="text-2xl font-black text-white italic truncate">{profile?.username || session?.user?.name || "OPERATOR_GUEST"}</div>
                        <div className="text-xs text-blue-500 font-mono tracking-widest uppercase">BOUCLIER_ID_{String(profile?.id || session?.user?.id || "X").substring(0, 8)}</div>
                    </div>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-slate-400 border border-white/10 rounded-lg tracking-widest">Level_{profile?.plan || session?.user?.orgPlan || "Pro"}</span>
                        <span className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-slate-400 border border-white/10 rounded-lg tracking-widest">{profile?.role || "Admin"}_Priv</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Display Name</label>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-white italic tracking-widest focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>
                <InputGroup label="Email Channel" defaultValue={email || session?.user?.email || ""} icon={Mail} onChange={setEmail} />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all disabled:opacity-50">
                    {saving ? 'SAVING...' : saved ? 'SAVED' : 'Sync_Identity'}
                </button>
            </div>
        </div>
    );
}

function SecuritySection({ session }: any) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        setMessage('');
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        const res = await apiPost('/api/settings/change-password', { current_password: currentPassword, new_password: newPassword }, session);
        if (res) {
            setMessage(res.message || 'Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError('Failed to update password. Check current password.');
        }
    };

    return (
        <div className="space-y-10">
            <SectionHeader title="Encryption Guard" desc="Authentication layer configuration" />

            <div className="grid gap-6">
                <PanelRow title="Dual-Phase Auth" desc="Extra biometric or hardware verification" status="DEACTIVATED" color={COLORS.critical} />
                <PanelRow title="Session Lockdown" desc="Auto-terminate inactive uplinks" status="ACTIVE" color={COLORS.normal} />
                <PanelRow title="Neural Encryption" desc="Quantum-resistant password hashing" status="HARDENED" color={COLORS.info} />
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-2xl space-y-8 backdrop-blur-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Update Credentials</h3>
                {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">{error}</div>}
                {message && <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">{message}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Current Pulse" placeholder="••••••••" type="password" value={currentPassword} onChange={setCurrentPassword} />
                    <div className="hidden md:block" />
                    <InputGroup label="New Matrix" placeholder="••••••••" type="password" value={newPassword} onChange={setNewPassword} />
                    <InputGroup label="Confirm Matrix" placeholder="••••••••" type="password" value={confirmPassword} onChange={setConfirmPassword} />
                </div>
                <button onClick={handleChangePassword} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">
                    Inject_New_Credentials
                </button>
            </div>
        </div>
    );
}

function ApiSection({ session }: any) {
    const [keys, setKeys] = useState<any[]>([]);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newScope, setNewScope] = useState('read');

    const loadKeys = useCallback(async () => {
        const data = await apiGet('/api/settings/api-keys', session);
        if (Array.isArray(data)) setKeys(data);
    }, [session]);

    useEffect(() => { loadKeys(); }, [loadKeys]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const res = await apiPost('/api/settings/api-keys', { name: newName, scope: newScope }, session);
        if (res) {
            await loadKeys();
            setShowNewForm(false);
            setNewName('');
        }
    };

    const handleDelete = async (keyId: number) => {
        const res = await apiDelete(`/api/settings/api-keys/${keyId}`, session);
        if (res) await loadKeys();
    };

    return (
        <div className="space-y-10">
            <SectionHeader title="System Uplinks" desc="Neural connections and system integrations" />

            <div className="space-y-4">
                {keys.map((api: any) => (
                    <div key={api.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/20 transition-all group backdrop-blur-xl">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-white italic uppercase tracking-tighter">{api.name}</div>
                                <div className="text-[10px] font-mono text-slate-500 tracking-wider font-bold">{api.key}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-slate-500 uppercase">{api.created_at}</span>
                            <button onClick={() => handleDelete(api.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {keys.length === 0 && (
                <div className="text-center py-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest">No API keys configured</div>
            )}

            {showNewForm ? (
                <div className="p-8 bg-white/5 border border-blue-500/20 rounded-2xl space-y-6 backdrop-blur-xl">
                    <InputGroup label="Key Name" placeholder="e.g. Production SIEM" value={newName} onChange={setNewName} />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Scope</label>
                        <select value={newScope} onChange={e => setNewScope(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-white italic tracking-widest focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-inner">
                            <option value="read">Read Only</option>
                            <option value="read_write">Read & Write</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowNewForm(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Cancel</button>
                        <button onClick={handleCreate} className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">Generate_Key</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowNewForm(true)} className="w-full py-10 border-2 border-dashed border-white/5 hover:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group backdrop-blur-xl">
                    <div className="p-4 bg-white/5 rounded-xl text-slate-500 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Initialize_New_Uplink</span>
                </button>
            )}
        </div>
    );
}

function NotificationsSection({ session }: any) {
    const [prefs, setPrefs] = useState<any>(null);

    useEffect(() => {
        apiGet('/api/settings/notifications', session).then(d => {
            if (d) setPrefs(d);
        });
    }, [session]);

    const toggle = async (key: string) => {
        const updated = { ...prefs, [key]: !prefs[key] };
        const res = await apiPut('/api/settings/notifications', updated, session);
        if (res) setPrefs(updated);
    };

    if (!prefs) return <div className="text-center py-20 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Loading...</div>;

    return (
        <div className="space-y-10">
            <SectionHeader title="Comms Center" desc="Traffic alerts and intelligence signal" />

            <div className="space-y-3">
                <ToggleRow title="Security Anomalies" desc="Critical threat level alerts" active={prefs.security_anomalies} onToggle={() => toggle('security_anomalies')} />
                <ToggleRow title="Scan Reports" desc="Completion matrix for system audits" active={prefs.scan_reports} onToggle={() => toggle('scan_reports')} />
                <ToggleRow title="Audit Logs" desc="Low-level telemetry tracking" active={prefs.audit_logs} onToggle={() => toggle('audit_logs')} />
                <ToggleRow title="AI Insights" desc="Sentinel intelligence commentary" active={prefs.ai_insights} onToggle={() => toggle('ai_insights')} />
            </div>
        </div>
    );
}

function OrganizationSection({ session }: any) {
    const [orgData, setOrgData] = useState<any>(null);
    const [assetsCount, setAssetsCount] = useState<number | "..." >( "..." );

    useEffect(() => {
        apiGet('/api/settings/org', session).then(d => setOrgData(d));
        apiClient('/api/assets').then(d => setAssetsCount(Array.isArray(d) ? d.length : 0)).catch(() => setAssetsCount(0));
    }, [session]);

    const orgName = orgData?.name || session?.user?.orgName || "BOUCLIER_PRIME";
    const orgPlan = orgData?.plan || session?.user?.orgPlan || "ENTERPRISE";

    return (
        <div className="space-y-10">
            <SectionHeader title="Governance" desc="Workspace and hierarchy settings" />

            <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-8 opacity-20"><Cloud className="w-20 h-20 text-blue-500" /></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{orgName}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-6 italic">{orgPlan} Workspace Deployment</p>

                    <div className="grid grid-cols-3 gap-8">
                        <StatCell label="Active Nodes" value={assetsCount} />
                        <StatCell label="Team Slots" value="1 / 5" />
                        <StatCell label="Tier Status" value={orgPlan} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-3 italic">
                    <div className="w-4 h-px bg-white/20" /> Tactical Team <div className="w-4 h-px bg-white/20" />
                </h3>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-white/5 flex items-center justify-center text-blue-500">
                            {session?.user?.image ? <img src={session.user.image} className="w-full h-full rounded-xl object-cover" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                            <div className="text-xs font-black text-white italic uppercase">{session?.user?.name || "Global_Admin"}</div>
                            <div className="text-[9px] text-slate-500 opacity-60 font-bold uppercase tracking-widest">{session?.user?.email || "admin@bouclier.ma"}</div>
                        </div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-widest">Root</span>
                </div>
            </div>
        </div>
    );
}

function SystemSection() {
    const [health, setHealth] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await apiClient('/api/saas/control/health');
                setHealth(data);
            } catch (e) {
                console.error("Failed to fetch health data");
            }
        };
        fetchHealth();
        const intv = setInterval(fetchHealth, 10000);
        return () => clearInterval(intv);
    }, []);

    const computeRaw = health?.metrics?.neural_compute || "0% CPU / 0% RAM";
    const [cpuStr, ramStr] = computeRaw.split(' / ');
    const cpuVal = cpuStr?.replace(' CPU', '') || '0%';
    const ramVal = ramStr?.replace(' RAM', '') || '0%';

    return (
        <div className="space-y-10">
            <SectionHeader title="Neural Health" desc="System core metrics and logging" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6 backdrop-blur-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Hardware Matrix
                    </h4>
                    <div className="space-y-4">
                        <MetricRow label="CPU Lattice" value={cpuVal} color="blue-500" />
                        <MetricRow label="Memory Pool" value={ramVal} color="emerald-500" />
                        <MetricRow label="Database Link" value={health?.core?.database || "PENDING"} color={health?.core?.database?.includes('online') ? "emerald-500" : "amber-500"} />
                        <MetricRow label="LLM Neural Engine" value={health?.core?.llm || "PENDING"} color={health?.core?.llm === 'online' ? "emerald-500" : "red-500"} />
                    </div>
                </div>

                <div className="p-6 bg-black/50 rounded-2xl border border-white/5 space-y-4 font-mono backdrop-blur-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 font-sans">
                        <Database className="w-4 h-4" /> Live Log Feed
                    </h4>
                    <div className="h-40 overflow-y-auto text-[8px] space-y-1 text-emerald-500/70 custom-scrollbar pr-4 italic">
                        {health ? (
                            <>
                                <div className="flex gap-2"><span className="opacity-30">[{new Date().toLocaleTimeString()}]</span><span className="text-blue-400">&gt;</span> SYSTEM_SYNC_OK</div>
                                <div className="flex gap-2"><span className="opacity-30">[{new Date().toLocaleTimeString()}]</span><span className="text-blue-400">&gt;</span> REDIS_CACHE: {health.core.redis.toUpperCase()}</div>
                                <div className="flex gap-2"><span className="opacity-30">[{new Date().toLocaleTimeString()}]</span><span className="text-amber-500">!</span> TOTAL_ALERTS: {health.metrics.total_alerts}</div>
                                <div className="flex gap-2"><span className="opacity-30">[{new Date().toLocaleTimeString()}]</span><span className="text-blue-400">&gt;</span> BYPASS_EFFICIENCY: {health.metrics.bypass_efficiency}</div>
                                <div className="flex gap-2 animate-pulse mt-2"><span className="opacity-30">[{new Date().toLocaleTimeString()}]</span><span className="text-blue-500">&gt;</span> LISTENING_FOR_PULSE_</div>
                            </>
                        ) : (
                            <div className="flex gap-2 animate-pulse"><span className="opacity-30">[--:--:--]</span><span className="text-blue-500">&gt;</span> INITIALIZING_NEURAL_LINK...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BillingSection({ session }: any) {
    const [orgInfo, setOrgInfo] = useState<any>(null);
    const [upgrading, setUpgrading] = useState(false);
    const [upgradeMsg, setUpgradeMsg] = useState('');

    useEffect(() => {
        apiGet('/api/settings/org', session).then(d => setOrgInfo(d));
    }, [session]);

    const plan = orgInfo?.plan || session?.user?.orgPlan || "FREE";

    const handleUpgrade = async (newPlan: string) => {
        setUpgrading(true);
        setUpgradeMsg('');
        const res = await apiPost('/api/settings/upgrade', { new_plan: newPlan }, session);
        if (res) {
            setUpgradeMsg(`Plan upgraded to ${res.new_plan}`);
            setOrgInfo((prev: any) => ({ ...prev, plan: res.new_plan }));
        } else {
            setUpgradeMsg('Upgrade failed');
        }
        setUpgrading(false);
        setTimeout(() => setUpgradeMsg(''), 5000);
    };

    return (
        <div className="space-y-10">
            <SectionHeader title="Subscription Plan" desc="Compare and manage your tier" />

            <div className="p-8 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Current Plan: {plan}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Renewal: Jan 12, 2027</p>
                    </div>
                    <div className="flex gap-2">
                        {['FREE', 'PRO', 'ENTERPRISE'].map(p => (
                            <button key={p} onClick={() => handleUpgrade(p.toLowerCase())} disabled={upgrading || plan === p}
                                className={cn(
                                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    plan === p
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                )}>
                                {plan === p ? '✓ ' : ''}{p}
                            </button>
                        ))}
                    </div>
                </div>

                {upgradeMsg && (
                    <div className={cn("p-4 mb-6 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        upgradeMsg.includes('failed') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    )}>{upgradeMsg}</div>
                )}

                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 block italic">Plan Comparison Matrix</h4>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 backdrop-blur-md">
                    <FeatureComparison />
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, defaultValue, type = "text", placeholder, icon: Icon, value, onChange }: any) {
    const inputValue = value !== undefined ? value : defaultValue;
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />}
                <input
                    type={type}
                    value={inputValue}
                    onChange={e => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-6 py-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-white italic tracking-widest focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-inner",
                        Icon ? "pl-14" : ""
                    )}
                />
            </div>
        </div>
    );
}

function PanelRow({ title, desc, status, color }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all backdrop-blur-xl">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center text-slate-500 shadow-inner">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xs font-black text-white uppercase italic">{title}</div>
                    <div className="text-[9px] text-slate-500 opacity-60 font-bold uppercase tracking-wider">{desc}</div>
                </div>
            </div>
            <div className="px-4 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest" 
                 style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                {status}
            </div>
        </div>
    );
}

function ToggleRow({ title, desc, active, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl">
            <div>
                <div className="text-xs font-black text-white uppercase italic tracking-tighter">{title}</div>
                <div className="text-[10px] text-slate-500 opacity-60 font-bold uppercase italic">{desc}</div>
            </div>
            <button onClick={onToggle} className={cn("w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner", active ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-white/5 border border-white/5")}>
                <div className={cn("absolute top-1.5 w-4 h-4 bg-white rounded-md shadow-xl transition-all duration-300", active ? "right-1.5 rotate-45" : "left-1.5 rotate-0")} />
            </button>
        </div>
    );
}

function StatCell({ label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-50">{label}</div>
            <div className="text-xl font-black text-white italic">{value}</div>
        </div>
    );
}

function MetricRow({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className={`text-${color}`}>{value}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", `bg-${color}`)} style={{ width: value.includes('%') ? value : '65%' }} />
            </div>
        </div>
    );
}
