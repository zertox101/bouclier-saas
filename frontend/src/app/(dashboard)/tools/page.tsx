'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Terminal as TerminalIcon,
    Play,
    Square,
    Download,
    RefreshCw,
    Shield,
    Globe,
    Key,
    Search,
    Wifi,
    Lock,
    AlertTriangle,
    CheckCircle,
    Loader2,
    FileText,
    Activity,
    TrendingUp,
    TrendingDown,
    Brain,
    Zap,
    Database,
    Cpu,
    Dna,
    Settings,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LogEntry, Tool } from '@/types/tools';
import { useLocalStorage } from "@/hooks/useLocalStorage";

const riskColors = {
    low: 'text-success border-success/20 bg-success/10',
    medium: 'text-warning border-warning/20 bg-warning/10',
    high: 'text-danger border-danger/20 bg-danger/10',
    critical: 'text-danger bg-danger/20 border-danger shadow-[0_0_15px_rgba(239,68,68,0.3)]',
};

const statusColors: Record<string, string> = {
    ready: 'text-success border-success/20 bg-success/10',
    blocked: 'text-danger border-danger/20 bg-danger/10',
    missing: 'text-text-3 border-border-1 bg-bg-2/50',
};

const categoryIcons: Record<string, React.ReactNode> = {
    Local: <Shield className="w-4 h-4" />,
    Network: <Wifi className="w-4 h-4" />,
    OSINT: <Globe className="w-4 h-4" />,
    Mobile: <Shield className="w-4 h-4" />,
    SOC: <Search className="w-4 h-4" />,
    Reports: <FileText className="w-4 h-4" />,
    Advanced: <Lock className="w-4 h-4" />,
    Web: <Globe className="w-4 h-4" />,
    Audit: <Key className="w-4 h-4" />,
    Exploit: <AlertTriangle className="w-4 h-4" />,
    'Adversary Emulation': <Zap className="w-4 h-4" />,
    'Pentester Emulation': <TerminalIcon className="w-4 h-4" />,
    'Red Team': <Zap className="w-4 h-4 text-danger" />,
    Forensics: <Database className="w-4 h-4" />,
    Flipper: <Cpu className="w-4 h-4" />,
};

interface TrafficStats {
    inbound: { total: number; rate: number; packets: number; };
    outbound: { total: number; rate: number; packets: number; };
}

interface LLMAnalysis {
    summary: string;
    threats: string[];
    recommendations: string[];
    riskScore: number;
}


export default function ToolsPage() {
    const apiBase = process.env.NEXT_PUBLIC_TOOLS_API_BASE || 'http://localhost:8100';
    const securityApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    const [platformMode] = useLocalStorage<"simulator" | "emulation">("platform-mode", "emulation");

    const [tools, setTools] = useState<Tool[]>([]);
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [trafficStats, setTrafficStats] = useState<TrafficStats>({
        inbound: { total: 0, rate: 0, packets: 0 },
        outbound: { total: 0, rate: 0, packets: 0 }
    });
    const [llmAnalysis, setLLMAnalysis] = useState<LLMAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const selectedTool = useMemo(
        () => tools.find(tool => tool.id === selectedToolId) || null,
        [tools, selectedToolId]
    );

    const categories = useMemo(
        () => ['all', ...Array.from(new Set(tools.map(t => t.category)))],
        [tools]
    );

    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = useMemo(() => {
        let result = tools;
        if (activeCategory !== 'all') {
            result = result.filter(t => t.category === activeCategory);
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags?.some(tag => tag.toLowerCase().includes(q))
            );
        }
        return result;
    }, [tools, activeCategory, searchQuery]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const loadTools = async (initialId?: string | null) => {
        try {
            setApiError(null);
            const res = await fetch(`${apiBase}/tools`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Tools API fault: ${res.status}`);
            const data = await res.json();
            const toolList = data.tools || [];
            setTools(toolList);

            // Priority: Query Param > First Tool
            if (initialId && toolList.some((t: Tool) => t.id === initialId)) {
                setSelectedToolId(initialId);
            } else if (!selectedToolId && toolList.length) {
                setSelectedToolId(toolList[0].id);
            }
        } catch (err: any) {
            setApiError(err?.message || 'Access Denied: Tools API unreachable');
            setTools([]);
        }
    };

    const fetchTrafficStats = async () => {
        try {
            const res = await fetch(`${securityApiBase}/api/traffic/stats`);
            if (res.ok) {
                const data = await res.json();
                setTrafficStats({
                    inbound: { total: data.inbound_bytes ?? 0, rate: data.inbound_rate ?? 0, packets: data.inbound_packets ?? 0 },
                    outbound: { total: data.outbound_bytes ?? 0, rate: data.outbound_rate ?? 0, packets: data.outbound_packets ?? 0 },
                });
            }
        } catch (err) { }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const queryToolId = queryParams.get('tool_id');

        loadTools(queryToolId);
        fetchTrafficStats();
        const trafficInterval = setInterval(fetchTrafficStats, 5000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            clearInterval(trafficInterval);
        };
    }, []);

    const runTool = async (tool: Tool) => {
        if (isRunning) {
            await stopTool();
            return;
        }

        setApiError(null);
        setSelectedToolId(tool.id);
        setLogs([]);
        setLLMAnalysis(null);

        const missingFields: string[] = [];
        const inputPayload: Record<string, string | number> = {};

        (tool.inputs || []).forEach(input => {
            const raw = toolInputs[input.key] || '';
            if (raw === '' && input.required) {
                missingFields.push(input.label);
            }
            if (raw !== '') {
                inputPayload[input.key] = input.type === 'number' ? Number(raw) : raw;
            }
        });

        if (missingFields.length > 0) {
            setApiError(`Required fields missing: ${missingFields.join(', ')}`);
            return;
        }

        try {
            const res = await fetch(`${apiBase}/tools/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool_id: tool.id, input: inputPayload }),
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                throw new Error(detail?.detail || `Execution Failure (${res.status})`);
            }
            const data = await res.json();
            setJobId(data.job_id);
            setIsRunning(true);

            // Poll Logic
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${apiBase}/tools/jobs/${data.job_id}`, { cache: 'no-store' });
                    const statusData = await statusRes.json();
                    setLogs(statusData.logs || []);
                    if (statusData.status !== 'running') {
                        setIsRunning(false);
                        if (pollRef.current) clearInterval(pollRef.current);
                        // Trigger AI Analysis automatically when done
                        analyzeLogs(statusData.logs || []);
                    }
                } catch (e) { }
            }, 1000);
        } catch (err: any) {
            setApiError(err?.message || 'Spectral Scan aborted');
        }
    };

    const stopTool = async () => {
        if (!jobId) { setIsRunning(false); return; }
        try {
            await fetch(`${apiBase}/tools/jobs/${jobId}/stop`, { method: 'POST' });
            setIsRunning(false);
        } catch (err) { }
    };

    const analyzeLogs = async (logsToAnalyze?: LogEntry[]) => {
        const targetLogs = logsToAnalyze || logs;
        if (targetLogs.length === 0 || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const logText = targetLogs.filter(l => l?.message).map(l => l.message).join('\n');
            const res = await fetch(`${securityApiBase}/api/sentinel/analyze-tools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool_name: selectedTool?.name, logs: logText })
            });
            if (res.ok) {
                const data = await res.json();
                setLLMAnalysis(data);
            }
        } catch (err) { } finally {
            setIsAnalyzing(false);
        }
    };

    const exportLogs = () => {
        if (logs.length === 0) return;
        const logContent = logs.map(l => `[${new Date(l.timestamp * 1000).toISOString()}] ${l.level.toUpperCase()}: ${l.message}`).join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shield_logs_${selectedTool?.id || 'export'}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const logContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12 zellige-pattern">
            {/* Cyber Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400 shadow-[0_0_15px_rgba(167,139,250,0.2)]">
                            <Settings className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Security Armamentarium</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-display mb-1 text-text-1">
                            Tactical <span className="text-p-400">Toolkit</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", platformMode === "emulation" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]")} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", platformMode === "emulation" ? "text-red-400" : "text-amber-400")}>
                                Mode: {platformMode === "emulation" ? "Active Advisory Emulation (C2)" : "Synthetic Simulation (Offline)"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-4 bg-bg-2/50 backdrop-blur-md border border-border-2 rounded-xl px-6 py-4 w-full lg:w-auto justify-between">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Inbound Delta</span>
                            <span className="text-xs font-black text-neon-1 font-mono tracking-tighter">{trafficStats.inbound.rate} KB/s</span>
                        </div>
                        <div className="h-8 w-px bg-border-1" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Outbound Delta</span>
                            <span className="text-xs font-black text-p-400 font-mono tracking-tighter">{trafficStats.outbound.rate} KB/s</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tools Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-text-3 group-focus-within:text-p-400 transition-colors">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tools or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-2/50 backdrop-blur-md border border-border-1 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-p-500/50 transition-all shadow-xl"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                    activeCategory === cat
                                        ? "bg-text-1 text-bg-0 border-text-1 shadow-lg"
                                        : "bg-bg-1/50 text-text-3 border-border-1 hover:border-text-3 hover:text-text-1"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {filteredTools.length > 0 ? filteredTools.map((tool) => (
                                <motion.div
                                    key={tool.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedToolId(tool.id)}
                                    className={cn(
                                        "p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                                        selectedToolId === tool.id
                                            ? "bg-bg-3/80 border-p-500/40 shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                                            : "bg-bg-2/40 border-border-1 hover:bg-bg-2/80 hover:border-border-2"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                                        {categoryIcons[tool.category] || <TerminalIcon />}
                                    </div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl bg-bg-1 border flex items-center justify-center transition-colors",
                                            selectedToolId === tool.id ? "border-p-500/30 text-p-400" : "border-border-1 text-text-3"
                                        )}>
                                            {categoryIcons[tool.category] || <TerminalIcon className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-text-1 uppercase tracking-tight">{tool.name}</h3>
                                            <span className="text-[8px] font-bold text-text-3 uppercase tracking-widest">{tool.category}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-text-2 font-medium leading-relaxed mb-4 line-clamp-2 opacity-60">
                                        {tool.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border", riskColors[tool.risk as keyof typeof riskColors])}>
                                                {tool.risk}
                                            </span>
                                            <span className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border", statusColors[tool.status])}>
                                                {tool.status}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-text-3 opacity-20 group-hover:bg-p-400 group-hover:opacity-100 transition-all shadow-[0_0_5px_rgba(167,139,250,0.5)]" />
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-10 opacity-30">
                                    <Search className="h-8 w-8 mx-auto mb-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">No tools matching signal</span>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Tactical Console */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedTool ? (
                        <>
                            <div className="glass-card p-0 rounded-3xl overflow-hidden border border-border-1 relative group bg-bg-1/50 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-p-500/5 via-transparent to-transparent pointer-events-none" />

                                <div className="p-8 border-b border-border-1 bg-bg-2/30 relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedTool.name}</h2>
                                                <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
                                                <span className="text-[10px] font-black text-p-400 uppercase tracking-[0.3em]">Module_v{selectedTool.version || "2.4.0"}</span>
                                            </div>
                                            <p className="text-sm text-text-3 max-w-xl font-bold leading-relaxed opacity-70 tracking-tight">{selectedTool.description}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => runTool(selectedTool)}
                                                className={cn(
                                                    "h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl whitespace-nowrap",
                                                    isRunning
                                                        ? "bg-danger text-white hover:bg-red-600 animate-pulse"
                                                        : "bg-white text-black hover:bg-p-400 hover:text-white"
                                                )}
                                            >
                                                {isRunning ? (
                                                    <><Square className="h-4 w-4 fill-current" /> Terminate_Engine</>
                                                ) : (
                                                    <><Play className="h-4 w-4 fill-current" /> Deploy_Payload</>
                                                )}
                                            </button>
                                            <button onClick={() => loadTools()} className="h-10 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <RefreshCw className="h-3 w-3" /> Sync_Inventory
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                {selectedTool.inputs && selectedTool.inputs.length > 0 && (
                                    <div className="p-8 bg-bg-1/30 relative overflow-hidden">
                                        <div className="absolute inset-0 zellige-pattern opacity-5" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                            {selectedTool.inputs.map(input => (
                                                <div key={input.key} className="space-y-3">
                                                    <label className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                                                        <div className="h-1 w-1 rounded-full bg-p-400" />
                                                        {input.label}
                                                        {input.required && <span className="text-danger">*</span>}
                                                    </label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-5 flex items-center text-text-3 group-focus-within:text-p-400 transition-colors">
                                                            {input.key.includes('url') || input.key.includes('target') ? <Globe className="h-4 w-4" /> : <TerminalIcon className="h-4 w-4" />}
                                                        </div>
                                                        <input
                                                            type={input.type === 'number' ? 'number' : 'text'}
                                                            placeholder={input.placeholder || `EXEC_INPUT_${input.key.toUpperCase()}`}
                                                            value={toolInputs[input.key] || ''}
                                                            onChange={(e) => {
                                                                setToolInputs({ ...toolInputs, [input.key]: e.target.value });
                                                                if (apiError) setApiError(null);
                                                            }}
                                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-white placeholder:text-text-3/20 focus:outline-none focus:border-p-500/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Console Output */}
                                <div className="flex flex-col h-[550px] border-t border-white/5 bg-black/60 relative overflow-hidden">
                                    <div className="scanline" />
                                    <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-info shadow-[0_0_10px_#0EA5E9] animate-pulse" />
                                            <span className="text-[10px] font-black text-text-2 uppercase tracking-[0.4em]">Engine_Secure_V-Shell</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={exportLogs} className="text-text-3 hover:text-p-400 transition-all p-2 hover:bg-white/5 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><Download className="h-3.5 w-3.5" /> Dump_Logs</button>
                                            <button onClick={() => setLogs([])} className="text-text-3 hover:text-white transition-all p-2 hover:bg-white/5 rounded-xl"><RefreshCw className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>
                                    <div
                                        ref={logContainerRef}
                                        className="flex-1 p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar relative z-10"
                                    >
                                        {logs.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-text-3 opacity-10">
                                                <TerminalIcon className="h-16 w-16 mb-6" />
                                                <span className="uppercase tracking-[0.5em] text-[10px] font-black text-center">AWAITING_PAYLOAD_DEPLOYMENT</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 pb-20">
                                                {logs.map((log, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={i}
                                                        className="flex gap-4 group"
                                                    >
                                                        <span className="text-text-3/20 shrink-0 select-none w-10 text-right opacity-0 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(4, '0')}</span>
                                                        <span className={cn(
                                                            "break-all tracking-tight font-medium",
                                                            log.level === 'error' ? 'text-danger' :
                                                                log.level === 'warning' ? 'text-warning' :
                                                                    log.level === 'success' ? 'text-m-emerald font-black shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-text-2'
                                                        )}>
                                                            <span className="opacity-20 mr-3 text-[10px]">[{new Date((log.timestamp || (Date.now() / 1000)) * 1000).toLocaleTimeString([], { hour12: false })}]</span>
                                                            {log.message}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Overlay */}
                            {(isAnalyzing || llmAnalysis) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-8 rounded-2xl border border-neon-1/20 relative overflow-hidden group shadow-[0_0_50px_rgba(34,211,238,0.05)] bg-bg-2/50"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="h-20 w-20 text-neon-1" /></div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-10 w-10 rounded-xl bg-neon-1/10 border border-neon-1/20 flex items-center justify-center text-neon-1 shadow-[0_0_15px_rgba(192,132,252,0.2)]">
                                            <Brain className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-text-1 uppercase tracking-[0.2em]">Neural Intelligence Report</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-neon-1 animate-pulse" />
                                                <span className="text-[9px] font-black text-neon-1 uppercase tracking-widest">Sentinel Insight Live</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <Loader2 className="h-8 w-8 text-neon-1 animate-spin" />
                                            <span className="text-[10px] font-black text-text-2 uppercase tracking-[0.5em] animate-pulse">Decompressing Telemetry...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div>
                                                    <span className="text-[9px] font-black text-text-2 uppercase tracking-widest mb-3 block">Neural Summary</span>
                                                    <p className="text-xs text-text-1 leading-relaxed font-medium italic">"{llmAnalysis?.summary}"</p>
                                                </div>
                                                <div className="p-5 rounded-xl bg-bg-1 border border-border-1 space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-text-3">Risk Assessment</span>
                                                        <span className={cn(
                                                            "px-3 py-1 rounded",
                                                            (llmAnalysis?.riskScore || 0) > 70 ? "text-danger bg-danger/10 border border-danger/20" : "text-success bg-success/10 border border-success/20"
                                                        )}>{llmAnalysis?.riskScore}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-bg-2 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${llmAnalysis?.riskScore}%` }}
                                                            className={cn("h-full", (llmAnalysis?.riskScore || 0) > 70 ? "bg-danger" : "bg-success")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div>
                                                    <span className="text-[9px] font-black text-text-2 uppercase tracking-widest mb-4 block">Identified Vectors</span>
                                                    <div className="space-y-2">
                                                        {llmAnalysis?.threats.map((t, idx) => (
                                                            <div key={idx} className="flex gap-3 text-[10px] items-start">
                                                                <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />
                                                                <span className="text-text-2 font-bold">{t}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-text-2 uppercase tracking-widest mb-4 block">Mitigation Protocols</span>
                                                    <div className="space-y-2">
                                                        {llmAnalysis?.recommendations.map((r, idx) => (
                                                            <div key={idx} className="flex gap-3 text-[10px] items-start">
                                                                <CheckCircle className="h-3.5 w-3.5 text-neon-1 shrink-0" />
                                                                <span className="text-text-2 font-bold">{r}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-40 cyber-panel bg-bg-1/40 border-white/5 relative group">
                            <div className="absolute inset-0 zellige-pattern opacity-10" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="h-20 w-20 rounded-3xl bg-bg-2 border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    <LayoutGrid className="h-10 w-10 text-text-3" />
                                </div>
                                <h2 className="text-2xl font-black text-text-1 uppercase tracking-tighter mb-4">Awaiting Signal</h2>
                                <p className="text-[10px] text-text-3 uppercase tracking-[0.3em] max-w-xs font-bold leading-relaxed opacity-50">
                                    Select an offensive or defensive script from the armamentarium to begin tactical deployment.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {apiError && (
                <div className="fixed bottom-8 right-8 animate-in slide-in-from-right-10 z-50">
                    <div className="bg-danger text-text-1 px-8 py-4 rounded-xl shadow-2xl flex items-center gap-4">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{apiError}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
