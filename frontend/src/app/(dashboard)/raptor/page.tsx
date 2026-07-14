"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal, Zap, Play, Pause, AlertTriangle, CheckCircle, XCircle, Clock, Wifi, WifiOff, FileText, Download, Bug, Target, GitBranch, Crosshair, Scan, Code, Siren } from "lucide-react";
import { useOffensiveWS } from "@/hooks/useOffensiveWS";
import { cn } from "@/lib/utils";

const RAPTOR_MODES = [
  { id: "scan", label: "Static Analysis", icon: Scan, desc: "Semgrep + CodeQL scan", color: "#8b5cf6" },
  { id: "agentic", label: "Full Pipeline", icon: GitBranch, desc: "Scan, validate, exploit, patch", color: "#ef4444" },
  { id: "sca", label: "SCA Audit", icon: Bug, desc: "Dependency + supply chain", color: "#f97316" },
  { id: "understand", label: "Understand", icon: Crosshair, desc: "Map attack surface", color: "#06b6d4" },
  { id: "validate", label: "Validate", icon: CheckCircle, desc: "Exploitability validation", color: "#10b981" },
];

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function RaptorPage() {
  const { isConnected, scanLog, startRaptorScan } = useOffensiveWS({ autoConnect: true });
  const [target, setTarget] = useState("");
  const [mode, setMode] = useState("scan");
  const [threatModel, setThreatModel] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [findings, setFindings] = useState<string[]>([]);
  const [exploits, setExploits] = useState<string[]>([]);
  const [patches, setPatches] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logRef.current) {
      requestAnimationFrame(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      });
    }
  }, [logs]);

  useEffect(() => {
    if (!isRunning) {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      return;
    }
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (!scanLog.length) return;
    scanLog.forEach((msg: any) => {
      if (msg.type === "raptor_log" && msg.message) {
        const level = msg.level || "info";
        const message = msg.message;
        setLogs(prev => [...prev, { time: now(), level, message }].slice(-500));
        if (message.match(/finding|CWE-|vulnerability|cve|critical/i) && !message.startsWith("   ")) {
          setFindings(prev => prev.includes(message) ? prev : [...prev, message]);
        }
        if (message.match(/PoC|exploit|curl|sqlmap/i)) {
          setExploits(prev => prev.includes(message) ? prev : [...prev, message]);
        }
        if (message.match(/patch|fixed|remediation|parameterized query/i)) {
          setPatches(prev => prev.includes(message) ? prev : [...prev, message]);
        }
      }
      if (msg.type === "raptor_progress") {
        setProgress(msg.progress || 0);
      }
      if (msg.type === "raptor_complete") {
        setIsRunning(false);
        setStatus("complete");
        setProgress(100);
        setLogs(prev => [...prev, { time: now(), level: "success", message: "RAPTOR mission complete" }]);
      }
      if (msg.type === "raptor_error") {
        setIsRunning(false);
        setStatus("error");
        setLogs(prev => [...prev, { time: now(), level: "error", message: msg.message || "RAPTOR scan failed" }]);
      }
      if (msg.type === "raptor_start") {
        setLogs(prev => [...prev, { time: now(), level: "info", message: msg.message || "RAPTOR analysis started" }]);
      }
    });
  }, [scanLog]);

  const handleStart = useCallback(() => {
    if (!target.trim()) return;
    if (!isConnected) {
      setLogs([{ time: now(), level: "warn", message: "Neural link offline — connecting..." }]);
    }
    setIsRunning(true);
    setStatus("running");
    setLogs([]);
    setFindings([]);
    setExploits([]);
    setPatches([]);
    setProgress(0);
    setElapsed(0);
    setLogs(prev => [...prev, { time: now(), level: "info", message: `RAPTOR ${mode} against ${target}` }]);
    startRaptorScan(target, mode);
  }, [target, mode, startRaptorScan, isConnected]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setLogs(prev => [...prev, { time: now(), level: "warn", message: "RAPTOR analysis aborted" }]);
  }, []);

  const handleExport = useCallback(() => {
    const lines = [
      `╔══════════════════════════════════════════════╗`,
      `║  RAPTOR — SECURITY RESEARCH REPORT            ║`,
      `╚══════════════════════════════════════════════╝`,
      ``,
      `Target:    ${target || "—"}`,
      `Mode:      ${mode.toUpperCase()}`,
      `Status:    ${status.toUpperCase()}`,
      `Duration:  ${fmtTime(elapsed)}`,
      `Findings:  ${findings.length}`,
      `Exploits:  ${exploits.length}`,
      `Patches:   ${patches.length}`,
      `Timestamp: ${new Date().toISOString()}`,
      ``,
      `── Findings ──`,
      ...findings.map(f => `  • ${f}`),
      ``,
      `── Exploit PoCs ──`,
      ...exploits.map(e => `  • ${e}`),
      ``,
      `── Patches ──`,
      ...patches.map(p => `  • ${p}`),
      ``,
      `── Scan Log (${logs.length} entries) ──`,
      ...logs.map(l => `  [${l.time}] [${l.level.toUpperCase()}] ${l.message}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `raptor-${target.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [target, mode, status, elapsed, findings, exploits, patches, logs]);

  /* Keyboard shortcut: Ctrl+Enter / Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter" && target.trim() && !isRunning) handleStart();
      if (e.key === "Escape" && isRunning) handleStop();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [target, isRunning, handleStart, handleStop]);

  return (
    <div className="min-h-screen bg-[#06060a] text-white selection:bg-amber-500/30">
      <header className="border-b border-amber-500/10 bg-[#0a0a12]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-[0.2em] text-white/90 font-mono leading-none">RAPTOR AI</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-amber-500/50 font-mono tracking-[0.15em]">Autonomous Security Research</span>
                <span className="text-[9px] text-white/15 font-mono">|</span>
                <span className="text-[9px] text-orange-400/40 font-mono tracking-wider">v2.1.0</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isRunning && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-amber-500/20 bg-amber-500/5 text-[11px] font-mono text-amber-400 tabular-nums">
                <Clock className="w-3 h-3" /> {fmtTime(elapsed)}
              </div>
            )}
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono border", isConnected ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isConnected ? "NEURAL_LINK" : "OFFLINE"}</span>
            </div>
            {isRunning ? (
              <button onClick={handleStop} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/25 text-[11px] font-mono font-bold hover:bg-red-500/25 transition-all">
                <Pause className="w-3 h-3" /> ABORT
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                disabled={!target.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold hover:from-amber-500/30 hover:to-orange-500/30 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <Play className="w-3 h-3" /> Launch
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Target + Mode Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-amber-500/50 transition-colors z-10" />
            <input
              type="text" value={target} onChange={e => setTarget(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && target.trim()) handleStart(); }}
              placeholder="/path/to/code or https://github.com/user/repo or example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.025] border border-white/[0.06] text-[13px] font-mono text-white/90 placeholder:text-white/15 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/15 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {RAPTOR_MODES.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-all", mode === m.id ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-white/[0.015] text-white/30 border-white/[0.06] hover:border-white/20")}
                >
                  <Icon className="w-3 h-3" />
                  <span className="sm:inline">{m.label}</span>
                </button>
              );
            })}
            <label className="flex items-center gap-1 text-[10px] font-mono text-white/30 cursor-pointer select-none px-2 py-1.5 rounded-lg bg-white/[0.015] border border-white/[0.06]">
              <input type="checkbox" checked={threatModel} onChange={e => setThreatModel(e.target.checked)} className="accent-amber-500" />
              Threat Model
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2.5 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[11px] font-mono text-amber-400 tabular-nums w-10 text-right shrink-0">{progress}%</span>
                <span className="text-[10px] font-mono text-white/30 shrink-0">
                  {status === "running" ? "ANALYZING" : status === "complete" ? "DONE" : "ERROR"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Panels */}
        {(status === "complete" || (isRunning && (findings.length > 0 || exploits.length > 0 || patches.length > 0))) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-[0.12em]">Findings</span>
                <span className="text-[10px] font-mono text-purple-400 ml-auto">{findings.length}</span>
              </div>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
                {findings.length === 0 ? (
                  <span className="text-[10px] font-mono text-white/20">Awaiting analysis...</span>
                ) : findings.slice(-20).map((f, i) => (
                  <div key={i} className="text-[10px] font-mono text-purple-300/70 truncate">• {f}</div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              <div className="flex items-center gap-2 mb-2">
                <Siren className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-[0.12em]">Exploits</span>
                <span className="text-[10px] font-mono text-red-400 ml-auto">{exploits.length}</span>
              </div>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
                {exploits.length === 0 ? (
                  <span className="text-[10px] font-mono text-white/20">Awaiting exploits...</span>
                ) : exploits.slice(-20).map((e, i) => (
                  <div key={i} className="text-[10px] font-mono text-red-300/70 truncate">• {e}</div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-[0.12em]">Patches</span>
                <span className="text-[10px] font-mono text-green-400 ml-auto">{patches.length}</span>
              </div>
              <div className="max-h-[120px] overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
                {patches.length === 0 ? (
                  <span className="text-[10px] font-mono text-white/20">Awaiting patches...</span>
                ) : patches.slice(-20).map((p, i) => (
                  <div key={i} className="text-[10px] font-mono text-green-300/70 truncate">• {p}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Terminal */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-[0.12em]">RAPTOR Terminal</span>
              {isRunning && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <div className="flex items-center gap-3">
              {logs.length > 0 && (
                <>
                  <button onClick={handleExport} className="text-[10px] font-mono text-white/20 hover:text-amber-400/60 transition-colors flex items-center gap-1">
                    <Download className="w-3 h-3" /> export
                  </button>
                  <button onClick={() => setLogs([])} className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors">clear</button>
                </>
              )}
            </div>
          </div>
          <div
            ref={logRef}
            className="flex-1 h-[400px] overflow-y-auto bg-[#08080c] rounded-lg p-3 border border-white/[0.04] font-mono"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/15 text-xs">
                Enter a target and click Launch to start RAPTOR analysis
              </div>
            ) : (
              logs.slice(-300).map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed py-[1px]">
                  <span className="text-white/15 shrink-0 w-[64px]">{log.time}</span>
                  <span className={cn(
                    "px-1 py-px rounded text-[9px] font-bold uppercase shrink-0 leading-tight",
                    log.level === "error" ? "bg-red-500/20 text-red-300" : log.level === "warn" ? "bg-yellow-500/20 text-yellow-300" : log.level === "success" ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
                  )}>{log.level === "success" ? "OK" : log.level.slice(0, 4)}</span>
                  <span className={cn("flex-1", log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-yellow-400" : log.level === "success" ? "text-green-400" : "text-amber-400")}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
