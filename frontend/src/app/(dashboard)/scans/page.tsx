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

export default function ScansPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
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
            const res = await fetch(`${apiBase}/api/scans/`);
            if (res.ok) {
                const data = await res.json();
                setScans(data);
            }
        } catch (err) {
            console.error("Failed to fetch scans", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [apiBase]);

    useEffect(() => {
        fetchScans();
        const interval = setInterval(() => fetchScans(true), 5000);
        return () => clearInterval(interval);
    }, [fetchScans]);

    const handleCreateScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${apiBase}/api/scans/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: newScanTarget,
                    tool: newScanTool,
                    config: {}
                })
            });
            if (res.ok) {
                setIsNewScanModalOpen(false);
                setNewScanTarget('');
                fetchScans();
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to start scan");
            }
        } catch (err) {
            setError("Network error occurred");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-neon-1/10 border border-neon-1/20 flex items-center justify-center text-neon-1 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            < Globe className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">AppSec Orchestrator</span>
                    </div>
                    <h1 className="text-display mb-1 text-text-1">
                        Web Security <span className="text-neon-1">Scanner</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNewScanModalOpen(true)}
                        className="h-12 px-8 rounded-xl bg-neon-1 text-bg-0 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-neon-1/20 hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> New Operation
                    </button>
                    <button
                        onClick={() => fetchScans(true)}
                        className={`h-12 w-12 rounded-xl bg-bg-2/50 border border-border-1 flex items-center justify-center text-text-3 hover:text-text-1 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Scans List */}
            <div className="glass-card p-0 rounded-2xl overflow-hidden border border-border-1 bg-bg-1/50">
                <div className="p-6 border-b border-border-1 flex items-center justify-between bg-bg-2/30">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-bg-2 border border-border-1 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-text-3" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-text-1 tracking-widest uppercase">Job Registry</h2>
                            <p className="text-[9px] text-text-3 font-bold uppercase mt-1">Total Assets Scanned: {scans.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-bg-2/50 rounded-lg p-0.5 border border-border-1">
                            {['all', 'running', 'completed'].map(f => (
                                <button key={f} className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-text-3 hover:text-text-1">
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-1/80 border-b border-border-1">
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">Target Asset</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest text-center">Engine</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest text-center">Findings</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1/30">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="h-8 w-8 text-neon-1 animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-3 animate-pulse">Accessing Vault...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : scans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Search className="h-12 w-12 text-text-3" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-3">No Operational History</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                scans.map(scan => (
                                    <tr
                                        key={scan.id}
                                        className="group hover:bg-bg-2/40 transition-all cursor-pointer"
                                        onClick={() => setSelectedScanId(scan.id)}
                                    >
                                        <td className="px-8 py-6 text-[10px] font-mono text-text-3">#{scan.id}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-text-1 tracking-tight">{scan.target}</span>
                                                <span className="text-[8px] font-bold text-text-3 uppercase tracking-widest mt-0.5">
                                                    Initiated: {new Date(scan.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded text-[8px] font-black tracking-widest uppercase border",
                                                scan.tool === 'zap' ? "bg-p-400/10 text-p-400 border-p-400/20" : "bg-neon-1/10 text-neon-1 border-neon-1/20"
                                            )}>
                                                {scan.tool}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border inline-flex items-center gap-1.5",
                                                statusColors[scan.status]
                                            )}>
                                                <div className="h-1 w-1 rounded-full bg-current" />
                                                {scan.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={cn(
                                                "text-xs font-black",
                                                (scan.findings_count || 0) > 0 ? "text-warning" : "text-success"
                                            )}>
                                                {scan.findings_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-[9px] text-text-3">
                                            {scan.finished_at ? (
                                                <span className="opacity-60">{Math.round((new Date(scan.finished_at).getTime() - new Date(scan.created_at).getTime()) / 1000)}s</span>
                                            ) : '-'}
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-bg-0/90 backdrop-blur-xl"
                            onClick={() => setIsNewScanModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-bg-1 border border-border-1 rounded-3xl p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <Zap className="h-32 w-32 text-neon-1" />
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-neon-1/10 border border-neon-1/20 flex items-center justify-center text-neon-1">
                                    <Play className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-1 uppercase tracking-tight">Deploy Security Engine</h3>
                                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Strategic Asset Evaluation</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateScan} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Target Infrastructure URL</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-5 flex items-center text-text-3 group-focus-within:text-neon-1 transition-colors">
                                            < Globe className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="https://internal-app.local"
                                            value={newScanTarget}
                                            onChange={(e) => setNewScanTarget(e.target.value)}
                                            required
                                            className="w-full bg-bg-2 border border-border-1 rounded-2xl pl-16 pr-6 py-5 text-xs font-black text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-neon-1/30 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                    <p className="text-[8px] text-text-3 font-bold uppercase tracking-widest">Legal Notice: Authorized for Public Scanning. Ensure Proper Authorization before engaging targets.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Scanner Subsystem</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'nuclei', name: 'Nuclei v3', desc: 'Template-based scanning' },
                                            { id: 'zap', name: 'OWASP ZAP', desc: 'Dynamic App Discovery' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setNewScanTool(t.id as any)}
                                                className={cn(
                                                    "p-6 rounded-2xl border text-left transition-all",
                                                    newScanTool === t.id
                                                        ? "bg-neon-1/5 border-neon-1/40 shadow-lg shadow-neon-1/5"
                                                        : "bg-bg-1 border-border-1 hover:border-text-3"
                                                )}
                                            >
                                                <div className={cn("text-[10px] font-black uppercase tracking-widest mb-1", newScanTool === t.id ? "text-neon-1" : "text-text-1")}>{t.name}</div>
                                                <div className="text-[8px] font-bold text-text-3 uppercase">{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                        <AlertTriangle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewScanModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl bg-bg-2 border border-border-1 text-text-3 font-black text-[10px] uppercase tracking-widest hover:text-text-1 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-2 h-14 px-12 rounded-2xl bg-neon-1 text-bg-0 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-neon-1/20"
                                    >
                                        Initialize Engine
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Drawer */}
            <AnimatePresence>
                {selectedScanId && (
                    <ScanDrawer
                        id={selectedScanId}
                        apiBase={apiBase}
                        onClose={() => setSelectedScanId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ScanDrawer({ id, apiBase, onClose }: { id: number; apiBase: string; onClose: () => void }) {
    const [detail, setDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'findings' | 'logs'>('findings');

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${apiBase}/api/scans/${id}`);
                const data = await res.json();
                setDetail(data);

                // Fetch findings
                const fRes = await fetch(`${apiBase}/api/scans/${id}/findings`);
                const fData = await fRes.json();
                setDetail((prev: any) => ({ ...prev, findings: fData }));
            } catch (err) { }
            finally { setIsLoading(false); }
        };
        fetchDetail();
    }, [id, apiBase]);

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

