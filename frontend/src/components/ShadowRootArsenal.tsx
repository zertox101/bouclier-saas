"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Terminal, Zap, Globe, Lock, Eye, Target,
    Play, StopCircle, RefreshCw, ChevronRight, Copy, Ghost,
    CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink,
    Radio, Cpu, Database, Key, Link, Network, Fingerprint,
    ShieldAlert, Activity, Code2, Braces, Server, Bug,
    Search, Wifi, Crosshair, Package, ChevronDown,
    ScanSearch, Award, MailSearch, Map, FolderSearch, Radar,
    UserRound, HardDrive, FileWarning, Unlock, Monitor, Filter, Settings, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { API_CONFIG } from "@/lib/api-config";

// ─── Types ────────────────────────────────────────────────────────────────────
type SessionStatus = "idle" | "initializing" | "running" | "completed" | "failed" | "stopped";
type LogLevel = "info" | "success" | "warning" | "error" | "debug";

interface ToolLog {
    timestamp: number;
    level: LogLevel;
    message: string;
}

interface CredentialFind {
    type: "password" | "admin" | "ftp" | "ssh" | "hash" | "token" | "path";
    value: string;
    context: string;
    timestamp: number;
}

interface AttackVector {
    id: string;
    label: string;
    description: string;
    toolId: string;
    category: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mitre: string;
    icon: any;
    defaultTarget: string;
    inputFields: InputField[];
    tags: string[];
}

interface InputField {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "select" | "number";
    options?: string[];
    default?: string;
}

// ─── Attack Vectors — Palantir Optimized ────────────────────────────────────
const HARDCODED_VECTORS: AttackVector[] = [
    {
        id: "recon_nmap",
        label: "NETWORK_ANALYSIS_MOD",
        description: "High-fidelity network discovery via Nmap. Service enumeration, OS identification, and NSE tactical scripts.",
        toolId: "network_recon",
        category: "RECONNAISSANCE",
        riskLevel: "MEDIUM",
        mitre: "T1046",
        icon: Network,
        defaultTarget: "192.168.1.1",
        tags: ["NMAP", "PORT_DISC", "OS_FINGERPRINT"],
        inputFields: [
            { key: "target", label: "IP_OR_CIDR", placeholder: "192.168.1.0/24", type: "text" },
            { key: "ports", label: "PORT_RANGE", placeholder: "ALL_COMMON", type: "text" },
            { key: "intensity", label: "INTENSITY_MODE", placeholder: "STANDARD", type: "select", options: ["STEALTH", "STANDARD", "AGGRESSIVE"], default: "STANDARD" }
        ]
    },
    {
        id: "web_nikto",
        label: "WEB_SERVICE_PROBE",
        description: "Vertical web server audit. Identifies misconfigurations, hazardous artifacts, and compliance violations.",
        toolId: "web_scanner",
        category: "WEB_VULN",
        riskLevel: "HIGH",
        mitre: "T1190",
        icon: Globe,
        defaultTarget: "http://192.168.1.1",
        tags: ["NIKTO", "HTTP_AUDIT", "SVC_MISCONFIG"],
        inputFields: [
            { key: "target", label: "TARGET_URI", placeholder: "http://192.168.1.1", type: "text" }
        ]
    },
    {
        id: "sql_injection",
        label: "DATABASE_PENETRATION",
        description: "Automated RDBMS vulnerability assessment. Fingerprints backend structures and extracts telemetry schema.",
        toolId: "sqlmap_scan",
        category: "EXPLOITATION",
        riskLevel: "CRITICAL",
        mitre: "T1190",
        icon: Database,
        defaultTarget: "http://192.168.1.1/api",
        tags: ["SQLMAP", "INJECTION", "DATA_EXFIL"],
        inputFields: [
            { key: "target", label: "API_ENDPOINT", placeholder: "http://target/api?id=1", type: "text" },
            { key: "level", label: "INTENSITY_LEVEL", placeholder: "1", type: "number", default: "1" },
            { key: "risk", label: "RISK_TOLERANCE", placeholder: "1", type: "number", default: "1" }
        ]
    },
    {
        id: "brute_force",
        label: "CREDENTIAL_VALIDATION",
        description: "Multi-protocol auth verification. Tests for weak access controls across SSH, RDP, and Database streams.",
        toolId: "password_auditor",
        category: "CRED_ACCESS",
        riskLevel: "CRITICAL",
        mitre: "T1110",
        icon: Key,
        defaultTarget: "192.168.1.1",
        tags: ["HYDRA", "AUTH_BRUTE", "ACCESS_TEST"],
        inputFields: [
            { key: "target", label: "NODE_IP", placeholder: "192.168.1.1", type: "text" },
            { key: "service", label: "LINK_PROTOCOL", placeholder: "SSH", type: "select", options: ["SSH", "FTP", "RDP", "SMB"], default: "SSH" },
            { key: "username", label: "TARGET_ID", placeholder: "ADMIN", type: "text" }
        ]
    },
    {
        id: "bb_nuclei",
        label: "TEMPLATE_VULN_SCAN",
        description: "Fast template-based vulnerability scanner for discovering misconfigurations and CVE exposures.",
        toolId: "nuclei_scan",
        category: "RECONNAISSANCE",
        riskLevel: "HIGH",
        mitre: "T1190",
        icon: Radar,
        defaultTarget: "https://example.com",
        tags: ["NUCLEI", "CVE_SEARCH", "RAPID_SCAN"],
        inputFields: [
            { key: "target", label: "TARGET_URL", placeholder: "https://example.com", type: "text" }
        ]
    }
];

export default function ShadowRootArsenal() {
    const [vectors, setVectors] = useState<AttackVector[]>(HARDCODED_VECTORS);
    const [selectedVector, setSelectedVector] = useState<AttackVector>(HARDCODED_VECTORS[0]);

    useEffect(() => {
        apiClient("/api/tools")
            .then(d => {
                if (d.tools?.length > 0) {
                    const apiVectors: AttackVector[] = d.tools.map((t: any, i: number) => ({
                        id: t.id || `vec-${i}`,
                        label: t.name,
                        description: t.description,
                        toolId: t.id,
                        category: t.category || "General",
                        riskLevel: (t.risk_level || "MEDIUM").toUpperCase() as any,
                        mitre: "",
                        icon: Terminal,
                        defaultTarget: "localhost",
                        inputFields: [{ key: "target", label: "Target", placeholder: "Enter target", type: "text" }],
                        tags: [t.category || "general"],
                    }));
                    if (apiVectors.length > 0) {
                        setVectors(apiVectors);
                        setSelectedVector(apiVectors[0]);
                    }
                }
            })
            .catch(() => {});
    }, []);
    const [params, setParams] = useState<Record<string, string>>({});
    const [globalTarget, setGlobalTarget] = useState<string>("");
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
    const [logs, setLogs] = useState<ToolLog[]>([]);
    const [credentials, setCredentials] = useState<CredentialFind[]>([]);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [filter, setFilter] = useState<string>("All");
    const logsEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const defaults: Record<string, string> = {};
        selectedVector.inputFields.forEach(f => {
            defaults[f.key] = f.default || "";
        });
        if (globalTarget && selectedVector.inputFields.some(f => f.key === "target")) {
            defaults["target"] = globalTarget;
        }
        setParams(defaults);
    }, [selectedVector, globalTarget]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    useEffect(() => {
        if (sessionStatus === "running" || sessionStatus === "initializing") {
            timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (sessionStatus === "idle") setElapsedTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [sessionStatus]);

    useEffect(() => {
        if (!activeJobId || sessionStatus !== "running") return;
        let cancelled = false;
        const poll = async () => {
            if (cancelled) return;
            try {
                const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/jobs/${activeJobId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.logs) {
                        setLogs(data.logs.map((l: any) => ({
                            timestamp: l.timestamp,
                            level: l.level || "info",
                            message: l.message,
                        })));
                    }
                    if (data.status === "completed") setSessionStatus("completed");
                    else if (data.status === "failed") setSessionStatus("failed");
                    else if (!cancelled) setTimeout(poll, 1500);
                }
            } catch { if (!cancelled) setTimeout(poll, 2500); }
        };
        poll();
        return () => { cancelled = true; };
    }, [activeJobId, sessionStatus]);

    const handleLaunch = async () => {
        if (sessionStatus === "running" || sessionStatus === "initializing") return;
        const target = params.target || globalTarget;
        if (!target) return;

        setLogs([]);
        setCredentials([]);
        setSessionStatus("initializing");
        setElapsedTime(0);

        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_CONFIG.TOOLS_API_KEY,
                },
                body: JSON.stringify({
                    tool_id: selectedVector.toolId,
                    input: { ...params, target }
                })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveJobId(data.job_id);
                setSessionStatus("running");
            } else {
                setSessionStatus("failed");
            }
        } catch {
            setSessionStatus("failed");
        }
    };

    const isRunning = sessionStatus === "running" || sessionStatus === "initializing";
    const categories = ["All", ...Array.from(new Set(vectors.map(v => v.category)))];

    return (
        <div className="flex flex-col h-screen bg-[#080A0E] text-slate-200 selection:bg-blue-600/40 font-sans">
            
            {/* Top Toolbar (Palantir Frame) */}
            <header className="h-14 border-b border-white/5 bg-[#0D1017] px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-violet-600 rounded-[2px] flex items-center justify-center">
                            <Ghost className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">Shadow Root</h1>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Offensive_Arsenal_L3</span>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-white/5 mx-2" />
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="text-blue-500">SESSION_ID:</span>
                        <span className="text-slate-300 font-mono">{activeJobId?.slice(0, 8) || "IDLE"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-[9px] font-mono text-slate-400 bg-black/20 px-3 py-1 rounded-[1px] border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-600")} />
                            <span>{sessionStatus.toUpperCase()}</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <span className="text-blue-400">{String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:{String(elapsedTime % 60).padStart(2, "0")}</span>
                    </div>
                    <button onClick={handleLaunch} disabled={isRunning || !params.target} className={cn(
                        "px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-[2px] transition-all",
                        isRunning ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10"
                    )}>
                        DEPLOY_NODE
                    </button>
                </div>
            </header>

            {/* Main Workspace Split */}
            <main className="flex-1 overflow-hidden flex divide-x divide-white/5">
                
                {/* Left Sidebar: Vector Library */}
                <div className="w-80 flex flex-col bg-[#0D1017] shrink-0">
                    <div className="p-4 border-b border-white/5 bg-white/2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="FILTER_VECTORS..." 
                                className="w-full bg-black/40 border border-white/5 pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-blue-500/50 focus:outline-none rounded-[2px]"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {vectors.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVector(v)}
                                className={cn(
                                    "w-full text-left p-4 rounded-[2px] transition-all group flex items-start gap-4",
                                    selectedVector.id === v.id ? "bg-white/5 border border-white/10" : "hover:bg-white/2 border border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "mt-1 p-2 rounded-[2px] shrink-0",
                                    selectedVector.id === v.id ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-500"
                                )}>
                                    <v.icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                                        selectedVector.id === v.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                                    )}>
                                        {v.label}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase mt-1 italic">{v.category}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center: Configuration & Details */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#080A0E]">
                    <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                        
                        {/* Vector Detail Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-[1px] border border-blue-600/20">
                                        MITRE_{selectedVector.mitre}
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-[1px] border",
                                        selectedVector.riskLevel === 'CRITICAL' ? "bg-red-600/10 text-red-500 border-red-600/20" : "bg-amber-600/10 text-amber-500 border-amber-600/20"
                                    )}>
                                        RISK_{selectedVector.riskLevel}
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{selectedVector.label}</h2>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">{selectedVector.description}</p>
                        </div>

                        <div className="h-px w-32 bg-white/5" />

                        {/* Parameter Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Settings className="w-3.5 h-3.5" />
                                    OPERATIONAL_PARAMETERS
                                </h3>
                                <div className="space-y-4">
                                    {selectedVector.inputFields.map(f => (
                                        <div key={f.key} className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                {f.label}
                                                {f.key === 'target' && <span className="text-blue-500/50">::PRIMARY_VECTOR</span>}
                                            </label>
                                            <div className="relative">
                                                {f.type === 'select' ? (
                                                    <select 
                                                        value={params[f.key] || ""}
                                                        onChange={e => setParams(prev => ({...prev, [f.key]: e.target.value}))}
                                                        className="w-full bg-[#0D1017] border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:border-blue-500/50 outline-none appearance-none rounded-[2px]"
                                                    >
                                                        {f.options?.map(opt => <option key={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input 
                                                        type={f.type}
                                                        value={params[f.key] || ""}
                                                        placeholder={f.placeholder}
                                                        onChange={e => setParams(prev => ({...prev, [f.key]: e.target.value}))}
                                                        className="w-full bg-[#0D1017] border border-white/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:border-blue-500/50 outline-none rounded-[2px] transition-colors"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#0D1017]/50 border border-white/5 p-6 rounded-[2px] flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Shield className="w-3.5 h-3.5" />
                                        SECURITY_COMPLIANCE
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <span>FORCE_PROXY_ENFORCED</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <span>TELEMETRY_RECORD_ACTIVE</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <span>MITRE_ATT&CK_MAPPED</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/5 mt-6">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVector.tags.map(t => (
                                            <span key={t} className="px-2 py-1 bg-white/2 text-[8px] font-black text-slate-500 uppercase tracking-tighter border border-white/5 rounded-[1px]">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Technical Output (Real-Time Terminal) */}
                <div className="w-[500px] flex flex-col bg-[#0D1017] border-l border-white/5">
                    <div className="h-10 border-b border-white/5 bg-white/2 flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical_Stream</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {isRunning && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                            <span className="text-[9px] font-bold text-slate-600 uppercase">Buffer: {logs.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/40 font-mono text-[10px] text-slate-400 selection:bg-blue-600/30 selection:text-white">
                        <div className="space-y-1.5">
                            {logs.length === 0 && (
                                <div className="text-slate-800 italic uppercase opacity-40">:: Waiting for core sequence deployment ::</div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4">
                                    <span className="text-slate-700 shrink-0">[{new Date(log.timestamp * 1000).toLocaleTimeString('en-US', { hour12: false })}]</span>
                                    <span className={cn(
                                        "flex-1 break-all",
                                        log.level === 'success' ? "text-emerald-400 font-bold" :
                                        log.level === 'warning' ? "text-amber-400" :
                                        log.level === 'error' ? "text-red-400 font-bold" :
                                        log.level === 'debug' ? "text-blue-500/70" : "text-slate-400"
                                    )}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                    <div className="p-4 bg-white/2 border-t border-white/5">
                         <div className="flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">
                             <span>Link_Integrity</span>
                             <span>98.2%</span>
                         </div>
                         <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full w-[98%] bg-blue-600" />
                         </div>
                    </div>
                </div>
            </main>

            {/* Credential Capture HUD (Palantir Drawer Style) */}
            <AnimatePresence>
                {credentials.length > 0 && (
                    <motion.div 
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className="fixed bottom-0 left-0 right-0 h-40 bg-[#0D1017] border-t border-blue-600/30 z-[70] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
                    >
                        <div className="h-full flex px-8 divide-x divide-white/5">
                            <div className="py-6 pr-8 w-64 shrink-0 flex flex-col justify-center">
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Intelligence_Capture</h4>
                                <span className="text-2xl font-black italic tracking-tighter text-white uppercase">{credentials.length} Findings</span>
                                <span className="text-[8px] font-bold text-slate-600 uppercase mt-2">REALTIME_CRYPT_ANALYSIS</span>
                            </div>
                            <div className="flex-1 overflow-x-auto py-4 px-8 flex items-center gap-4 custom-scrollbar">
                                {credentials.map((cred, i) => (
                                    <div key={i} className="min-w-[280px] h-full bg-white/2 border border-white/5 p-4 flex flex-col justify-between group hover:border-blue-500/30 transition-all rounded-[2px] shrink-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{cred.type}</span>
                                                <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[200px]">{cred.value}</span>
                                            </div>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(cred.value)}
                                                className="p-1 text-slate-600 hover:text-white transition-colors"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="text-[7px] font-bold text-slate-700 uppercase truncate mt-2">{cred.context}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
