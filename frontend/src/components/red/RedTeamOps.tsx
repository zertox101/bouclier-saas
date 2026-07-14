"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Skull, Play, ShieldAlert, Zap, Target,
    Network, Terminal, Activity, ChevronRight,
    Database, UserCheck, AlertTriangle, CheckCircle2,
    Lock, Globe, Search, Cpu, Plus, Trash2, Server,
    Eye, Shield, X, Wrench, Radio, Ghost, BarChart3,
    Layers, Fingerprint, Bug, Scan, Power, Download,
    Send, HardDrive, Crosshair
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA & TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Beacon {
    id: string;
    target: string;
    os: 'windows' | 'linux' | 'macos' | 'cloud';
    lastSeen: string;
    status: 'active' | 'dead' | 'staged';
    privilege: 'user' | 'system' | 'root';
}

interface EngagementTarget {
    id: string;
    label: string;
    host: string;
    type: 'public' | 'private';
    status: 'idle' | 'scanning' | 'pwned';
}

const APT_PROFILES = [
    { id: "APT-41", name: "Double Dragon", actor: "Winnti Group", risk: "Critical", focus: "Supply Chain / Finance" },
    { id: "APT-28", name: "Fancy Bear", actor: "GRU Unit 26165", risk: "High", focus: "Government / Mil" },
    { id: "LAZARUS", name: "Hidden Cobra", actor: "DPRK Bureau 121", risk: "Critical", focus: "SWIFT / Crypto" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RedTeamOps() {
    const [beacons, setBeacons] = useState<Beacon[]>([
        { id: "B-842", target: "10.0.1.42", os: "windows", lastSeen: "2s ago", status: "active", privilege: "system" },
        { id: "B-109", target: "db-prod.internal", os: "linux", lastSeen: "14s ago", status: "active", privilege: "user" },
        { id: "B-991", target: "gateway-01", os: "linux", lastSeen: "1m ago", status: "dead", privilege: "root" },
    ]);

    const [targets, setTargets] = useState<EngagementTarget[]>([]);

    useEffect(() => {
        const fetchRealTargets = async () => {
            try {
                const data = await apiClient('/api/assets');
                const realTargets = (Array.isArray(data) ? data : []).map((a: any) => ({
                    id: a.id.toString(),
                    label: a.name,
                    host: a.ip_address,
                    type: a.type.toLowerCase().includes('cloud') ? 'public' : 'private',
                    status: 'idle'
                }));
                setTargets(realTargets);
            } catch (e) {
                console.error("Failed to fetch real targets", e);
            }
        };
        fetchRealTargets();
    }, []);

    const [newTargetLabel, setNewTargetLabel] = useState('');
    const [newTargetHost, setNewTargetHost] = useState('');
    const [newTargetType, setNewTargetType] = useState<'public' | 'private'>('public');

    const [selectedTab, setSelectedTab] = useState<'beacons' | 'adversary' | 'targets'>('targets');
    const [isEngaged, setIsEngaged] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addTarget = async () => {
        if (!newTargetLabel || !newTargetHost) return;
        try {
            const a = await apiClient('/api/assets', {
                method: "POST",
                body: JSON.stringify({
                    asset_tag: `RT-${Date.now().toString().slice(-4)}`,
                    name: newTargetLabel,
                    type: newTargetType === 'public' ? 'cloud_server' : 'internal_server',
                    ip_address: newTargetHost,
                    risk_level: "High",
                    status: "Healthy",
                    performance_load: 0
                })
            });
            const newT: EngagementTarget = {
                id: a.id.toString(),
                label: a.name,
                host: a.ip_address,
                type: a.type.toLowerCase().includes('cloud') ? 'public' : 'private',
                status: 'idle'
            };
            setTargets([...targets, newT]);
            setNewTargetLabel('');
            setNewTargetHost('');
            setLogs(prev => [...prev, `[SYSTEM] Asset added to global inventory: ${a.name} (${a.ip_address})`]);
        } catch (e) {
            console.error(e);
            setLogs(prev => [...prev, `[CRITICAL] Database connection failed.`]);
        }
    };

    const removeTarget = async (id: string) => {
        try {
            await apiClient(`/api/assets/${id}`, { method: "DELETE" });
            setTargets(targets.filter(t => t.id !== id));
            setLogs(prev => [...prev, `[SYSTEM] Target ID:${id} removed from scope and inventory.`]);
        } catch (e) {
            console.error(e);
        }
    };

    const scanTarget = async (id: string) => {
        const t_info = targets.find(t => t.id === id);
        if (!t_info) return;
        
        setTargets(targets.map(t => t.id === id ? { ...t, status: 'scanning' } : t));
        setLogs(prev => [...prev, `[SCAN] Initiating Mythos AI recon on ${t_info.host}...`]);
        
        try {
            const data = await apiClient('/api/saas/control/redteam/mythos', {
                method: "POST",
                body: JSON.stringify({ target: t_info.host })
            });
            
            if (data.status === "success" || data.status === "completed") {
                setLogs(prev => [...prev, `[SUCCESS] Mythos Analysis Complete. Target: ${t_info.host}`]);
                if (data.findings && data.findings.length > 0) {
                    data.findings.forEach((finding: any) => {
                        setLogs(prev => [...prev, `[VULN] ${finding.vulnerability} (${finding.severity}) - ${finding.confidence}`]);
                    });
                } else {
                    setLogs(prev => [...prev, `[INFO] No critical vulnerabilities found by AI on ${t_info.host}.`]);
                }
            } else {
                setLogs(prev => [...prev, `[ERROR] Scan failed: ${data.error || 'Unknown error'}`]);
            }
        } catch (e) {
            setLogs(prev => [...prev, `[CRITICAL] Connection to Mythos engine failed.`]);
        } finally {
            setTargets(targets.map(t => t.id === id ? { ...t, status: 'idle' } : t));
        }
    };

    const runSimulation = async () => {
        setIsEngaged(true);
        setLogs(prev => [...prev, "[SYSTEM] Initializing Red Team operations..."]);
        
        try {
            const data = await apiClient('/api/saas/control/redteam/initialize', {
                method: "POST"
            });
            
            if (data.status === "success") {
                setLogs(prev => [...prev, `[SUCCESS] ${data.message}`]);
                data.modules.forEach((module: string) => {
                    setLogs(prev => [...prev, `[MODULE] ${module} loaded`]);
                });
                
                // Show tools status
                if (data.tools) {
                    data.tools.forEach((tool: any) => {
                        const status = tool.status === "available" ? "✓" : "✗";
                        setLogs(prev => [...prev, `[TOOL] ${status} ${tool.tool} - ${tool.description}`]);
                    });
                }
                
                setLogs(prev => [...prev, `[INFO] Readiness: ${data.readiness} tools operational`]);
            } else {
                throw new Error(data.message || "Initialization failed");
            }
        } catch (e: any) {
            setLogs(prev => [...prev, `[ERROR] Failed to initialize Red Team infrastructure: ${e.message}`]);
            setIsEngaged(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-400 font-sans selection:bg-red-500/30 overflow-hidden relative p-8">
            
            {/* ── Background Aesthetics ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/[0.03] rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-10 relative z-10">
                
                {/* ── Header: Offensive HUD ── */}
                <header className="flex flex-col lg:flex-row items-center justify-between gap-10 pb-10 border-b border-white/5">
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-red-600/20 rounded-[32px] blur-2xl group-hover:bg-red-600/30 transition-all animate-pulse" />
                            <div className="relative w-20 h-20 rounded-[28px] bg-black border border-white/10 flex items-center justify-center text-red-500 shadow-2xl">
                                <Skull className="w-12 h-12" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">RED_TEAM_COMMAND</h1>
                                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-400 uppercase tracking-widest italic shadow-lg shadow-red-500/10">v8.2 OPS</span>
                            </div>
                            <div className="flex items-center gap-6 mt-4 font-mono">
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live_C2_Link</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Radio className="w-3.5 h-3.5 text-red-500" /> Mythos Engine: Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 italic">Engagement Risk</p>
                             <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-red-500 italic">CRITICAL</span>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-red-600 shadow-[0_0_15px_#EF4444]" />
                                </div>
                             </div>
                        </div>
                        <button 
                            onClick={runSimulation}
                            disabled={isEngaged}
                            className={cn(
                                "px-10 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center gap-4 group",
                                isEngaged ? "bg-white/5 text-slate-600 cursor-not-allowed" : "bg-red-600 text-white shadow-2xl shadow-red-600/20 hover:scale-105 active:scale-95"
                            )}
                        >
                            <Power className="w-5 h-5 group-hover:rotate-90 transition-transform" /> {isEngaged ? "OPS_ENGAGED" : "INITIALIZE_SYSTEM"}
                        </button>
                    </div>
                </header>

                {/* ── Main Operations Grid ── */}
                <div className="grid grid-cols-12 gap-8">
                    
                    {/* Left: Tactical Navigation */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-6 space-y-2">
                            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 px-4">Tactical_Units</h2>
                            <NavTab active={selectedTab === 'targets'} onClick={() => setSelectedTab('targets')} icon={Target} label="Target Scope" count={targets.length} />
                        </div>

                        <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-32 h-32" />
                            </div>
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                                <Zap className="w-4 h-4 text-red-500" /> Active_Session_Intel
                            </h3>
                            <div className="space-y-4">
                                <StatItem label="Target Scope" value={targets.length.toString()} />
                                <StatItem label="C2 Success Rate" value={beacons.length > 0 ? `${Math.round((beacons.filter(b => b.status === 'active').length / beacons.length) * 100)}%` : "0%"} />
                                <StatItem label="Detection Risk" value={isEngaged ? "ELEVATED" : "LOW"} />
                            </div>
                        </div>
                    </div>

                    {/* Center: Workspace Panel */}
                    <div className="col-span-12 lg:col-span-9 flex flex-col space-y-8">
                        
                        <AnimatePresence mode="wait">
                            {selectedTab === 'targets' && (
                                <motion.div 
                                    key="targets" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} 
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between px-4">
                                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Target_Engagement_Scope</h2>
                                        <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">Scoping_Active</span>
                                    </div>

                                    {/* Advanced Add Target HUD */}
                                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                                            <Crosshair className="w-48 h-48" />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Target_Identity</label>
                                                    <input 
                                                        value={newTargetLabel}
                                                        onChange={e => setNewTargetLabel(e.target.value)}
                                                        placeholder="Label (ex: Central_DB_01)" 
                                                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-[12px] font-mono text-white placeholder:text-slate-800 outline-none focus:border-red-500/40 transition-all shadow-inner"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Infiltration_Point (Host/IP)</label>
                                                    <input 
                                                        value={newTargetHost}
                                                        onChange={e => setNewTargetHost(e.target.value)}
                                                        placeholder="10.0.x.x or domain.io" 
                                                        className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-[12px] font-mono text-white placeholder:text-slate-800 outline-none focus:border-red-500/40 transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Environment_Segment</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['public', 'private'] as const).map(t => (
                                                            <button 
                                                                key={t}
                                                                onClick={() => setNewTargetType(t)}
                                                                className={cn(
                                                                    "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                                    newTargetType === t ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20" : "bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400"
                                                                )}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={addTarget}
                                                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4" /> Add_To_Scope
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Targets Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {targets.map((target, idx) => (
                                            <motion.div 
                                                key={target.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-6 hover:border-red-500/30 transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                                            target.type === 'public' ? "bg-blue-600/10 border-blue-500/20 text-blue-500" : "bg-red-600/10 border-red-500/20 text-red-500"
                                                        )}>
                                                            {target.type === 'public' ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-[13px] font-black text-white uppercase italic tracking-tight">{target.label}</h3>
                                                            <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase tracking-tighter">{target.host}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeTarget(target.id)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono">
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn("w-2 h-2 rounded-full", target.status === 'idle' ? 'bg-slate-700' : 'bg-red-500 animate-pulse')} />
                                                        <span className="text-[9px] font-black text-slate-500 uppercase">{target.status}</span>
                                                    </div>
                                                    <button onClick={() => scanTarget(target.id)} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Launch_Recon</button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Console: Real-time logs */}
                        <div className="bg-[#050505] border border-white/5 rounded-[40px] p-10 font-mono shadow-2xl relative overflow-hidden h-80 flex flex-col">
                            <div className="flex items-center justify-between mb-8 shrink-0">
                                <div className="flex items-center gap-4">
                                    <Terminal className="w-5 h-5 text-red-500" />
                                    <h2 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Operation_Live_Console_v8</h2>
                                </div>
                                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Core_Kali_Engine_Active</span>
                            </div>
                            <div ref={logContainerRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[12px]">
                                {logs.length === 0 ? (
                                    <p className="text-slate-800 italic uppercase font-bold tracking-tighter tracking-tight animate-pulse text-center mt-12">Awaiting session engagement...</p>
                                ) : (
                                    logs.map((log, i) => (
                                        <p key={i} className={cn(
                                            "leading-relaxed font-bold tracking-tight",
                                            log.includes("EXEC") ? "text-yellow-500" :
                                            log.includes("SUCCESS") ? "text-emerald-500" :
                                            log.includes("PRIV") ? "text-red-500" :
                                            "text-slate-500"
                                        )}>
                                            <span className="text-slate-800 mr-4">[{new Date().toLocaleTimeString()}]</span>
                                            {log}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

// ── COMPONENT HELPERS ──

function NavTab({ active, onClick, icon: Icon, label, count }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full px-6 py-4 rounded-2xl flex items-center justify-between group transition-all",
                active ? "bg-red-600 text-white shadow-xl shadow-red-600/10" : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
            )}
        >
            <div className="flex items-center gap-4">
                <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-700 group-hover:text-red-500")} />
                <span className="text-[11px] font-black uppercase tracking-widest italic">{label}</span>
            </div>
            {count && <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-mono", active ? "bg-black/20" : "bg-white/5")}>{count}</span>}
        </button>
    );
}

function StatItem({ label, value }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-white italic">{value}</span>
        </div>
    );
}

function ActionButton({ icon: Icon, color }: any) {
    return (
        <button className={cn("w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all hover:scale-110", color)}>
            <Icon className="w-5 h-5" />
        </button>
    );
}
