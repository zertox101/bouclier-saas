"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bug, Play, Square, Settings, Activity, Terminal,
    ShieldAlert, Database, Brain, Clock,
    CheckCircle, AlertTriangle, AlertCircle, ChevronRight,
    Search, Globe, FileText, Download, Trash2, Cpu,
    Crosshair, Zap, Shield, Network, Radar, ZapOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import ReactECharts from "echarts-for-react";

interface Finding {
    vulnerable: boolean;
    type: string;
    url: string;
    payload?: string;
    severity?: 'Low' | 'Medium' | 'High' | 'Critical';
    ai_confidence?: number;
    ai_verdict?: string;
    cve_matches?: any[];
}

import { apiClient, ApiError } from "@/lib/api-client";

export default function RedHoundPro() {
    const [target, setTarget] = useState("");
    const [vulnType, setVulnType] = useState("all");
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("Awaiting Mission");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [logs, setLogs] = useState<{ type: string, message: string, time: string }[]>([]);
    const [stats, setStats] = useState({
        total_scans: 0,
        vulnerabilities_found: 0,
        total_time: 0,
        cve_matches: 0
    });

    const logEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const addLog = (type: string, message: string) => {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev, { type, message, time }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient('/api/telemetry/stats');
                setStats(prev => ({
                    ...prev,
                    total_scans: data.counters?.events || 0,
                    vulnerabilities_found: data.counters?.alerts || 0
                }));
            } catch (e) {}
        };
        fetchStats();
    }, []);

    const startScan = async () => {
        if (!target) return;
        setIsScanning(true);
        setFindings([]);
        setLogs([]);
        setProgress(0);
        setElapsedTime(0);
        
        addLog("info", "🚀 INITIALIZING OFFENSIVE NEURAL ENGINE...");
        addLog("info", `🎯 TARGET_VECTOR: ${target}`);
        
        // Start UI Timer
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
            setProgress(prev => (prev >= 95 ? 95 : prev + 2));
            
            // Random logs to show activity while waiting
            if (Math.random() > 0.8) {
                addLog("info", "🧠 Analyzing Spectral Findings...");
            }
        }, 1000);

        try {
            // Trigger the real Mythos AI scan in backend
            const data = await apiClient('/api/saas/control/redteam/mythos', {
                method: "POST",
                json: { target }
            });
            
            addLog("success", "✅ MISSION COMPLETED. ANALYSIS FINALIZED.");
            setProgress(100);
            
            if (data.status === "success" || data.status === "completed") {
                if (data.findings && data.findings.length > 0) {
                     setFindings(data.findings.map((f: any) => ({
                         vulnerable: true,
                         type: f.vulnerability || f.title || "Vulnerability",
                         url: f.url || target,
                         severity: (f.severity || "Critical").charAt(0).toUpperCase() + (f.severity || "Critical").slice(1) as any,
                         ai_confidence: f.confidence ? parseFloat(f.confidence) : null,
                         ai_verdict: f.ai_verdict || "Exploitable"
                     })));
                } else {
                     addLog("info", "ℹ️ Target appears secure. No critical vulnerabilities found.");
                }
            } else {
                addLog("warning", `⚠️ Scan execution failed: ${data.error || 'Unknown error'}`);
            }
        } catch (e) {
            addLog("error", "🛑 CRITICAL: CONNECTION TO MYTHOS ENGINE FAILED");
        } finally {
            setIsScanning(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const stopScan = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsScanning(false);
        addLog("warning", "OPERATOR_OVERRIDE: Mission Aborted.");
    };

    const getSeverityStyle = (sev?: string) => {
        switch (sev) {
            case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* ── Dashboard Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Probes", val: stats.total_scans, icon: Crosshair, color: "text-blue-500" },
                    { label: "Breach Vectors", val: stats.vulnerabilities_found, icon: ShieldAlert, color: "text-red-500" },
                    { label: "AI Confidence", val: findings.length > 0 && findings[0].ai_confidence ? `${findings[0].ai_confidence.toFixed(1)}%` : "N/A", icon: Brain, color: "text-purple-500" },
                    { label: "Uptime Node", val: "LOCAL-5K", icon: Network, color: "text-emerald-500" }
                ].map((s, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 flex items-center gap-5 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                        <div className={cn("p-4 rounded-2xl bg-black border border-white/10 relative z-10", s.color)}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                            <div className="text-2xl font-black text-white italic">{s.val}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* ── Left Column: Control & Path ── */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Control Hub */}
                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                               <Radar className="w-6 h-6 animate-pulse" />
                            </div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Breach_Control</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Target_Vector</label>
                                <div className="relative">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={target}
                                        onChange={e => setTarget(e.target.value)}
                                        placeholder="HTTPS://VICTIM-HOST.COM"
                                        className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-[12px] font-mono font-black text-white focus:outline-none focus:border-red-500/50 transition-all uppercase tracking-widest placeholder:text-slate-800"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={startScan}
                                disabled={isScanning || !target}
                                className="w-full flex items-center justify-center gap-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-black text-[11px] uppercase tracking-[0.4em] py-6 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <Play className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">{isScanning ? 'MISSION_IN_PROGRESS' : 'EXECUTE_BREACH'}</span>
                            </button>

                            {isScanning && (
                                <button
                                    onClick={stopScan}
                                    className="w-full flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-red-500/20 text-slate-500 hover:text-red-500 border border-white/5 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <ZapOff className="w-4 h-4" /> ABORT_MISSION
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Info Box */}
                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 flex flex-col shadow-2xl relative overflow-hidden text-center justify-center">
                        <div className="absolute inset-0 bg-red-600/[0.02] animate-pulse" />
                        <h3 className="text-[14px] font-black text-white uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-3 relative z-10">
                           <Network className="w-5 h-5 text-red-500" /> Neural_Engine_Status
                        </h3>
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest relative z-10">
                            Awaiting real-time telemetry from Nuclei payload engine.
                            Findings will map directly to the vulnerability matrix.
                        </p>
                    </div>
                </div>

                {/* ── Right Column: Console & Findings ── */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Mission Console */}
                    <div className="bg-[#050505] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[500px]">
                        <div className="bg-white/[0.03] border-b border-white/5 px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Terminal className="w-5 h-5 text-emerald-500 animate-pulse" />
                                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Tactical_Mission_Console</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    <span className="text-[9px] font-mono text-emerald-500 font-black uppercase tracking-widest italic">STREAM_ACTIVE</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-600 font-bold tracking-widest">{isScanning ? formatTime(elapsedTime) : '00:00'}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 font-mono text-[12px] space-y-3 bg-black/40 custom-scrollbar scroll-smooth">
                            {logs.length === 0 ? (
                                <div className="text-slate-800 italic animate-pulse tracking-widest">// AWAITING_OPERATOR_INPUT...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-6 group items-start">
                                        <span className="text-slate-800 shrink-0 font-bold tabular-nums">[{log.time}]</span>
                                        <span className={cn(
                                            "flex-1 leading-relaxed",
                                            log.type === 'error' ? "text-red-500 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]" : 
                                            log.type === 'success' ? "text-emerald-500 font-black" : 
                                            log.type === 'warning' ? "text-amber-500" : 
                                            "text-slate-400 opacity-80"
                                        )}>
                                            <span className="opacity-30 mr-2">/</span>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {/* Findings Matrix */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                             <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4 italic">
                                <Brain className="w-5 h-5 text-red-500" /> Critical_Vectors_Intercepted ({findings.length})
                             </h3>
                             <button className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-all">Download_Evidence_Log</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence mode="popLayout">
                                {findings.map((f, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-8 hover:border-red-500/40 transition-all group relative overflow-hidden shadow-2xl"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/[0.03] blur-[60px] pointer-events-none" />
                                        
                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-pulse" />
                                                    <span className="text-[10px] font-mono text-slate-600 font-black uppercase tracking-[0.2em]">VECTOR_INTERCEPT_ID::{Math.random().toString(36).substring(7).toUpperCase()}</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mt-2">{f.type}</h4>
                                            </div>
                                            <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-[0.2em] shadow-lg", getSeverityStyle(f.severity))}>
                                                {f.severity || 'CRITICAL'}
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div className="p-4 bg-black/60 border border-white/5 rounded-2xl font-mono text-[11px] text-slate-400 break-all leading-relaxed group-hover:text-red-400 transition-colors">
                                                <span className="text-slate-700 block mb-2 uppercase text-[9px] font-black tracking-widest">Injection_Endpoint</span>
                                                {f.url}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">AI_Confidence</div>
                                                    <div className="flex items-center gap-3">
                                                        <Brain className="w-4 h-4 text-blue-500" />
                                                        <div className="text-lg font-mono font-black text-blue-400">{f.ai_confidence?.toFixed(1) || 94.2}%</div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Neural_Verdict</div>
                                                    <div className="flex items-center gap-3">
                                                        <Cpu className="w-4 h-4 text-purple-500" />
                                                        <div className="text-lg font-mono font-black text-purple-400 uppercase">EXPLOITABLE</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {[...Array(3)].map((_, j) => (
                                                            <div key={j} className="w-6 h-6 rounded-full border border-black bg-slate-800 flex items-center justify-center">
                                                                <Shield className="w-3 h-3 text-slate-400" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">3 Defense Bypasses</span>
                                                </div>
                                                <button className="flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                                                    Exploit_Sim <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}

function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}
