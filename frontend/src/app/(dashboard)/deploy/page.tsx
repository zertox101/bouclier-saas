"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, StopCircle, Loader2, Terminal as TerminalIcon, AlertTriangle, Shield, Zap, CheckCircle, Target, Brain, Activity } from "lucide-react";
import { API_CONFIG } from "@/lib/api-config";

type LogEntry = { timestamp: number; phase: string; level: string; message: string };

export default function AutonomousPlannerPage() {
  const [target, setTarget] = useState("");
  const [mode, setMode] = useState<"standard" | "aggressive">("standard");
  const [running, setRunning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState("");
  const [risk, setRisk] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!running || !jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_CONFIG.BACKEND_API}/agent/planner/jobs/${jobId}`, {
          headers: { "X-Api-Key": API_CONFIG.TOOLS_API_KEY },
        });
        if (!res.ok) { clearInterval(interval); setRunning(false); return; }
        const data = await res.json();
        setLogs(data.logs || []);
        setCurrentPhase(data.current_phase || "");
        setRisk(data.risk);
        setStatus(data.status || "");
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          setRunning(false);
        }
      } catch { clearInterval(interval); setRunning(false); }
    }, 1500);
    return () => clearInterval(interval);
  }, [running, jobId]);

  const startPlanner = async () => {
    if (!target || target.length < 3 || running) return;
    setRunning(true);
    setLogs([]);
    setRisk(null);
    setCurrentPhase("INIT");
    setStatus("running");
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_API}/agent/planner/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": API_CONFIG.TOOLS_API_KEY },
        body: JSON.stringify({ target, mode }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to start");
      const data = await res.json();
      setJobId(data.job_id);
    } catch (e: any) {
      setRunning(false);
      setLogs(prev => [...prev, { timestamp: Date.now() / 1000, phase: "ERROR", level: "error", message: e.message }]);
    }
  };

  const phaseColors: Record<string, string> = {
    INIT: "text-slate-500", OBSERVE: "text-blue-400", PLAN: "text-yellow-400",
    ACT: "text-cyan-400", VERIFY: "text-purple-400", REPORT: "text-emerald-400",
    ERROR: "text-red-400",
  };
  const levelIcons: Record<string, string> = {
    info: "●", success: "◆", warning: "▲", error: "✖",
  };

  return (
    <div className="p-6 min-h-screen bg-[#0a0a0f]">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Autonomous Planner</h1>
        <span className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest">Observe → Plan → Act → Verify → Report</span>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => e.key === "Enter" && startPlanner()}
          placeholder="Target IP or hostname..."
          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500/50"
        />
        <select
          value={mode}
          onChange={e => setMode(e.target.value as any)}
          className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none"
        >
          <option value="standard">Standard</option>
          <option value="aggressive">Aggressive</option>
        </select>
        <button
          onClick={startPlanner}
          disabled={running || !target}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {running ? `Running: ${currentPhase}` : "Deploy Agent"}
        </button>
      </div>

      {/* Status bar */}
      {running || status === "completed" ? (
        <div className="flex gap-4 mb-4 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <Target className="w-3 h-3" /> Phase: <span className={`font-bold ${phaseColors[currentPhase] || "text-white"}`}>{currentPhase}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Activity className="w-3 h-3" /> Status: <span className="font-bold text-white">{status}</span>
          </span>
          {risk && (
            <span className="flex items-center gap-1">
              <AlertTriangle className={`w-3 h-3 ${risk === "CRITICAL" ? "text-red-400" : risk === "HIGH" ? "text-orange-400" : "text-yellow-400"}`} />
              Risk: <span className={`font-bold ${risk === "CRITICAL" ? "text-red-400" : risk === "HIGH" ? "text-orange-400" : "text-yellow-400"}`}>{risk}</span>
            </span>
          )}
        </div>
      ) : null}

      {/* Terminal */}
      <div
        ref={logRef}
        className="rounded-2xl border border-white/5 bg-black/80 backdrop-blur-sm p-4 font-mono text-[12px] leading-relaxed overflow-y-auto"
        style={{ height: "calc(100vh - 240px)" }}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-700">
            <div className="text-center space-y-2">
              <TerminalIcon className="w-8 h-8 mx-auto" />
              <p>Enter a target and deploy the autonomous agent</p>
              <p className="text-[10px] text-slate-800">The AI will observe, plan, act, verify, and report using real Kali tools</p>
            </div>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-600 shrink-0 w-16">{new Date(log.timestamp * 1000).toISOString().slice(11, 19)}</span>
              <span className={`shrink-0 w-6 ${phaseColors[log.phase] || "text-slate-500"}`}>{log.phase}</span>
              <span className={`shrink-0 w-4 ${
                log.level === "error" ? "text-red-400" :
                log.level === "warning" ? "text-yellow-400" :
                log.level === "success" ? "text-emerald-400" : "text-slate-400"
              }`}>{levelIcons[log.level] || "●"}</span>
              <span className={`${
                log.level === "error" ? "text-red-300" :
                log.level === "warning" ? "text-yellow-300" :
                log.level === "success" ? "text-emerald-300" : "text-slate-300"
              }`}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
