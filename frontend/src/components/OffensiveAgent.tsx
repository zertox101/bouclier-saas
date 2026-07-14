"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Target, Play, StopCircle, Shield, AlertTriangle,
    CheckCircle2, Loader2, ChevronRight, Activity, Crosshair,
    Network, Globe, Database, Search, Zap, FileWarning,
    Server, Bug, Terminal, BarChart3, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_CONFIG } from "@/lib/api-config";

type Phase = "INIT" | "WHOIS" | "DNS" | "PORTSCAN" | "HTTP" | "VULN" | "EXPLOITDB" | "REPORT";
type LogLevel = "info" | "success" | "warning" | "error" | "debug";
type AgentStatus = "idle" | "running" | "completed" | "failed";
type Mode = "standard" | "aggressive" | "stealth";

interface AgentLog {
    timestamp: number;
    phase: Phase;
    level: LogLevel;
    message: string;
}

interface AgentJob {
    agent_job_id: string;
    target: string;
    mode: Mode;
    status: string;
    current_phase: Phase;
    logs: AgentLog[];
    risk: string | null;
    findings: Record<string, any>;
}

const PHASES: { id: Phase; label: string; icon: any; desc: string }[] = [
    { id: "WHOIS", label: "WHOIS", icon: Search, desc: "Domain intelligence" },
    { id: "DNS", label: "DNS", icon: Globe, desc: "Record enumeration" },
    { id: "PORTSCAN", label: "PORT SCAN", icon: Network, desc: "Service discovery" },
    { id: "HTTP", label: "HTTP", icon: Server, desc: "Web fingerprint" },
    { id: "VULN", label: "VULN SCAN", icon: Bug, desc: "Nikto analysis" },
    { id: "EXPLOITDB", label: "EXPLOIT DB", icon: Database, desc: "CVE matching" },
    { id: "REPORT", label: "AI REPORT", icon: Brain, desc: "Risk synthesis" },
];

const PHASE_ORDER: Phase[] = ["INIT", "WHOIS", "DNS", "PORTSCAN", "HTTP", "VULN", "EXPLOITDB", "REPORT"];

const RISK_COLOR: Record<string, string> = {
    CRITICAL: "text-red-500",
    HIGH: "text-amber-500",
    MEDIUM: "text-yellow-400",
    LOW: "text-emerald-500",
};

const LOG_COLOR: Record<LogLevel, string> = {
    success: "text-emerald-400 font-bold",
    error: "text-red-400 font-bold",
    warning: "text-amber-400",
    debug: "text-sky-500/70",
    info: "text-slate-400",
};

export default function OffensiveAgent() {
    const [target, setTarget] = useState("");
    const [mode, setMode] = useState<Mode>("standard");
    const [status, setStatus] = useState<AgentStatus>("idle");
    const [agentJobId, setAgentJobId] = useState<string | null>(null);
    const [job, setJob] = useState<AgentJob | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [job?.logs.length]);

    useEffect(() => {
        if (status === "running") {
            timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (status === "idle") setElapsedTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    useEffect(() => {
        if (!agentJobId || status !== "running") return;
        let cancelled = false;
        const poll = async () => {
            if (cancelled) return;
            try {
                const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/agent/jobs/${agentJobId}`, {
                    headers: { "X-API-KEY": API_CONFIG.TOOLS_API_KEY }
                });
                if (res.ok) {
                    const data: AgentJob = await res.json();
                    setJob(data);
                    if (data.status === "completed") {
                        setStatus("completed");
                        return;
                    }
                    if (data.status === "failed") {
                        setStatus("failed");
                        return;
                    }
                }
            } catch { }
            if (!cancelled) setTimeout(poll, 1500);
        };
        poll();
        return () => { cancelled = true; };
    }, [agentJobId, status]);

    const handleLaunch = async () => {
        if (!target.trim() || status === "running") return;
        setStatus("running");
        setJob(null);
        setAgentJobId(null);
        setElapsedTime(0);
        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/agent/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_CONFIG.TOOLS_API_KEY,
                },
                body: JSON.stringify({ target: target.trim(), mode }),
            });
            if (res.ok) {
                const data = await res.json();
                setAgentJobId(data.agent_job_id);
            } else {
                setStatus("failed");
            }
        } catch {
            setStatus("failed");
        }
    };

    const currentPhaseIdx = job ? PHASE_ORDER.indexOf(job.current_phase) : 0;
    const isRunning = status === "running";
    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="flex flex-col h-screen bg-[#030508] text-slate-200 font-sans overflow-hidden">
            <style>{`
                .agent-input {
                    background: rgba(8, 11, 18, 0.8);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                    box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .agent-input:focus {
                    border-color: rgba(56, 189, 248, 0.5);
                    box-shadow: 0 0 0 1px rgba(56,189,248,0.1), inset 0 2px 8px rgba(0,0,0,0.5);
                    outline: none;
                }
                .gotham-grid {
                    background-image:
                        linear-gradient(rgba(30, 41, 59, 0.25) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30, 41, 59, 0.25) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>

            {/* Header */}
            <header className="h-14 bg-[#08090E] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-7 h-7 border border-sky-500/50 bg-sky-500/10 rounded-[2px] flex items-center justify-center">
                        <Brain className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-white leading-none">Bouclier AI Offensive Agent</h1>
                        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Autonomous Pentest Pipeline — Ibn Tofail University</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[9px] font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : status === "completed" ? "bg-sky-500" : "bg-slate-600")} />
                        <span>{status.toUpperCase()}</span>
                    </div>
                    <span className="text-sky-400 font-bold">{formatTime(elapsedTime)}</span>
                    {job?.agent_job_id && (
                        <span className="text-slate-700">ID: {job.agent_job_id.slice(-8)}</span>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Target Config Panel */}
                <div className="w-[320px] bg-[#08090E] border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        {/* Target Input */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                <Crosshair className="w-3 h-3" />
                                Primary Target
                            </label>
                            <div className="relative">
                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                <input
                                    type="text"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleLaunch()}
                                    disabled={isRunning}
                                    placeholder="192.168.1.1 or target.com"
                                    className="w-full agent-input rounded py-2.5 pl-9 pr-4 text-xs text-sky-100 font-mono placeholder:text-slate-700 disabled:opacity-40"
                                />
                            </div>
                        </div>

                        {/* Mode */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Engagement Mode
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(["stealth", "standard", "aggressive"] as Mode[]).map(m => (
                                    <button
                                        key={m}
                                        disabled={isRunning}
                                        onClick={() => setMode(m)}
                                        className={cn(
                                            "py-2 text-[9px] font-black uppercase tracking-widest rounded border transition-all disabled:opacity-40",
                                            mode === m
                                                ? m === "aggressive" ? "border-red-500/50 bg-red-500/10 text-red-400"
                                                    : m === "stealth" ? "border-sky-500/50 bg-sky-500/10 text-sky-400"
                                                        : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                                                : "border-white/5 bg-white/2 text-slate-600 hover:text-slate-400 hover:border-white/10"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[8px] font-mono text-slate-700 mt-2 leading-relaxed">
                                {mode === "stealth" && "Low-noise: -sS -T2 -f, top 500 ports"}
                                {mode === "standard" && "Balanced: -sV -O -T3, top 1000 ports"}
                                {mode === "aggressive" && "Full depth: -A -T4 -sC, top 2000 ports"}
                            </p>
                        </div>

                        {/* Pipeline Preview */}
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                <Radio className="w-3 h-3" />
                                Attack Chain
                            </label>
                            <div className="space-y-1.5">
                                {PHASES.map((phase, idx) => {
                                    const phaseStatus = job?.current_phase === phase.id
                                        ? "active"
                                        : PHASE_ORDER.indexOf(job?.current_phase as Phase) > PHASE_ORDER.indexOf(phase.id)
                                            ? "done"
                                            : "pending";
                                    return (
                                        <div key={phase.id} className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-[2px] border transition-all text-[9px]",
                                            phaseStatus === "active" ? "border-sky-500/40 bg-sky-500/5" :
                                                phaseStatus === "done" ? "border-emerald-500/20 bg-emerald-500/5" :
                                                    "border-white/5 bg-transparent"
                                        )}>
                                            {phaseStatus === "done" ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            ) : phaseStatus === "active" ? (
                                                <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
                                            ) : (
                                                <phase.icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className={cn("font-black uppercase tracking-widest",
                                                    phaseStatus === "active" ? "text-sky-400" :
                                                        phaseStatus === "done" ? "text-emerald-400" : "text-slate-700"
                                                )}>{phase.label}</div>
                                                <div className="text-slate-700 mt-0.5">{phase.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Risk Badge */}
                        {job?.risk && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded border text-center",
                                    job.risk === "CRITICAL" ? "border-red-500/40 bg-red-500/10" :
                                        job.risk === "HIGH" ? "border-amber-500/40 bg-amber-500/10" :
                                            job.risk === "MEDIUM" ? "border-yellow-500/40 bg-yellow-500/10" :
                                                "border-emerald-500/40 bg-emerald-500/10"
                                )}
                            >
                                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Threat Assessment</div>
                                <div className={cn("text-2xl font-black uppercase tracking-widest", RISK_COLOR[job.risk])}>
                                    {job.risk}
                                </div>
                                <div className="text-[8px] font-mono text-slate-600 mt-1">
                                    {job.findings.open_ports?.length || 0} ports | {job.findings.vulnerabilities?.length || 0} vulns | {job.findings.exploits?.length || 0} exploits
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Launch Button */}
                    <div className="p-6 border-t border-white/5">
                        <button
                            onClick={handleLaunch}
                            disabled={!target.trim() || isRunning}
                            className={cn(
                                "w-full h-12 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border transition-all",
                                isRunning ? "border-white/5 bg-white/2 text-slate-600 cursor-not-allowed" :
                                    status === "completed" ? "border-sky-500/50 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20" :
                                        target.trim() ? "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" :
                                            "border-white/5 bg-white/2 text-slate-700 cursor-not-allowed"
                            )}
                        >
                            {isRunning ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Agent Running...</>
                            ) : status === "completed" ? (
                                <><Play className="w-4 h-4" /> Re-Analyze</>
                            ) : (
                                <><Brain className="w-4 h-4" /> Launch AI Agent</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Live Log Stream */}
                <div className="flex-1 flex flex-col bg-[#030508] gotham-grid relative overflow-hidden">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none z-0" />

                    {/* Log Header */}
                    <div className="h-10 border-b border-white/5 bg-[#08090E]/90 flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-3.5 h-3.5 text-sky-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Live Intelligence Stream
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isRunning && <Loader2 className="w-3 h-3 text-sky-500 animate-spin" />}
                            <span className="text-[9px] font-mono text-slate-700 uppercase">
                                Phase: {job?.current_phase || "IDLE"}
                            </span>
                            <span className="text-[9px] font-mono text-slate-700">
                                {job?.logs.length || 0} events
                            </span>
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-0.5 z-10 relative">
                        {(!job || job.logs.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                                <Brain className="w-16 h-16 text-slate-700 mb-4" strokeWidth={1} />
                                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                                    Enter a target and launch the agent
                                </p>
                                <p className="text-slate-700 text-[10px] mt-2 font-mono">
                                    The AI will automatically run: WHOIS → DNS → Ports → HTTP → Nikto → Exploits → Report
                                </p>
                            </div>
                        )}
                        {job?.logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.1 }}
                                className="flex gap-4 leading-relaxed"
                            >
                                <span className="text-slate-800 shrink-0 select-none">
                                    [{new Date(log.timestamp * 1000).toLocaleTimeString("en-US", { hour12: false })}]
                                </span>
                                <span className={cn("shrink-0 text-[9px] font-bold uppercase w-12", {
                                    "text-sky-600": log.phase === "PORTSCAN" || log.phase === "DNS",
                                    "text-purple-600": log.phase === "WHOIS",
                                    "text-amber-600": log.phase === "HTTP",
                                    "text-red-600": log.phase === "VULN" || log.phase === "EXPLOITDB",
                                    "text-emerald-600": log.phase === "REPORT",
                                    "text-slate-600": log.phase === "INIT",
                                })}>
                                    {log.phase.slice(0, 4)}
                                </span>
                                <span className={cn("flex-1 break-all", LOG_COLOR[log.level])}>
                                    {log.message}
                                </span>
                            </motion.div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="h-8 border-t border-white/5 bg-[#08090E]/90 flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex items-center gap-6 text-[8px] font-mono text-slate-700">
                            {PHASES.map(p => {
                                const done = PHASE_ORDER.indexOf(job?.current_phase as Phase) > PHASE_ORDER.indexOf(p.id);
                                const active = job?.current_phase === p.id;
                                return (
                                    <div key={p.id} className={cn("flex items-center gap-1",
                                        active ? "text-sky-500" : done ? "text-emerald-600" : "text-slate-700"
                                    )}>
                                        {active && <Loader2 className="w-2 h-2 animate-spin" />}
                                        {done && <CheckCircle2 className="w-2 h-2" />}
                                        {!active && !done && <p.icon className="w-2 h-2" />}
                                        <span className="uppercase tracking-widest">{p.id.slice(0, 5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-mono">
                            <Activity className="w-2.5 h-2.5 text-sky-500" />
                            <span className="text-slate-700">{API_CONFIG.TOOLS_API_BASE}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
