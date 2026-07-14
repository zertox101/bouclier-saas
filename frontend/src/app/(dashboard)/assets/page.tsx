'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Server, Monitor as PCIcon, Smartphone, Globe,
    ShieldCheck, ShieldAlert, Search, Filter, Plus,
    MoreVertical, Activity, Cpu, Database, Wifi,
    ChevronRight, Lock, Eye, AlertTriangle, CheckCircle2,
    Download, RefreshCw, Zap, Radio, X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { apiClient, ApiError } from '@/lib/api-client';

const riskStyles: Record<string, string> = {
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    High: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]',
};

const statusStyles: Record<string, string> = {
    Healthy: 'bg-emerald-500',
    Warning: 'bg-yellow-400',
    Breached: 'bg-red-500 animate-pulse',
    Suspicious: 'bg-orange-400 animate-pulse',
};

const statusDot: Record<string, string> = {
    Healthy: 'text-emerald-400',
    Warning: 'text-yellow-400',
    Breached: 'text-red-500',
    Suspicious: 'text-orange-400',
};



export default function AssetsPage() {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [riskFilter, setRiskFilter] = useState('All');
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const data = await apiClient('/api/assets');
                const mapped = data.map((a: any) => ({
                    id: `AS-${String(a.id).padStart(3, '0')}`,
                    real_id: a.id,
                    name: a.name,
                    type: a.type,
                    ip: a.ip_address,
                    risk: a.risk_level,
                    status: a.status,
                    load: a.performance_load,
                    icon: a.type === 'Server' ? Server : a.type === 'Database' ? Database : a.type === 'Firewall' ? ShieldCheck : PCIcon,
                    os: a.type === 'Workstation' ? 'Windows 11' : 'Linux Kernel',
                    lastSeen: 'Live',
                    vulns: a.risk_level === 'High' ? 5 : a.risk_level === 'Medium' ? 2 : 0
                }));
                
                setAssets(mapped);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const filtered = assets.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.ip.includes(search) || a.type.toLowerCase().includes(search.toLowerCase());
        const matchRisk = riskFilter === 'All' || a.risk === riskFilter;
        return matchSearch && matchRisk;
    });

    const selectedAsset = assets.find(a => a.id === selectedId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12 relative z-10">

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/[0.01] p-8 rounded-[32px] border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)' }} />
                </div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Server className="h-4 w-4 text-cyan-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Inventory & Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-3 italic">
                        Asset <span className="text-cyan-400">Intelligence.</span>
                    </h1>
                    <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                        Complete inventory of managed nodes, sensors, and virtualized infrastructures. Real-time risk assessment synchronized with Casablanca SOC nodes.
                    </p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Global Status</span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Synchronized</span>
                    </div>
                    <button className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white flex items-center justify-center transition-all">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button className="h-12 px-5 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest">
                        <Filter className="h-4 w-4" /> Filters
                    </button>
                    <button className="btn-cyber flex items-center gap-3 text-[11px] font-black h-12 px-6">
                        <Plus className="h-4 w-4" /> Provision Node
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="premium-card p-6 group relative overflow-hidden"
                    >
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="h-24 w-24" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", stat.bg, stat.color, stat.border)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter italic mb-1">{stat.value}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content: table + checklist */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Asset Table */}
                <div className="xl:col-span-2 premium-card !p-0 overflow-hidden shadow-2xl">
                    {/* Table Search & Filter Bar */}
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]">
                        <div className="relative w-full sm:w-[320px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="SEARCH NODE_ID, IP, CLASS..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black text-white placeholder:text-slate-800 focus:outline-none focus:border-cyan-500/30 transition-all uppercase tracking-widest font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {['All', 'Low', 'Medium', 'High'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRiskFilter(r)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                                        riskFilter === r
                                            ? "bg-white/10 text-white border-white/20"
                                            : "text-slate-500 border-white/5 hover:text-white hover:bg-white/[0.03]"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset / Classification</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">IP Address</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Exposure</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Pulse</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                <AnimatePresence>
                                    {filtered.map((asset, idx) => (
                                        <motion.tr
                                            key={asset.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            onClick={() => setSelectedId(prev => prev === asset.id ? null : asset.id)}
                                            className={cn(
                                                "group hover:bg-white/[0.03] transition-colors cursor-pointer",
                                                selectedId === asset.id && "bg-white/[0.04] border-l-2 border-l-cyan-500"
                                            )}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl bg-black/40 border flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all",
                                                        selectedId === asset.id ? 'border-cyan-500/30 text-cyan-400' : 'border-white/10'
                                                    )}>
                                                        <asset.icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors italic">{asset.name}</div>
                                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-0.5">{asset.type} · {asset.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-mono text-[10px] text-slate-400 flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-cyan-500 rounded-full" />
                                                    {asset.ip}
                                                </div>
                                                <div className="text-[8px] text-slate-700 font-mono mt-0.5">{asset.os}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                    riskStyles[asset.risk]
                                                )}>
                                                    {asset.risk}
                                                </span>
                                                {asset.vulns > 0 && (
                                                    <div className="text-[8px] text-red-400 font-black mt-1">{asset.vulns} vulns</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="min-w-[120px]">
                                                    <div className="flex justify-between text-[8px] font-black mb-1">
                                                        <span className={statusDot[asset.status]}>{asset.status}</span>
                                                        <span className="text-white">{asset.load}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${asset.load}%` }}
                                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                                            className={cn("h-full rounded-full", statusStyles[asset.status])}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setSelectedId(asset.id); }}
                                                        className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
                                                    >
                                                        Inspect
                                                    </button>
                                                    <button
                                                        onClick={e => e.stopPropagation()}
                                                        className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/10 text-slate-600 hover:text-white transition-all flex items-center justify-center"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Casablanca_SOC_Node_01 // Synced 2m ago
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="h-8 px-4 rounded-lg border border-white/5 text-[8px] font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all">← Previous</button>
                            <button className="h-8 px-4 rounded-lg border border-white/5 text-[8px] font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all">Next →</button>
                        </div>
                    </div>
                </div>

                {/* Right Side Panel */}
                <div className="space-y-6 xl:col-span-1">
                    {/* Asset Detail */}
                    <AnimatePresence mode="wait">
                        {selectedAsset ? (
                            <motion.div
                                key={selectedAsset.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="premium-card overflow-hidden"
                            >
                                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <selectedAsset.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase tracking-tight italic">{selectedAsset.name}</div>
                                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{selectedAsset.id}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedId(null)} className="h-7 w-7 rounded-lg bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white flex items-center justify-center transition-all">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'IP Address', value: selectedAsset.ip },
                                            { label: 'OS', value: selectedAsset.os },
                                            { label: 'Risk Level', value: selectedAsset.risk },
                                            { label: 'CPU Load', value: `${selectedAsset.load}%` },
                                            { label: 'Status', value: selectedAsset.status },
                                            { label: 'Vulns Found', value: String(selectedAsset.vulns) },
                                        ].map(item => (
                                            <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                                <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.label}</div>
                                                <div className="text-[10px] font-black text-white font-mono">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <button className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2 justify-center">
                                            <Lock className="h-3 w-3" /> Isolate from Network
                                        </button>
                                        <button className="w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-2 justify-center">
                                            <Eye className="h-3 w-3" /> Run Vulnerability Scan
                                        </button>
                                        <button className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-500 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                                            <Download className="h-3 w-3" /> Export Node Report
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="premium-card p-8 flex flex-col items-center justify-center text-center border-dashed min-h-[200px]"
                            >
                                <Server className="h-10 w-10 text-slate-800 mb-3" />
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Select an asset to inspect</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Risk Breakdown */}
                    <div className="premium-card p-5">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-400" /> Risk Distribution
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Low Risk', count: 3, pct: 50, color: 'bg-emerald-500' },
                                { label: 'Medium Risk', count: 2, pct: 33, color: 'bg-yellow-400' },
                                { label: 'High Risk', count: 1, pct: 17, color: 'bg-red-500' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-slate-400">{item.label}</span>
                                        <span className="text-white">{item.count} nodes</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.pct}%` }}
                                            transition={{ duration: 1.2, ease: 'easeOut' }}
                                            className={cn("h-full rounded-full", item.color)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Checklist */}
                    <div className="premium-card p-5">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Operational Checklist
                        </h3>
                        <div className="space-y-2">
                            {CHECKLIST.map((item, i) => (
                                <div key={i} className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                    item.done
                                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                                        : "bg-white/[0.02] border-white/5 text-slate-500"
                                )}>
                                    <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0",
                                        item.done ? "bg-emerald-500/20 border-emerald-500/40" : "border-white/10"
                                    )}>
                                        {item.done && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />}
                                    </div>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
