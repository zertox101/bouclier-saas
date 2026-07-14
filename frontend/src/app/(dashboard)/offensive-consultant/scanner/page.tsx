"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Target, Radio, Activity, Server, Download, Wifi, Shield, Play, Square, Clock, Globe, Brain, AlertTriangle } from "lucide-react";
import { useOffensiveWS } from "@/hooks/useOffensiveWS";

export default function ScannerPage() {
  const { isConnected, scanLog, startScan, startMythosAnalysis, clearScanLog, connect } = useOffensiveWS({ autoConnect: true });
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState<"nmap" | "masscan">("nmap");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [scanLog]);

  useEffect(() => {
    if (scanLog.length === 0) return;
    const last = scanLog[scanLog.length - 1];
    if (!last) return;
    if (last.type === "scan_complete") {
      setScanning(false);
      setProgress(100);
      setResult(last);
    } else if (last.type === "scan_progress") {
      setProgress(last.progress);
    } else if (last.type === "scan_error") {
      setScanning(false);
    } else if (last.type === "mythos_finding") {
      setMythosFindings((prev) => [...prev, last.finding]);
    } else if (last.type === "mythos_complete") {
      setMythosAnalyzing(false);
    } else if (last.type === "mythos_error") {
      setMythosAnalyzing(false);
    }
  }, [scanLog, scanning]);

  const [mythosAnalyzing, setMythosAnalyzing] = useState(false);
  const [mythosFindings, setMythosFindings] = useState<any[]>([]);

  const handleScan = () => {
    if (!target.trim()) return;
    setScanning(true);
    setProgress(0);
    setResult(null);
    setMythosFindings([]);
    clearScanLog();
    if (!isConnected) connect();
    setTimeout(() => startScan(target.trim(), scanType), 300);
  };

  const handleMythosAnalysis = () => {
    if (!target.trim()) return;
    setMythosAnalyzing(true);
    setMythosFindings([]);
    clearScanLog();
    if (!isConnected) connect();
    setTimeout(() => startMythosAnalysis(target.trim()), 300);
  };

  const formatTime = () => new Date().toLocaleTimeString();

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Radio className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Network Scanner</h1>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 uppercase">Mythos Ready</span>
        <span className={`ml-auto flex items-center gap-1.5 text-xs ${isConnected ? "text-green-400" : "text-slate-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400" : "bg-slate-500"}`} />
          {isConnected ? "WS Connected" : "WS Disconnected"}
        </span>
      </div>

      {/* Input Controls */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">Target</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Enter IP, domain, or CIDR (e.g. 10.0.0.0/24)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 block">Tool</label>
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button onClick={() => setScanType("nmap")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scanType === "nmap" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"}`}>
                Nmap
              </button>
              <button onClick={() => setScanType("masscan")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scanType === "masscan" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"}`}>
                Masscan
              </button>
            </div>
          </div>
          <button onClick={handleScan} disabled={scanning || !target.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all">
            {scanning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {scanning ? "Scanning..." : "Scan"}
          </button>
        </div>

        {progress > 0 && scanning && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Scan Progress</span>
              <span className="text-cyan-400 font-mono">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" />
            </div>
          </div>
        )}
      </div>

      {/* Terminal Output */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-white">Scan Output</span>
              <span className="text-[9px] text-slate-500 ml-auto">{scanLog.length} lines</span>
              {scanLog.length > 0 && (
                <button onClick={clearScanLog} className="text-[9px] text-slate-500 hover:text-white">Clear</button>
              )}
            </div>
            <div ref={terminalRef} className="h-[400px] overflow-y-auto p-4 font-mono text-xs leading-relaxed bg-black/40">
              {scanLog.length === 0 && !scanning && (
                <div className="text-slate-600 text-center py-16">
                  <Terminal className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>Enter a target and click Scan to begin</p>
                  <p className="text-[10px] mt-1">Results will stream here in real-time</p>
                </div>
              )}
              {scanLog.map((msg, i) => {
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : formatTime();
                if (msg.type === "scan_start") {
                  return <div key={i} className="text-cyan-400 mb-1">[{time}] 🚀 Starting {msg.tool} scan on {msg.target}...</div>;
                }
                if (msg.type === "scan_progress") {
                  return <div key={i} className="text-slate-400 mb-0.5">[{time}] [{">".repeat(Math.floor(msg.progress / 10))}{".".repeat(10 - Math.floor(msg.progress / 10))}] {msg.phase} ({msg.progress}%)</div>;
                }
                if (msg.type === "scan_log") {
                  return <div key={i} className="text-green-400/70 mb-0.5">[{time}] {msg.message}</div>;
                }
                if (msg.type === "scan_result") {
                  return (
                    <div key={i} className="text-yellow-300 mb-1 mt-2">
                      [{time}] ── Scan Results ──{">"}
                      <br /> Open ports: {msg.open_ports} | Filtered: {msg.filtered_ports}
                      {msg.ports?.map((p: any, j: number) => (
                        <span key={j}><br />&nbsp;&nbsp;Port {p.port}/{p.service} → {p.state} {p.version ? `(${p.version})` : ""}</span>
                      ))}
                    </div>
                  );
                }
                if (msg.type === "scan_analysis") {
                  return <div key={i} className="text-purple-300 mb-1">[{time}] 📊 Analysis: {JSON.stringify(msg.analysis, null, 2).slice(0, 200)}</div>;
                }
                if (msg.type === "scan_complete") {
                  const ports = msg.total_ports || msg.ports?.length || 0;
                  const duration = msg.duration_seconds ? msg.duration_seconds.toFixed(1) : "?";
                  const jobInfo = msg.job_id ? ` (job: ${msg.job_id.slice(0, 8)})` : "";
                  return <div key={i} className="text-green-400 font-bold mt-2">[{time}] ✅ Scan Complete — {ports} ports found in {duration}s{jobInfo}</div>;
                }
                if (msg.type === "scan_error") {
                  return <div key={i} className="text-red-400 mb-1">[{time}] ❌ {msg.message}</div>;
                }
                if (msg.type === "mythos_start") {
                  return <div key={i} className="text-emerald-400 font-bold mb-1">[{time}] 🧠 Mythos Analysis started for {msg.target}...</div>;
                }
                if (msg.type === "mythos_log") {
                  return <div key={i} className="text-emerald-400/70 mb-0.5">[{time}] {msg.message}</div>;
                }
                if (msg.type === "mythos_progress") {
                  return <div key={i} className="text-purple-400 mb-0.5">[{time}] Phase: {msg.phase}</div>;
                }
                if (msg.type === "mythos_finding") {
                  const f = msg.finding;
                  const sevColors: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-blue-400" };
                  return <div key={i} className={`${sevColors[f?.severity] || "text-slate-400"} mb-1`}>
                    [{time}] [{f?.phase_name}] {f?.name} ({f?.severity})
                  </div>;
                }
                if (msg.type === "mythos_complete") {
                  return <div key={i} className="text-emerald-400 font-bold mt-2">[{time}] ✅ Mythos Analysis Complete — {msg.total_findings} findings</div>;
                }
                if (msg.type === "mythos_error") {
                  return <div key={i} className="text-red-400 mb-1">[{time}] ❌ {msg.message}</div>;
                }
                return <div key={i} className="text-slate-500">[{time}] {JSON.stringify(msg).slice(0, 100)}</div>;
              })}
              {scanning && <div className="text-cyan-400/50 animate-pulse mt-1">[{formatTime()}] ▊</div>}
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Scan Info
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target</span>
                <span className="text-white font-mono">{target || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tool</span>
                <span className="text-white">{scanType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={scanning ? "text-cyan-400" : result ? "text-green-400" : "text-slate-500"}>
                  {scanning ? "Running" : result ? "Complete" : "Idle"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WS Status</span>
                <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h2 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
                <Server className="w-3.5 h-3.5 text-green-400" /> Results Summary
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Ports</span>
                  <span className="text-white font-bold">{result.total_ports || result.ports?.length || result.open_ports || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{result.duration_seconds?.toFixed(1) || "?"}s</span>
                </div>
                {result.job_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Job ID</span>
                    <span className="text-white font-mono text-[9px]">{result.job_id.slice(0, 8)}</span>
                  </div>
                )}
              </div>
              <button onClick={handleMythosAnalysis} disabled={mythosAnalyzing}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:bg-slate-800 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-medium transition-all">
                <Brain className="w-3.5 h-3.5" />
                {mythosAnalyzing ? "Analyzing..." : "🧠 Analyze with Mythos"}
              </button>
            </div>
          )}

          {mythosFindings.length > 0 && (
            <div className="bg-slate-900/50 border border-emerald-800/30 rounded-xl p-4">
              <h2 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" /> Mythos Findings ({mythosFindings.length})
              </h2>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {mythosFindings.map((f, i) => {
                  const sevColors: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-blue-400" };
                  const sevBgs: Record<string, string> = { critical: "bg-red-500/10 border-red-500/20", high: "bg-orange-500/10 border-orange-500/20", medium: "bg-yellow-500/10 border-yellow-500/20", low: "bg-blue-500/10 border-blue-500/20" };
                  const sev = f.severity || "medium";
                  return (
                    <div key={i} className={`p-2 rounded-lg text-[10px] border ${sevBgs[sev] || "bg-slate-800"}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-semibold ${sevColors[sev] || "text-slate-400"}`}>{f.name}</span>
                        <span className="text-slate-500 uppercase text-[8px]">{sev}</span>
                      </div>
                      <p className="text-slate-400 line-clamp-2">{f.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
              <Wifi className="w-3.5 h-3.5 text-purple-400" /> Quick Targets
            </h2>
            <div className="space-y-1">
              {["scanme.nmap.org", "192.168.1.0/24", "10.0.0.0/24", "localhost"].map((t) => (
                <button key={t} onClick={() => setTarget(t)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-mono">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
