"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal, Globe, Settings, Play, Pause, AlertTriangle, CheckCircle, XCircle, Clock, Wifi, WifiOff, FileText, Download, Bug } from "lucide-react";
import { useOffensiveWS } from "@/hooks/useOffensiveWS";
import { cn } from "@/lib/utils";

const WSTG_MODULES = [
  { id: 1, name: "Info Gathering", keywords: ["info", "gathering", "enumeration", "general"], color: "#06b6d4" },
  { id: 2, name: "Port Scan (Nmap)", keywords: ["nmap", "port", "scanning"], color: "#8b5cf6" },
  { id: 3, name: "Vulnerability (Nuclei)", keywords: ["nuclei", "vulnerability"], color: "#ef4444" },
  { id: 4, name: "VHost Fuzzing", keywords: ["vhost", "ffuf", "virtual host"], color: "#f97316" },
  { id: 5, name: "Directory Fuzzing", keywords: ["directory", "dirbust"], color: "#eab308" },
  { id: 6, name: "Spidering", keywords: ["spider", "crawl", "map"], color: "#10b981" },
  { id: 7, name: "Source Code Analysis", keywords: ["source", "html", "javascript", "js"], color: "#06b6d4" },
  { id: 8, name: "Injection Tests", keywords: ["sqli", "xss", "ssrf", "injection", "sqlmap"], color: "#ec4899" },
  { id: 9, name: "Advanced Tests", keywords: ["ssti", "xxe", "smuggl", "crlf", "cache"], color: "#a855f7" },
  { id: 10, name: "API Testing", keywords: ["api", "idor", "jwt", "rate limit", "mass assignment"], color: "#14b8a6" },
  { id: 11, name: "Brute Force", keywords: ["brute", "hydra", "enum", "password"], color: "#f59e0b" },
  { id: 12, name: "WordPress", keywords: ["wpscan", "wordpress", "wp"], color: "#2563eb" },
  { id: 13, name: "Active Directory", keywords: ["ad", "ldap", "kerberos", "active directory"], color: "#dc2626" },
];

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function WstgScannerPage() {
  const { isConnected, scanLog, startWstgScan } = useOffensiveWS({ autoConnect: true });
  const [targetUrl, setTargetUrl] = useState("");
  const [threads, setThreads] = useState("5");
  const [timeout, setTimeout_] = useState("10");
  const [delay, setDelay] = useState("0");
  const [insecure, setInsecure] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [activeModules, setActiveModules] = useState<number[]>([]);
  const [currentModule, setCurrentModule] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [findingsCount, setFindingsCount] = useState(0);
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

  /* Detect module from log message */
  const detectModule = useCallback((msg: string): number | null => {
    const lower = msg.toLowerCase();
    for (const mod of WSTG_MODULES) {
      if (mod.keywords.some(k => lower.includes(k))) return mod.id;
    }
    return null;
  }, []);

  /* Process WebSocket messages */
  useEffect(() => {
    if (!scanLog.length) return;
    scanLog.forEach((msg: any) => {
      if (msg.type === "wstg_log" && msg.message) {
        const level = msg.level || "info";
        setLogs(prev => [...prev, { time: now(), level, message: msg.message }].slice(-500));
        const modId = detectModule(msg.message);
        if (modId !== null) {
          setActiveModules(prev => prev.includes(modId) ? prev : [...prev, modId]);
          setCurrentModule(modId);
        }
        /* Count findings from keywords */
        if (msg.message.match(/vuln|finding|CVE-|critical|high.*risk|exploit/i)) {
          setFindingsCount(c => c + 1);
        }
      }
      if (msg.type === "wstg_progress") {
        setProgress(msg.progress || 0);
      }
      if (msg.type === "wstg_complete") {
        setIsRunning(false);
        setStatus("complete");
        setProgress(100);
        setLogs(prev => [...prev, { time: now(), level: "success", message: "Scan completed successfully" }]);
      }
      if (msg.type === "wstg_error") {
        setIsRunning(false);
        setStatus("error");
        setLogs(prev => [...prev, { time: now(), level: "error", message: msg.message || "Scan failed" }]);
      }
      if (msg.type === "wstg_start") {
        setLogs(prev => [...prev, { time: now(), level: "info", message: msg.message || "Scan started" }]);
      }
    });
  }, [scanLog, detectModule]);

  const handleStart = useCallback(() => {
    if (!targetUrl.trim()) return;
    if (!isConnected) {
      setLogs([{ time: now(), level: "warn", message: "Neural link offline — connecting..." }]);
    }
    setIsRunning(true);
    setStatus("running");
    setLogs(prev => prev.length > 0 && prev[0].level === "warn" ? prev : []);
    setLogs(prev => [...prev, { time: now(), level: "info", message: `Initiating OWASP WSTG Scan against ${targetUrl}` }]);
    setProgress(0);
    setActiveModules([]);
    setCurrentModule(null);
    setElapsed(0);
    setFindingsCount(0);
    startWstgScan(targetUrl, { threads: parseInt(threads) || 5, timeout: parseInt(timeout) || 10, delay: parseInt(delay) || 0, insecure });
  }, [targetUrl, threads, timeout, delay, insecure, startWstgScan, isConnected]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setLogs(prev => [...prev, { time: now(), level: "warn", message: "Scan aborted by operator" }]);
  }, []);

  const handleExport = useCallback(() => {
    const lines = [
      `╔══════════════════════════════════════════╗`,
      `║  OWASP WSTG SCAN REPORT                  ║`,
      `╚══════════════════════════════════════════╝`,
      ``,
      `Target:    ${targetUrl || "—"}`,
      `Status:    ${status.toUpperCase()}`,
      `Duration:  ${fmtTime(elapsed)}`,
      `Findings:  ${findingsCount}`,
      `Modules:   ${activeModules.length}/${WSTG_MODULES.length}`,
      `Timestamp: ${new Date().toISOString()}`,
      ``,
      `── Scan Log (${logs.length} entries) ──`,
      ...logs.map(l => `  [${l.time}] [${l.level.toUpperCase()}] ${l.message}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `wstg-${targetUrl.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [targetUrl, status, elapsed, findingsCount, activeModules.length, logs]);

  /* Keyboard shortcut: Ctrl+Enter / Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter" && targetUrl.trim() && !isRunning) handleStart();
      if (e.key === "Escape" && isRunning) handleStop();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [targetUrl, isRunning, handleStart, handleStop]);

  return (
    <div className="min-h-screen bg-[#06060a] text-white selection:bg-cyan-500/30">
      <header className="border-b border-cyan-500/10 bg-[#0a0a12]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-[0.2em] text-white/90 font-mono leading-none">OWASP WSTG SCANNER</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-cyan-500/50 font-mono tracking-[0.15em]">Web Security Testing Guide</span>
                <span className="text-[9px] text-white/15 font-mono">|</span>
                <span className="text-[9px] text-purple-400/40 font-mono tracking-wider">v1.4.0</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isRunning && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-cyan-500/20 bg-cyan-500/5 text-[11px] font-mono text-cyan-400 tabular-nums">
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
                disabled={!targetUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <Play className="w-3 h-3" /> Start Scan
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Target URL + Options */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-cyan-500/50 transition-colors z-10" />
            <input
              type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && targetUrl.trim()) handleStart(); }}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.025] border border-white/[0.06] text-[13px] font-mono text-white/90 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/[0.025] border border-white/[0.06] rounded-lg p-2">
            <Settings className="w-3.5 h-3.5 text-white/25 shrink-0" />
            <input type="number" value={threads} onChange={e => setThreads(e.target.value)} placeholder="Thr" className="w-12 bg-transparent text-[11px] font-mono text-white/60 placeholder:text-white/20 focus:outline-none border-r border-white/[0.06] pr-2" title="Threads" />
            <input type="number" value={timeout} onChange={e => setTimeout_(e.target.value)} placeholder="To" className="w-12 bg-transparent text-[11px] font-mono text-white/60 placeholder:text-white/20 focus:outline-none border-r border-white/[0.06] pr-2" title="Timeout (s)" />
            <input type="number" value={delay} onChange={e => setDelay(e.target.value)} placeholder="Del" className="w-12 bg-transparent text-[11px] font-mono text-white/60 placeholder:text-white/20 focus:outline-none pr-2" title="Delay (s)" />
            <label className="flex items-center gap-1 text-[10px] font-mono text-white/30 cursor-pointer select-none px-1">
              <input type="checkbox" checked={insecure} onChange={e => setInsecure(e.target.checked)} className="accent-cyan-500" />
              NoTLS
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2.5 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[11px] font-mono text-cyan-400 tabular-nums w-10 text-right shrink-0">{progress}%</span>
                <span className="text-[10px] font-mono text-white/30 shrink-0">
                  {status === "running" ? "SCANNING" : status === "complete" ? "DONE" : "ERROR"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WSTG Modules + Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* WSTG Modules */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-[0.12em]">WSTG Modules</span>
              <span className="text-[9px] font-mono text-white/20 ml-auto">{activeModules.length}/{WSTG_MODULES.length}</span>
            </div>
            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
              {WSTG_MODULES.map((mod) => {
                const isActive = activeModules.includes(mod.id);
                const isCurrent = currentModule === mod.id;
                return (
                  <div key={mod.id} className={cn("flex items-center gap-2 text-[11px] font-mono px-1 py-0.5 rounded transition-all", isCurrent && "bg-white/[0.03]")}>
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center transition-all shrink-0", isActive ? "bg-green-500/20" : isCurrent ? "bg-cyan-500/20" : "bg-white/[0.03]")}>
                      {isActive ? <CheckCircle className="w-3 h-3 text-green-400" /> : isCurrent ? <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> : <span className="text-[8px] text-white/15">{mod.id}</span>}
                    </div>
                    <span className={cn(isActive ? "text-green-400/70" : isCurrent ? "text-cyan-300" : "text-white/40")}>{mod.name}</span>
                  </div>
                );
              })}
            </div>
            {status === "complete" && findingsCount > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-mono text-red-400/70">{findingsCount} potential findings</span>
              </div>
            )}
            {status === "complete" && findingsCount === 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-[11px] font-mono text-green-400/70">No findings detected</span>
              </div>
            )}
            {status === "error" && (
              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-mono text-red-400/70">Scan failed</span>
              </div>
            )}
          </div>

          {/* Live Terminal */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/15 to-transparent" />
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-[0.12em]">Live Output</span>
                {isRunning && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
              </div>
              <div className="flex items-center gap-3">
                {logs.length > 0 && (
                  <>
                    <button onClick={handleExport} className="text-[10px] font-mono text-white/20 hover:text-cyan-400/60 transition-colors flex items-center gap-1">
                      <Download className="w-3 h-3" /> export
                    </button>
                    <button onClick={() => setLogs([])} className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors">clear</button>
                  </>
                )}
              </div>
            </div>
            <div
              ref={logRef}
              className="flex-1 h-[340px] overflow-y-auto bg-[#08080c] rounded-lg p-3 border border-white/[0.04] font-mono"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}
            >
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/15 text-xs">
                  Enter a URL and click Start Scan
                </div>
              ) : (
                logs.slice(-200).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed py-[1px]">
                    <span className="text-white/15 shrink-0 w-[64px]">{log.time}</span>
                    <span className={cn(
                      "px-1 py-px rounded text-[9px] font-bold uppercase shrink-0 leading-tight",
                      log.level === "error" ? "bg-red-500/20 text-red-300" : log.level === "warn" ? "bg-yellow-500/20 text-yellow-300" : log.level === "success" ? "bg-green-500/20 text-green-300" : "bg-cyan-500/20 text-cyan-300"
                    )}>{log.level === "success" ? "OK" : log.level.slice(0, 4)}</span>
                    <span className={cn("flex-1", log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-yellow-400" : log.level === "success" ? "text-green-400" : "text-cyan-400")}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
