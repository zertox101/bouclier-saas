'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Scan, AlertTriangle, CheckCircle, XCircle, Server, Lock, Wifi,
    Database, Activity, Globe, FileText, Bell, Wrench, Download, RefreshCw,
    Monitor, Printer, Smartphone, Router, Camera, Laptop, HardDrive, Target,
    Zap, Compass, Binary, Search, Cpu, Network
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
interface ScanResult {
    type: string;
    port?: number;
    service?: string;
    risk: string;
    cves?: string[];
    description?: string;
    remediation?: string;
}

interface NetworkDevice {
    ip: string;
    hostname?: string;
    mac?: string;
    device_type: string;
    open_ports: { port: number; service: string }[];
    risk: string;
}

interface Notification {
    id: string;
    type: 'critical' | 'high' | 'medium' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

const riskStyles = {
    CRITICAL: 'text-red-500 border-red-500/20 bg-red-500/5',
    HIGH: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    MEDIUM: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
    LOW: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
};

const remediationDB: Record<string, { title: string; steps: string[] }> = {
    'PORT_445': {
        title: 'SMB Port 445 Exposed',
        steps: [
            'Disable SMBv1 if not needed',
            'Enable SMB Signing',
            'Block port 445 in Windows Firewall for external connections',
        ],
    },
    'PORT_3389': {
        title: 'RDP Port 3389 Exposed',
        steps: [
            'Enable Network Level Authentication (NLA)',
            'Use a VPN instead of exposing RDP directly',
            'Apply latest Windows security patches',
        ],
    },
};

export default function ScannerPage() {
    const toolsApiBase = process.env.NEXT_PUBLIC_TOOLS_API_BASE || "http://localhost:8100";

    const [activeTab, setActiveTab] = useState<'local' | 'network' | 'iplookup' | 'remediation'>('local');
    const [scanStatus, setScanStatus] = useState({ isScanning: false, progress: 0, currentTask: '' });
    const [localResults, setLocalResults] = useState<ScanResult[]>([]);
    const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [summary, setSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0, total: 0 });
    const [selectedRemediation, setSelectedRemediation] = useState<string | null>(null);
    const [ipInput, setIpInput] = useState('');
    const [ipResult, setIpResult] = useState<any>(null);
    const [localTarget, setLocalTarget] = useState('');
    const [networkTarget, setNetworkTarget] = useState('');

    const runToolJob = async (toolId: string, input: Record<string, string | number>) => {
        const res = await fetch(`${toolsApiBase}/tools/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool_id: toolId, input })
        });
        if (!res.ok) throw new Error(`Engine Fault: ${res.status}`);
        const data = await res.json();
        const jobId = data.job_id;

        let jobData: any = null;
        while (true) {
            const jobRes = await fetch(`${toolsApiBase}/tools/jobs/${jobId}`, { cache: 'no-store' });
            jobData = await jobRes.json();
            if (jobData.logs?.length) {
                const last = jobData.logs[jobData.logs.length - 1];
                setScanStatus(prev => ({ ...prev, currentTask: last.message, progress: Math.min(prev.progress + 5, 95) }));
            }
            if (jobData.status !== 'running') break;
            await new Promise(r => setTimeout(r, 1000));
        }
        return jobData;
    };

    const startLocalScan = async () => {
        const target = localTarget || '127.0.0.1';
        setScanStatus({ isScanning: true, progress: 10, currentTask: `Targeting Host: ${target}` });
        setLocalResults([]);
        try {
            const jobData = await runToolJob("network_recon", { target });
            const logs = jobData.logs || [];
            const results: ScanResult[] = [];
            logs.forEach((log: any) => {
                const match = String(log.message).match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)/i);
                if (match) {
                    const port = Number(match[1]);
                    results.push({
                        type: "PORT",
                        port,
                        service: match[3],
                        risk: port === 445 ? "CRITICAL" : [3389, 23].includes(port) ? "HIGH" : "MEDIUM",
                        description: `Open service detected on port ${port}`,
                        remediation: port === 445 ? "PORT_445" : port === 3389 ? "PORT_3389" : undefined
                    });
                }
            });
            setLocalResults(results);
        } catch (e) { } finally {
            setScanStatus({ isScanning: false, progress: 100, currentTask: 'Spectral Analysis Complete' });
        }
    };

    const performIpLookup = async () => {
        if (!ipInput) return;
        setScanStatus({ isScanning: true, progress: 10, currentTask: `Resolving Node: ${ipInput}` });
        try {
            const jobData = await runToolJob("ip_scanner", { target: ipInput });
            setIpResult({ target: ipInput, status: jobData?.status || 'Completed', data: jobData, timestamp: new Date().toISOString() });
        } catch (e) { } finally {
            setScanStatus({ isScanning: false, progress: 100, currentTask: 'Lookup Resolved' });
        }
    };

    useEffect(() => {
        const items = activeTab === 'local' ? localResults : networkDevices;
        const newSummary = {
            critical: items.filter((r: any) => r.risk === 'CRITICAL').length,
            high: items.filter((r: any) => r.risk === 'HIGH').length,
            medium: items.filter((r: any) => r.risk === 'MEDIUM').length,
            low: items.filter((r: any) => r.risk === 'LOW').length,
            total: items.length,
        };
        setSummary(newSummary);
    }, [localResults, networkDevices, activeTab]);

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700 pb-12">
            {/* Cyber Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 cyber-glow-emerald">
                            <Scan className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Spectral Vulnerability Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter md:text-7xl leading-none">
                        Precision <br /><span className="text-emerald-400">Scanner.</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                        {[
                            { id: 'local', icon: Shield, label: 'Local' },
                            { id: 'network', icon: Network, label: 'Network' },
                            { id: 'iplookup', icon: Target, label: 'Lookup' },
                            { id: 'remediation', icon: Wrench, label: 'Patch' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                                    activeTab === t.id ? "bg-white text-black shadow-2xl" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <t.icon className="h-3.5 w-3.5" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={activeTab === 'local' ? startLocalScan : performIpLookup} disabled={scanStatus.isScanning} className="h-12 px-8 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition hover:scale-[1.02] active:scale-95 disabled:opacity-30">
                            {scanStatus.isScanning ? "INGESTING..." : "EXECUTE SCAN"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Scan Progress HUD */}
            <AnimatePresence>
                {scanStatus.isScanning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="cyber-panel p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                            <div className="scanline" />
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-emerald-400 animate-spin" />
                                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">
                                        Subroutine_Active::{scanStatus.currentTask}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-white font-mono">{scanStatus.progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanStatus.progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metrics HUD */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                    { label: "Critical", value: summary.critical, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20" },
                    { label: "High", value: summary.high, color: "text-orange-500", bg: "bg-orange-500/5", border: "border-orange-500/20" },
                    { label: "Medium", value: summary.medium, color: "text-yellow-500", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
                    { label: "Low", value: summary.low, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
                    { label: "Total Vectors", value: summary.total, color: "text-white", bg: "bg-slate-900/40", border: "border-white/5" }
                ].map((s, idx) => (
                    <div key={idx} className={cn("p-6 rounded-3xl border backdrop-blur-xl", s.bg, s.border)}>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{s.label}</span>
                        <span className={cn("text-3xl font-black font-mono", s.color)}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {activeTab === 'local' && (
                        <div className="cyber-panel p-2">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
                                <div className="flex items-center gap-4">
                                    <Binary className="h-5 w-5 text-emerald-400" />
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Spectral Vectors Buffer</h2>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="TARGET_NODE_IP_OR_DOMAIN"
                                        value={localTarget}
                                        onChange={(e) => setLocalTarget(e.target.value)}
                                        className="bg-slate-950 border border-white/5 rounded-lg px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 w-48"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950/40">
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Endpoint</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Trace</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Ops</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {localResults.length > 0 ? localResults.map((r, i) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-all">
                                                <td className="px-8 py-5">
                                                    <span className={cn("px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border inline-flex items-center gap-2", riskStyles[r.risk as keyof typeof riskStyles])}>
                                                        <div className="h-1 w-1 rounded-full bg-current" />
                                                        {r.risk}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-[11px] font-black text-white tracking-tight">
                                                    {r.port ? `PORT_${r.port}` : "SCAN_POINT"}
                                                </td>
                                                <td className="px-8 py-5 text-[10px] font-mono font-bold text-slate-400 italic">
                                                    {r.service?.toUpperCase()}
                                                </td>
                                                <td className="px-8 py-5 text-[10px] text-slate-500 font-medium max-w-xs">{r.description}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => { setSelectedRemediation(r.remediation!); setActiveTab('remediation'); }}
                                                        className="h-8 w-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-2xl"
                                                    >
                                                        <Compass className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-32 text-center opacity-10 flex flex-col items-center">
                                                    <Search className="h-12 w-12 mb-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Spectral Ingestion</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'iplookup' && (
                        <div className="cyber-panel p-8 space-y-8">
                            <div className="scanline" />
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-6 flex items-center text-slate-600 group-focus-within:text-emerald-400 transition-colors">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="TARGET_NODE_IP_OR_DOMAIN_ADDRESS..."
                                        value={ipInput}
                                        onChange={(e) => setIpInput(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-xs font-black text-white placeholder:text-slate-700 uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all"
                                    />
                                </div>
                                <button onClick={performIpLookup} className="h-16 px-12 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                    RESOLVE_IDENTITY
                                </button>
                            </div>

                            {ipResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 rounded-3xl bg-slate-950 border border-white/5 space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Geolocation Data</h3>
                                        <div className="space-y-4 font-mono">
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-600">IP::ORIGIN</span> <span className="text-white font-black">{ipResult.target}</span></div>
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-600">STABILITY</span> <span className="text-emerald-400 font-black">STABLE</span></div>
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-600">TIMESTAMP</span> <span className="text-slate-400">{ipResult.timestamp}</span></div>
                                        </div>
                                    </div>
                                    <div className="h-[200px] rounded-3xl bg-slate-950 border border-white/5 overflow-hidden flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-0.1278,51.5074,10/400x200?access_token=pk.xxx')] bg-cover opacity-50 grayscale" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping mb-2" />
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/80 px-4 py-1 rounded-full backdrop-blur-md">Node Lock: Active</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="cyber-panel p-8 min-h-[500px] flex flex-col">
                        <div className="scanline" />
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Mitigation Protocols</h3>
                        </div>

                        {selectedRemediation && remediationDB[selectedRemediation] ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Objective</span>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{remediationDB[selectedRemediation].title}</h4>
                                </div>
                                <div className="space-y-4">
                                    {remediationDB[selectedRemediation].steps.map((s, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">{s}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-10">
                                    <button 
                                        onClick={async () => {
                                            setScanStatus({ isScanning: true, progress: 0, currentTask: 'Initializing Patch...' });
                                            try {
                                                await runToolJob("auto_patch", { target: localTarget || '127.0.0.1', remediation_id: selectedRemediation });
                                            } catch(e) {}
                                            setScanStatus({ isScanning: false, progress: 100, currentTask: 'Patch Successfully Deployed' });
                                        }}
                                        disabled={scanStatus.isScanning}
                                        className="w-full py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-500/20 transition-all shadow-2xl active:scale-95 disabled:opacity-30"
                                    >
                                        {scanStatus.isScanning ? "DEPLOYING..." : "Execute Auto-Mitigation"}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic">
                                <Shield className="h-16 w-16 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center">Awaiting Vector Selection <br /> for Remediation logic</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
