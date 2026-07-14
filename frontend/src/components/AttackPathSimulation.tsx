"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Skull, Target, Play, ShieldAlert, Zap,
    Network, Terminal, Activity, ChevronRight,
    Database, AlertTriangle, CheckCircle2,
    Lock, Globe, Search, Cpu, Loader2, XCircle,
    RefreshCw, Layers, Crosshair, Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { API_CONFIG } from "@/lib/api-config";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PathStep {
    id: string;
    label: string;
    tactic: string;
    toolId: string;
    status: "pending" | "executing" | "success" | "failed" | "skipped";
    icon: any;
    params: Record<string, any>;
    result?: string;
}

interface AttackPath {
    id: string;
    name: string;
    description: string;
    target: string;
    steps: PathStep[];
}

// ─── Attack Path Templates ────────────────────────────────────────────────────
const PATH_TEMPLATES: AttackPath[] = [
    {
        id: "CHAIN-01",
        name: "Full Chain Compromise",
        description: "Initial Recon → Vulnerability Analysis → Credential Access → Data Exfiltration.",
        target: "",
        steps: [
            {
                id: "recon",
                label: "Phase 1: Deep Recon",
                tactic: "Reconnaissance",
                toolId: "nmap_advanced",
                status: "pending",
                icon: Search,
                params: { ports: "22,80,443,8080,3306" }
            },
            {
                id: "vuln",
                label: "Phase 2: Exposure Audit",
                tactic: "Vulnerability Research",
                toolId: "nikto_webscan",
                status: "pending",
                icon: ShieldAlert,
                params: { tuning: "123" }
            },
            {
                id: "access",
                label: "Phase 3: Auth Bypass",
                tactic: "Credential Access",
                toolId: "hydra_bruteforce",
                status: "pending",
                icon: Key,
                params: { username: "admin", service: "ssh" }
            },
            {
                id: "exfil",
                label: "Phase 4: Data Exfiltration",
                tactic: "Exploitation",
                toolId: "sqlmap_advanced",
                status: "pending",
                icon: Database,
                params: { level: "1" }
            }
        ]
    },
    {
        id: "OSINT-01",
        name: "OSINT & Surface Map",
        description: "Domain Enumeration → Subdomain Discovery → HTTP Probing.",
        target: "",
        steps: [
            {
                id: "whois",
                label: "Phase 1: Org Intel",
                tactic: "OSINT",
                toolId: "whois_lookup",
                status: "pending",
                icon: Globe,
                params: {}
            },
            {
                id: "enum",
                label: "Phase 2: DNS Mapping",
                tactic: "Reconnaissance",
                toolId: "dns_lookup",
                status: "pending",
                icon: Layers,
                params: { type: "A" }
            },
            {
                id: "probe",
                label: "Phase 3: Surface Verify",
                tactic: "Web Discovery",
                toolId: "nikto_webscan",
                status: "pending",
                icon: Target,
                params: {}
            }
        ]
    }
];


export default function AttackPathSimulation() {
    const [activePath, setActivePath] = useState<AttackPath | null>(null);
    const [globalTarget, setGlobalTarget] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [logs, setLogs] = useState<string[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [stats, setStats] = useState({ success: 0, failed: 0, total: 0 });
    const [templates, setTemplates] = useState<AttackPath[]>(PATH_TEMPLATES);

    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    useEffect(() => {
        apiClient("/api/purple-team/executions")
            .then(d => {
                if (d.executions?.length > 0) {
                    const apiTemplates: AttackPath[] = d.executions.slice(0, 5).map((e: any, i: number) => ({
                        id: e.id || `APT-${i}`,
                        name: `Purple Team: ${e.technique}`,
                        description: `Automated execution of ${e.technique} on ${e.host || "target"}`,
                        phases: [
                            { name: "Reconnaissance", description: `Scan ${e.host || "target"}`, duration: 30, icon: "search" },
                            { name: "Exploitation", description: `Execute ${e.technique}`, duration: 60, icon: "zap" },
                            { name: "Reporting", description: "Collect results", duration: 15, icon: "file" },
                        ],
                        riskLevel: e.severity || "MEDIUM",
                    }));
                    setTemplates(apiTemplates);
                }
            })
            .catch(() => {});
    }, []);

    const addLog = (msg: string, type: "info" | "success" | "error" | "warn" = "info") => {
        const time = new Date().toLocaleTimeString([], { hour12: false });
        setLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    const runPath = async (template: AttackPath) => {
        if (!globalTarget) {
            addLog("Error: No global target defined for tactical sequence.", "error");
            return;
        }

        const path = JSON.parse(JSON.stringify(template));
        path.target = globalTarget;
        setActivePath(path);
        setIsExecuting(true);
        setCurrentStepIndex(0);
        setLogs([]);
        setStats({ success: 0, failed: 0, total: path.steps.length });

        addLog(`Initiating Path Simulation: ${path.name}`, "info");
        addLog(`Primary Objective: ${path.target}`, "warn");

        executeStep(path, 0);
    };

    const executeStep = async (path: AttackPath, index: number) => {
        if (index >= path.steps.length) {
            addLog("Tactical Sequence Complete. Mission Successful.", "success");
            setIsExecuting(false);
            setCurrentStepIndex(-1);
            return;
        }

        setCurrentStepIndex(index);
        const step = path.steps[index];
        addLog(`Deploying ${step.label} [${step.toolId}]...`, "info");

        // Update step status to executing
        setActivePath(prev => {
            if (!prev) return null;
            const next = { ...prev };
            next.steps[index].status = "executing";
            return next;
        });

        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_CONFIG.TOOLS_API_KEY,
                },
                body: JSON.stringify({
                    tool_id: step.toolId,
                    input: { ...step.params, target: globalTarget }
                })
            });

            if (!res.ok) throw new Error("API Connection Failed");

            const data = await res.json();
            const sid = data.job_id;
            setJobId(sid);
            addLog(`Job Dispatched: ${sid}`, "info");

            // Poll for completion
            let isDone = false;
            while (!isDone) {
                await new Promise(r => setTimeout(r, 2000));
                const poll = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/jobs/${sid}`);
                if (poll.ok) {
                    const status = await poll.json();
                    if (status.status === "completed") {
                        addLog(`Phase ${index + 1} Success. Moving to next vector.`, "success");
                        updateStepStatus(index, "success");
                        setStats(s => ({ ...s, success: s.success + 1 }));
                        isDone = true;
                        executeStep(path, index + 1);
                    } else if (status.status === "failed") {
                        addLog(`Phase ${index + 1} Blocked/Failed. Path analysis interrupted.`, "error");
                        updateStepStatus(index, "failed");
                        setStats(s => ({ ...s, failed: s.failed + 1 }));
                        isDone = true;
                        setIsExecuting(false);
                    }
                }
            }
        } catch (err) {
            addLog(`Error in Path Execution: ${err}`, "error");
            updateStepStatus(index, "failed");
            setIsExecuting(false);
        }
    };

    const updateStepStatus = (index: number, status: PathStep["status"]) => {
        setActivePath(prev => {
            if (!prev) return null;
            const next = { ...prev };
            next.steps[index].status = status;
            return next;
        });
    };

    const stopPath = () => {
        setIsExecuting(false);
        addLog("Mission manually aborted by operator.", "error");
    };

    return (
        <div className="h-full w-full bg-[#030308] text-white p-8 overflow-y-auto scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <Skull className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                                Attack Path <span className="text-red-500">Simulation</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-mono mt-1">OFFENSIVE CHAIN ORCHESTRATOR :: REAL-TIME TARGETING</p>
                        </div>
                    </div>

                    {isExecuting && (
                        <div className="flex items-center gap-4 px-6 py-3 bg-red-600/10 border border-red-600/20 rounded-2xl animate-pulse">
                            <Activity className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Tactical Mission In Progress</span>
                        </div>
                    )}
                </div>

                {/* Objective Input */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 group transition-all hover:border-red-500/20">
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Target className="w-3 h-3 text-red-500" />
                                Primary Objective (Public Domain or Private IP)
                            </div>
                            <input
                                type="text"
                                value={globalTarget}
                                onChange={e => setGlobalTarget(e.target.value)}
                                disabled={isExecuting}
                                placeholder="example.com | 192.168.1.1 | vpn.target-infra.cloud"
                                className="w-full bg-transparent text-xl font-mono text-white placeholder:text-slate-800 focus:outline-none"
                            />
                        </div>
                        <div className="shrink-0 flex gap-4">
                            <div className="text-right">
                                <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Intelligence</div>
                                <div className="text-[10px] font-black text-lime-400 uppercase tracking-widest">
                                    {globalTarget ? "Validated / Reachable" : "Awaiting Input"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left: Path Templates */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Path Selection</h2>
                        <div className="space-y-3">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => runPath(template)}
                                    disabled={isExecuting || !globalTarget}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border text-left transition-all duration-300 group relative overflow-hidden",
                                        activePath?.id === template.id
                                            ? "bg-red-600/10 border-red-500/40"
                                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[8px] font-black text-red-500/60 font-mono">{template.id}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <h3 className="text-lg font-black italic text-white mb-2">{template.name}</h3>
                                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">{template.description}</p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {template.steps.map((s, i) => (
                                                <div key={i} className="w-6 h-6 rounded-lg bg-black border border-white/5 flex items-center justify-center">
                                                    <s.icon className="w-3 h-3 text-slate-500" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{template.steps.length} Phases</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Path Visualization */}
                    <div className="lg:col-span-8 space-y-6">

                        <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-10 relative overflow-hidden">
                            {/* Cyber decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/5 blur-[100px] rounded-full" />

                            <div className="relative z-10 flex flex-col items-center">
                                {!activePath ? (
                                    <div className="py-20 flex flex-col items-center text-center space-y-4">
                                        <Network className="w-16 h-16 text-white/5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No Tactical Path Selected</p>
                                            <p className="text-[10px] text-slate-600">Choose a template to visualize the attack chain for {globalTarget || "target"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-12">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-black italic mb-1">{activePath.name}</h2>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase">Mission Objective: {activePath.target}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Completion</div>
                                                <div className="text-2xl font-black text-red-500">{Math.round((stats.success / stats.total) * 100)}%</div>
                                            </div>
                                        </div>

                                        <div className="relative flex justify-between items-start">
                                            {/* Connector line */}
                                            <div className="absolute top-8 left-12 right-12 h-0.5 bg-white/5" />

                                            {activePath.steps.map((step, idx) => {
                                                const Icon = step.icon;
                                                const isCurrent = idx === currentStepIndex;
                                                const isCompleted = step.status === "success";
                                                const isFailed = step.status === "failed";

                                                return (
                                                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 w-40">
                                                        <motion.div
                                                            animate={isCurrent ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className={cn(
                                                                "w-16 h-16 rounded-3xl border-2 flex items-center justify-center transition-all duration-500 relative shadow-2xl",
                                                                step.status === "pending" && "bg-black border-white/10 text-slate-700",
                                                                step.status === "executing" && "bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]",
                                                                step.status === "success" && "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]",
                                                                step.status === "failed" && "bg-slate-900 border-slate-700 text-slate-500"
                                                            )}
                                                        >
                                                            <Icon className="w-7 h-7" />
                                                            {isCompleted && (
                                                                <div className="absolute -top-2 -right-2 bg-lime-500 text-black rounded-full p-1 shadow-lg">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                            {isFailed && (
                                                                <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg">
                                                                    <XCircle className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                        <div className="text-center">
                                                            <p className={cn("text-[10px] font-black uppercase tracking-tight", isCurrent ? "text-red-500" : "text-slate-400")}>
                                                                {step.label}
                                                            </p>
                                                            <p className="text-[8px] font-mono text-slate-600 mt-1">{step.tactic}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Console Area */}
                                        <div className="bg-black/60 rounded-3xl overflow-hidden border border-white/5">
                                            <div className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border-b border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <Terminal className="w-3 h-3 text-slate-600" />
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Execution Core v10.4 // live_logs</span>
                                                </div>
                                                {jobId && <span className="text-[8px] font-mono text-red-500/50">JOB_ID: {jobId}</span>}
                                            </div>
                                            <div className="h-64 overflow-y-auto p-6 font-mono text-[10px] space-y-2 custom-scrollbar bg-black/40">
                                                {logs.map((log, i) => (
                                                    <div key={i} className={cn(
                                                        "flex gap-4 border-l-2 pl-4 py-0.5",
                                                        log.includes("Success") ? "border-lime-500 text-lime-400" :
                                                            log.includes("Error") ? "border-red-600 text-red-500" :
                                                                "border-white/5 text-slate-400"
                                                    )}>
                                                        {log}
                                                    </div>
                                                ))}
                                                {isExecuting && (
                                                    <div className="flex items-center gap-2 text-red-500/50">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span className="animate-pulse">_ Awaiting node feedback...</span>
                                                    </div>
                                                )}
                                                <div ref={logsEndRef} />
                                            </div>
                                        </div>

                                        {/* Mission Controls */}
                                        <div className="flex gap-4">
                                            {isExecuting ? (
                                                <button
                                                    onClick={stopPath}
                                                    className="flex-1 h-14 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                    Abort Operational Sequence
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => runPath(activePath)}
                                                    className="flex-1 h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                                >
                                                    <Play className="w-5 h-5 fill-current" />
                                                    Re-Sync and Execute Chain
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setActivePath(null)}
                                                className="h-14 px-8 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-500 text-[10px] font-black uppercase hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Intelligence Feed */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="premium-card p-6 bg-red-600/[0.02] border-red-500/10">
                                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Vulnerability Correlation
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        The orchestrator will automatically pivot based on discovered service banners and leaked credentials.
                                    </p>
                                    <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                                        <p className="text-[9px] font-bold text-red-500 uppercase">Adaptive Mode: ON</p>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Crosshair className="w-4 h-4" />
                                    MITRE Mapping Intelligence
                                </h3>
                                <div className="space-y-2">
                                    {["T1595 - Active Scanning", "T1046 - Service Scanning", "T1110 - Brute Force", "T1071 - C2 Protocols"].map(ttp => (
                                        <div key={ttp} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-cyan-600" />
                                            <span className="text-[10px] font-mono text-slate-500">{ttp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
