"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, Activity, Database, Zap, Shield,
  Globe, AlertTriangle, CheckCircle, ChevronRight,
  BarChart3, Cpu, Radio, RefreshCw, Eye, Terminal,
  TrendingUp, Clock, Layers, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { apiClient } from '@/lib/api-client';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

// ── Types ──────────────────────────────────────────────────────────────────────
interface StreamStatus {
  running: boolean;
  dataset: string;
  rows_sent: number;
  rows_total: number;
  progress: number;
  speed_ms: number;
  started_at: string | null;
  last_event: LastEvent | null;
  events_per_sec: number;
}

interface LastEvent {
  label: string;
  severity: string;
  src_ip: string;
  country: string;
  ts: string;
}

interface PreviewRow {
  row: number;
  label: string;
  severity: string;
  src_ip: string;
  dst_ip: string;
  dst_port: number;
  protocol: string;
  country: string;
  mitre_id: string;
  flow_bytes_s: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const DATASETS = [
  { id: "cicids2017",  label: "CIC-IDS 2017",       badge: "Core",    color: "cyan",   rows: "~197K" },
  { id: "cicids_full", label: "CIC-IDS 2017 Full",   badge: "Full",    color: "blue",   rows: "~733K" },
  { id: "iotmal2026",  label: "IoTMal 2026",          badge: "New",     color: "emerald",rows: "500" },
  { id: "malmem2022",  label: "MalMem 2022",          badge: "Forensic",color: "purple", rows: "500" },
  { id: "unsw_nb15",   label: "UNSW-NB15",            badge: "Popular", color: "amber",  rows: "500" },
];

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

const SEV_BG: Record<string, string> = {
  critical: "bg-red-500/10 border-red-500/30 text-red-400",
  high:     "bg-orange-500/10 border-orange-500/30 text-orange-400",
  medium:   "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  low:      "bg-green-500/10 border-green-500/30 text-green-400",
};

const SPEED_OPTIONS = [
  { label: "50ms  — Turbo",   value: 50 },
  { label: "200ms — Normal",  value: 200 },
  { label: "500ms — Slow",    value: 500 },
  { label: "1s    — Debug",   value: 1000 },
  { label: "2s    — Manual",  value: 2000 },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CICIDSLiveStream() {
  const [status, setStatus]         = useState<StreamStatus | null>(null);
  const [selectedDs, setSelectedDs] = useState("cicids2017");
  const [speedMs, setSpeedMs]       = useState(200);
  const [preview, setPreview]       = useState<PreviewRow[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [starting, setStarting]     = useState(false);
  const [stopping, setStopping]     = useState(false);
  const [liveLog, setLiveLog]       = useState<LastEvent[]>([]);
  const [chartData, setChartData]   = useState<{ t: string; rows: number; eps: number }[]>([]);
  const [sevCounts, setSevCounts]   = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const sseRef = useRef<EventSource | null>(null);

  // ── SSE live status ──────────────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource(`${API}/api/datasets/stream/live`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const data: StreamStatus = JSON.parse(e.data);
        setStatus(data);

        // Update chart
        setChartData(prev => {
          const now = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
          return [...prev, { t: now, rows: data.rows_sent, eps: data.events_per_sec }].slice(-60);
        });

        // Update live log
        if (data.last_event) {
          setLiveLog(prev => [data.last_event!, ...prev].slice(0, 50));
          // Update severity counts
          setSevCounts(prev => ({
            ...prev,
            [data.last_event!.severity]: (prev[data.last_event!.severity as keyof typeof prev] || 0) + 1,
          }));
        }
      } catch {}
    };

    return () => es.close();
  }, []);

  // ── Load preview ─────────────────────────────────────────────────────────────
  const loadPreview = useCallback(async (ds: string) => {
    setLoadingPreview(true);
    try {
      const data = await apiClient(`/api/datasets/stream/preview?dataset=${ds}&limit=15`);
      setPreview(data.events || []);
    } catch {}
    setLoadingPreview(false);
  }, []);

  useEffect(() => { loadPreview(selectedDs); }, [selectedDs, loadPreview]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  const handleStart = async () => {
    setStarting(true);
    try {
      await apiClient(`/api/datasets/stream/start?dataset=${selectedDs}&speed_ms=${speedMs}`, { method: "POST" });
      setSevCounts({ critical: 0, high: 0, medium: 0, low: 0 });
      setLiveLog([]);
      setChartData([]);
    } catch {}
    setStarting(false);
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await apiClient('/api/datasets/stream/stop', { method: "POST" });
    } catch {}
    setStopping(false);
  };

  const isRunning = status?.running ?? false;
  const progress  = status?.progress ?? 0;
  const rowsSent  = status?.rows_sent ?? 0;
  const rowsTotal = status?.rows_total ?? 0;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-300 font-sans pb-20">

      {/* ── HEADER ── */}
      <div className="border-b border-white/5 bg-[#0a121d]/60 backdrop-blur-md px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">CICIDS Live Ingestor</span>
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  STREAMING
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Dataset <span className="text-cyan-400">Live</span> Stream
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Injecte le dataset CICIDS ligne par ligne dans la DB + Redis en temps réel
            </p>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-4">
            {[
              { label: "Rows Sent",  value: rowsSent.toLocaleString(), color: "text-cyan-400" },
              { label: "Progress",   value: `${progress}%`,            color: "text-emerald-400" },
              { label: "Events/sec", value: status?.events_per_sec ?? 0, color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="text-center px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className={cn("text-2xl font-black font-mono", s.color)}>{s.value}</div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* ── CONTROLS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Dataset selector */}
          <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Select Dataset
            </h3>
            <div className="space-y-2">
              {DATASETS.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => !isRunning && setSelectedDs(ds.id)}
                  disabled={isRunning}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    selectedDs === ds.id
                      ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                      : "bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300",
                    isRunning && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div>
                    <div className="text-xs font-black uppercase tracking-tight">{ds.label}</div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{ds.rows} rows</div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                    ds.badge === "New"     ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    ds.badge === "Core"    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    ds.badge === "Full"    ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    ds.badge === "Popular" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  )}>{ds.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Speed + Launch */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Stream Speed
              </h3>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {SPEED_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => !isRunning && setSpeedMs(opt.value)}
                    disabled={isRunning}
                    className={cn(
                      "py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                      speedMs === opt.value
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-white/5 border-white/5 text-slate-600 hover:text-slate-300",
                      isRunning && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {opt.label.split("—")[0].trim()}
                    <div className="text-[8px] opacity-60 mt-0.5">{opt.label.split("—")[1]?.trim()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {rowsTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase mb-2">
                  <span>Progress</span>
                  <span>{rowsSent.toLocaleString()} / {rowsTotal.toLocaleString()} rows</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Start / Stop */}
            <div className="flex gap-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="flex-1 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {starting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {starting ? "Initializing..." : "Start Live Stream"}
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  disabled={stopping}
                  className="flex-1 py-4 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-red-600/30 flex items-center justify-center gap-3 animate-pulse disabled:opacity-50"
                >
                  {stopping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  {stopping ? "Stopping..." : "Stop Stream"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── SEVERITY COUNTERS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(["critical","high","medium","low"] as const).map(sev => (
            <div key={sev} className={cn("rounded-2xl border p-5", SEV_BG[sev])}>
              <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{sev}</div>
              <div className="text-3xl font-black font-mono">{sevCounts[sev].toLocaleString()}</div>
              <div className="text-[9px] opacity-50 mt-1">events detected</div>
            </div>
          ))}
        </div>

        {/* ── CHART + LIVE LOG ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Throughput chart */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Rows Ingested Over Time
            </h3>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradRows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#000", border: "1px solid #333", color: "#fff", fontSize: 10, fontFamily: "monospace" }}
                    itemStyle={{ color: "#06b6d4" }}
                  />
                  <Area type="monotone" dataKey="rows" stroke="#06b6d4" strokeWidth={2} fill="url(#gradRows)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-xs uppercase tracking-widest">
                Waiting for stream to start...
              </div>
            )}
          </div>

          {/* Live event log */}
          <div className="rounded-2xl border border-white/5 bg-black/40 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Event Feed</span>
              {isRunning && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping ml-auto" />}
            </div>
            <div className="flex-1 overflow-y-auto max-h-[220px] font-mono text-[10px]">
              <AnimatePresence initial={false}>
                {liveLog.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 uppercase tracking-widest">
                    No events yet — start the stream
                  </div>
                ) : liveLog.map((ev, i) => (
                  <motion.div
                    key={`${ev.ts}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", {
                      "bg-red-500":    ev.severity === "critical",
                      "bg-orange-500": ev.severity === "high",
                      "bg-yellow-500": ev.severity === "medium",
                      "bg-green-500":  ev.severity === "low",
                    })} />
                    <span className="text-slate-600 w-20 flex-shrink-0">{ev.ts?.split("T")[1]?.slice(0,8)}</span>
                    <span className="text-cyan-300 flex-1 truncate">{ev.label}</span>
                    <span className="text-slate-500 w-24 text-right truncate">{ev.country}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── PREVIEW TABLE ── */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Dataset Preview — {DATASETS.find(d => d.id === selectedDs)?.label}
              </span>
            </div>
            <button
              onClick={() => loadPreview(selectedDs)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
            >
              <RefreshCw className={cn("w-3 h-3", loadingPreview && "animate-spin")} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20">
                  {["#","Label","Severity","Src IP","Dst IP","Port","Protocol","Country","MITRE","Flow B/s"].map(h => (
                    <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loadingPreview ? (
                  <tr><td colSpan={10} className="p-8 text-center text-slate-600 text-xs uppercase">Loading preview...</td></tr>
                ) : preview.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-slate-600 text-xs uppercase">No preview available</td></tr>
                ) : preview.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-[10px]">{row.row}</td>
                    <td className="px-4 py-2.5 text-[10px] font-black text-white uppercase tracking-tight max-w-[140px] truncate">{row.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded border text-[8px] font-black uppercase", SEV_BG[row.severity] || "bg-white/5 border-white/10 text-slate-400")}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-cyan-300">{row.src_ip}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-purple-300">{row.dst_ip}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{row.dst_port}</td>
                    <td className="px-4 py-2.5 text-[10px] text-slate-400">{row.protocol}</td>
                    <td className="px-4 py-2.5 text-[10px] text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3 opacity-50" />{row.country}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-amber-400">{row.mitre_id}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{row.flow_bytes_s?.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
