"use client";

import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';
import {
    Upload,
    AlertTriangle,
    CheckCircle,
    FileText,
    Ban,
    ShieldAlert,
    RefreshCw,
    Zap,
    Clock,
    Terminal,
    Database,
    Search,
    History,
    FileSpreadsheet,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setError(null);
            const data = await apiClient('/alerts?limit=200');
            const mapped = (Array.isArray(data) ? data : []).map((alert: any) => {
                const lastEvent = alert?.evidence?.last_event || {};
                const details = alert?.details || {};
                return {
                    timestamp: new Date((alert.timestamp_epoch || Date.now() / 1000) * 1000).toISOString(),
                    source: alert.user || alert.host || lastEvent.src_ip || "unknown",
                    type: alert.rule_id || lastEvent.event_type || "alert",
                    severity: (alert.severity || "medium").toLowerCase(),
                    details: details.summary || details.reason || lastEvent.event_type || "Alert detected",
                };
            });
            setHistoryList(mapped);
        } catch (e) {
            setHistoryList([]);
            setError("Spectral Archive Unreachable.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const data = await apiClient('/api/ddos/analyze', {
                method: "POST",
                body: formData,
            });
            if (data.status === 'success') {
                setResults(data);
            } else {
                setError(`Detection Engine Fault: ${data.message}`);
            }
        } catch (e) {
            setError("Synchronous Link Failure");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700 pb-12">
            {/* Cyber Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 cyber-glow-cyan">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Spectral Threat Processor</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter md:text-7xl leading-none">
                        Advanced <br /><span className="text-cyan-500">Analysis.</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("upload")}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === "upload" ? "bg-white text-black shadow-2xl" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Log Import
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === "history" ? "bg-white text-black shadow-2xl" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Incident Logs
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "upload" ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Upload Panel */}
                            <div className="md:col-span-1 cyber-panel p-8 flex flex-col justify-between group">
                                <div className="scanline" />
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Ingestion Portal</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-8">Supply JSON/CSV telemetry for spectral audit.</p>

                                    <div className="relative group/file">
                                        <input
                                            type="file"
                                            accept=".csv,.json,.log"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer border-2 border-dashed border-white/5 rounded-[2rem] p-10 flex flex-col items-center gap-4 hover:bg-white/5 hover:border-cyan-500/30 transition-all group-hover/file:scale-[0.982]"
                                        >
                                            <div className="h-16 w-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors shadow-2xl">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[11px] font-black text-white uppercase tracking-widest leading-relaxed">
                                                    {file ? file.name : "DEPOSIT DATA STREAM"}
                                                </p>
                                                {!file && <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase">Max Depth: 50MB</p>}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className="w-full mt-8 py-5 rounded-2xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                                >
                                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    {loading ? "PROCESSING..." : "EXECUTE ANALYTICS"}
                                </button>
                            </div>

                            {/* Analysis Console View */}
                            <div className="md:col-span-2 cyber-panel relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Terminal className="h-32 w-32" /></div>
                                <div className="p-8 border-b border-white/5 bg-slate-900/20">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Real-time Spectral Overview</h3>
                                </div>
                                <div className="p-8">
                                    {results ? (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: "Signals Audited", value: results.total_scanned, color: "text-white" },
                                                { label: "Threat Identifiers", value: results.threats.length, color: "text-red-500" },
                                                { label: "Process Latency", value: "0.4s", color: "text-cyan-400" },
                                                { label: "Stability Index", value: "99.2%", color: "text-emerald-400" }
                                            ].map((s, idx) => (
                                                <div key={idx} className="p-6 rounded-2xl bg-slate-950/60 border border-white/5">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{s.label}</span>
                                                    <span className={cn("text-3xl font-black font-mono tracking-tighter", s.color)}>{s.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-[240px] flex flex-col items-center justify-center gap-6 opacity-20 italic">
                                            <div className="h-12 w-12 border border-slate-500 rounded-full flex items-center justify-center animate-pulse"><FileText /></div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Engine Awaiting Input Stream...</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        {results && results.threats.length > 0 && (
                            <div className="cyber-panel p-2">
                                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-slate-900/20">
                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Identified Threat Vectors</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950/40">
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Severity</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Origin Node</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Tactical Details</th>
                                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Containment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.threats.map((threat: any, i: number) => (
                                                <tr key={i} className="group hover:bg-red-500/5 transition-all cursor-pointer">
                                                    <td className="px-8 py-5 text-[11px] font-black text-red-400 uppercase tracking-tight">{threat.type}</td>
                                                    <td className="px-8 py-5">
                                                        <span className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest">{threat.severity}</span>
                                                    </td>
                                                    <td className="px-8 py-5 font-mono text-[11px] text-slate-300 font-bold tabular-nums">{threat.source}</td>
                                                    <td className="px-8 py-5 text-[10px] text-slate-500 font-medium max-w-[400px] italic">"{threat.details}"</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                                            Neutralize IP
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="cyber-panel p-2"
                    >
                        <div className="p-8 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <History className="h-5 w-5 text-cyan-400" />
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Spectral Archive</h3>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1">Persistent incident matrix</p>
                                </div>
                            </div>
                            <button onClick={fetchHistory} className="h-10 w-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/40">
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Utc_Timestamp</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Node_IP</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Signal_ID</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Priority</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Metadata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {historyList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center opacity-20">
                                                <div className="flex flex-col items-center gap-4">
                                                    <Database className="h-10 w-10" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Archive Vacuum Detected</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        historyList.map((h, i) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-all">
                                                <td className="px-8 py-5 text-[10px] text-slate-600 font-mono tracking-tighter">
                                                    {new Date(h.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-cyan-400 font-mono text-[11px] font-bold tabular-nums italic">{h.source}</td>
                                                <td className="px-8 py-5 text-xs font-black text-white uppercase tracking-tight">{h.type}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border",
                                                        h.severity === 'critical' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-slate-500 bg-slate-900 border-white/5'
                                                    )}>
                                                        {h.severity}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-[11px] text-slate-500 font-medium max-w-[300px] truncate italic">"{h.details}"</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
