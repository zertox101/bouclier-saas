'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Globe, Search, Plus, Play, Square,
    AlertTriangle, CheckCircle, Clock, FileText,
    ExternalLink, ChevronRight, Filter, Download,
    Loader2, Trash2, Cpu, Zap, Binary, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ScanJob, ScanFinding, Severity } from '@/types/scans';

const severityColors: Record<Severity, string> = {
    critical: 'text-danger border-danger/20 bg-danger/10',
    high: 'text-warning border-warning/20 bg-warning/10',
    medium: 'text-p-400 border-p-400/20 bg-p-400/10',
    low: 'text-success border-success/20 bg-success/10',
    info: 'text-text-3 border-border-1 bg-bg-2/50',
};

const statusColors: Record<string, string> = {
    pending: 'text-text-3 bg-bg-2/50 border-border-1',
    running: 'text-neon-1 bg-neon-1/10 border-neon-1/20 animate-pulse',
    completed: 'text-success bg-success/10 border-success/20',
    failed: 'text-danger bg-danger/10 border-danger/20',
    stopped: 'text-warning bg-warning/10 border-warning/20',
};

import { apiClient, ApiError } from '@/lib/api-client';

export default function ScansPage() {
    const [scans, setScans] = useState<ScanJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
    const [selectedScanId, setSelectedScanId] = useState<number | null>(null);

    // Form State
    const [newScanTarget, setNewScanTarget] = useState('');
    const [newScanTool, setNewScanTool] = useState<'zap' | 'nuclei'>('nuclei');
    const [error, setError] = useState<string | null>(null);

    const fetchScans = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        try {
            const data = await apiClient('/api/scans/');
            setScans(data);
        } catch (err) {
            console.error("Failed to fetch scans", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchScans();
        const interval = setInterval(() => fetchScans(true), 10000);
        return () => clearInterval(interval);
    }, [fetchScans]);

    const handleCreateScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await apiClient('/api/scans/', {
                json: {
                    target: newScanTarget,
                    tool: newScanTool,
                    config: {}
                }
            });
            setIsNewScanModalOpen(false);
            setNewScanTarget('');
            fetchScans();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.data.detail || "Failed to start scan");
            } else {
                setError("Network error occurred");
            }
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white/[0.01] p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl">
                <div>
                    <div className="section-label">Automated Vulnerability Research</div>
                    <h1 className="display-title mb-4">
                        Web Security <span className="text-neon-1">Scanner.</span>
                    </h1>
                    <p className="text-text-2 text-sm max-w-xl leading-relaxed">
                        AppSec Orchestration for dynamic asset discovery and exploitation mapping.
                        Integrated with Nuclei v3 and OWASP ZAP for full spectral coverage.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsNewScanModalOpen(true)}
                        className="btn-cyber flex items-center gap-4"
                    >
                        <Plus className="h-5 w-5" /> Initialize New Operation
                    </button>
                    <button
                        onClick={() => fetchScans(true)}
                        className={cn(
                            "h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all group",
                            isRefreshing && "animate-spin"
                        )}
                    >
                        <RefreshCw className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Scans List Container */}
            <div className="premium-card !p-0 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-[12px] font-black text-white tracking-[0.2em] uppercase">Scanned Operational Registry</h2>
                            <p className="text-[9px] text-emerald-400 font-black uppercase mt-1.5 tracking-widest flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Monitoring {scans.length} Network Assets
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Job ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Vector</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Engine Subsystem</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Operational Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Spectral Findings</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Activity Period</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Decrypting Job Registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : scans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-8 opacity-10">
                                            <Search className="h-20 w-20 text-white" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white">No Historical Operations Recorded</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                scans.map((scan, idx) => (
                                    <tr
                                        key={scan.id}
                                        className="group hover:bg-white/[0.03] transition-all cursor-pointer"
                                        onClick={() => setSelectedScanId(scan.id)}
                                    >
                                        <td className="px-10 py-8 text-[11px] font-mono text-slate-500">#{scan.id.toString().padStart(4, '0')}</td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors italic">{scan.target}</span>
                                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1.5">
                                                    ACQUIRED: {new Date(scan.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border",
                                                scan.tool === 'zap' ? "bg-p-400/10 text-p-400 border-p-400/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                            )}>
                                                {scan.tool} ENGINE
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border inline-flex items-center gap-2",
                                                statusColors[scan.status]
                                            )}>
                                                <div className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                                                {scan.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className={cn(
                                                "text-sm font-black italic",
                                                (scan.findings_count || 0) > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"
                                            )}>
                                                {(scan.findings_count || 0).toString().padStart(2, '0')}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                            {scan.finished_at ? (
                                                <span className="opacity-60">{Math.round((new Date(scan.finished_at).getTime() - new Date(scan.created_at).getTime()) / 1000)}s Latency</span>
                                            ) : 'ACTIVE_OPER'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Scan Modal */}
            <AnimatePresence>
                {isNewScanModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                            onClick={() => setIsNewScanModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="relative w-full max-w-2xl bg-[#08080c] border border-white/10 rounded-[40px] p-12 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 opacity-[0.03] pointer-events-none">
                                <Zap className="h-80 w-80 text-cyan-400" />
                            </div>

                            <div className="flex items-center gap-6 mb-12">
                                <div className="h-16 w-16 rounded-[24px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                    <Play className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-[20px] font-black text-white uppercase tracking-tight italic">Initialize Discovery Sequence</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5">Strategic Infrastructure Evaluation Cluster</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateScan} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Primary Target Vector (FQDN/IP)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-6 flex items-center text-slate-700 group-focus-within:text-cyan-400 transition-colors">
                                            < Globe className="h-6 w-6" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="https://node-internal.bouclier.ma"
                                            value={newScanTarget}
                                            onChange={(e) => setNewScanTarget(e.target.value)}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-[28px] pl-16 pr-8 py-5 text-[12px] font-black text-white placeholder:text-slate-900 focus:outline-none focus:border-cyan-500/30 transition-all uppercase tracking-widest font-mono"
                                        />
                                    </div>
                                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em] ml-6 italic">Security Disclaimer: Active reconnaissance initiated only on authorized targets.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Offensive Subsystem Selection</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { id: 'nuclei', name: 'NUCLEI SPECTRAL', desc: 'Template-based spectral scanning' },
                                            { id: 'zap', name: 'ZAP DYNAMIC', desc: 'Active payload discovery engine' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setNewScanTool(t.id as any)}
                                                className={cn(
                                                    "p-8 rounded-[32px] border text-left transition-all relative overflow-hidden group",
                                                    newScanTool === t.id
                                                        ? "bg-cyan-500/5 border-cyan-500/30 shadow-[0_10px_40px_rgba(6,182,212,0.1)]"
                                                        : "bg-black/40 border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className={cn("text-[11px] font-black uppercase tracking-widest mb-2 italic", newScanTool === t.id ? "text-cyan-400" : "text-white")}>{t.name}</div>
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.desc}</div>
                                                {newScanTool === t.id && (
                                                    <motion.div layoutId="choice" className="absolute top-0 right-0 p-4">
                                                        <CheckCircle className="h-5 w-5 text-cyan-400" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4">
                                        <AlertTriangle className="h-5 w-5 animate-pulse" />
                                        OP_ERROR: {error}
                                    </motion.div>
                                )}

                                <div className="flex gap-6 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewScanModalOpen(false)}
                                        className="flex-1 h-16 rounded-[28px] bg-white/[0.03] border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        Abort Discovery
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[1.5] btn-cyber h-16 text-[12px] font-black"
                                    >
                                        Engage Target Engine
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Drawer - Restored logic below */}
            <AnimatePresence>
                {selectedScanId && (
                    <ScanDrawer
                        id={selectedScanId}
                        onClose={() => setSelectedScanId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}


function ScanDrawer({ id, onClose }: { id: number; onClose: () => void }) {
    const [detail, setDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'findings' | 'logs'>('findings');

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient(`/api/scans/${id}`);
                const fData = await apiClient(`/api/scans/${id}/findings`);
                setDetail({ ...data, findings: fData });
            } catch (err) { 
                console.error("Failed to fetch scan detail", err);
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchDetail();
    }, [id]);

    const statusColors: Record<string, string> = {
        pending: 'text-text-3 bg-bg-2/50 border-border-1',
        running: 'text-neon-1 bg-neon-1/10 border-neon-1/20 animate-pulse',
        completed: 'text-success bg-success/10 border-success/20',
        failed: 'text-danger bg-danger/10 border-danger/20',
        stopped: 'text-warning bg-warning/10 border-warning/20',
    };

    const severityColors: Record<string, string> = {
        critical: 'text-danger border-danger/20 bg-danger/10',
        high: 'text-warning border-warning/20 bg-warning/10',
        medium: 'text-p-400 border-p-400/20 bg-p-400/10',
        low: 'text-success border-success/20 bg-success/10',
        info: 'text-text-3 border-border-1 bg-bg-2/50',
    };

    return (
        <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-bg-0/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-4xl bg-bg-1 border-l border-border-1 h-full shadow-2xl flex flex-col"
            >
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-neon-1 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-3">Decrypting Payload...</span>
                    </div>
                ) : detail && (
                    <>
                        <div className="p-8 border-b border-border-1 bg-bg-2/30">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-black text-text-1 uppercase tracking-tight">Operation #{detail.id}</h2>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border inline-flex items-center gap-1.5",
                                            statusColors[detail.status]
                                        )}>
                                            {detail.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-3 text-[10px] font-bold uppercase tracking-widest">
                                        < Globe className="h-4 w-4" /> {detail.target}
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-bg-3 rounded-xl transition-colors text-text-3 hover:text-text-1">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex gap-1 p-1 rounded-xl bg-bg-2/50 border border-border-1 w-fit">
                                {[
                                    { id: 'findings', icon: AlertTriangle, label: 'Findings' },
                                    { id: 'logs', icon: FileText, label: 'Activity Logs' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id as any)}
                                        className={cn(
                                            "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            activeTab === t.id ? "bg-bg-3 text-text-1 border border-border-1" : "text-text-3 hover:text-text-2"
                                        )}
                                    >
                                        <t.icon className="h-3.5 w-3.5" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {activeTab === 'findings' ? (
                                <div className="space-y-4">
                                    {detail.findings?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-40 opacity-20">
                                            <CheckCircle className="h-16 w-16 text-success mb-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">No Vulnerabilities Identified</span>
                                        </div>
                                    ) : (
                                        detail.findings?.map((f: any) => (
                                            <div key={f.id} className="p-6 rounded-2xl border border-border-1 bg-bg-2/30 hover:bg-bg-2/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block",
                                                            severityColors[f.severity as string] || severityColors.info
                                                        )}>
                                                            {f.severity}::{f.confidence || 'certain'}
                                                        </span>
                                                        <h4 className="text-sm font-black text-text-1 uppercase tracking-tight group-hover:text-neon-1 transition-colors">{f.title}</h4>
                                                    </div>
                                                    <div className="text-[10px] text-text-3 font-mono">CWE-{f.cwe || 'N/A'}</div>
                                                </div>
                                                <p className="text-[10px] text-text-2 leading-relaxed line-clamp-2 mb-4 italic">"{f.description}"</p>
                                                <div className="flex items-center gap-4 pt-4 border-t border-border-1/30">
                                                    <div className="text-[9px] font-bold text-text-3 uppercase flex items-center gap-1.5 truncate">
                                                        <ExternalLink className="h-3 w-3" /> {f.url}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="bg-black/40 rounded-2xl border border-border-1 p-6 font-mono text-[10px] min-h-full">
                                    <div className="flex flex-col gap-1 text-text-3">
                                        <div className="flex gap-4">
                                            <span className="text-neon-1 w-20 shrink-0">[SYSTEM]</span>
                                            <span>Initializing Operation Subroutine...</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-neon-1 w-20 shrink-0">[SYSTEM]</span>
                                            <span>Mapping Target Infrastructure: {detail.target}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-p-400 w-20 shrink-0">[{detail.tool.toUpperCase()}]</span>
                                            <span>Loading Vulnerability Signatures...</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-success w-20 shrink-0">[STATUS]</span>
                                            <span>Scanning for active vectors...</span>
                                        </div>
                                        {detail.status === 'completed' && (
                                            <div className="flex gap-4 mt-4">
                                                <span className="text-success w-20 shrink-0">[DONE]</span>
                                                <span className="font-bold">Scan sequence terminated successfully.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-border-1 bg-bg-2/30 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button className="h-10 px-6 rounded-xl bg-bg-2 border border-border-1 text-text-3 text-[9px] font-black uppercase tracking-widest hover:text-text-1 transition-all flex items-center gap-2">
                                    <Download className="h-3.5 w-3.5" /> Export Report
                                </button>
                            </div>
                            <button onClick={onClose} className="h-10 px-8 rounded-xl bg-text-1 text-bg-0 text-[10px] font-black uppercase tracking-widest transition-all">
                                Close Terminal
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

