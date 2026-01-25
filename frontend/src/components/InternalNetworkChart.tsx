"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, RefreshCw, TrendingUp, TrendingDown, Wifi, Server, Activity as ActivityIcon } from "lucide-react";

type NetworkLane = {
  label: string;
  value: number;
  trend?: number;
};

type InternalNetworkChartProps = {
  lanes?: NetworkLane[];
  timeRangeLabel?: string;
  onRefresh?: () => void;
};

const defaultLanes: NetworkLane[] = [
  { label: "DMZ Cluster", value: 12450, trend: 12 },
  { label: "Internal API", value: 45200, trend: -5 },
  { label: "Auth Bridge", value: 8900, trend: 2 },
  { label: "DB Mesh", value: 7200, trend: 8 },
];

const laneColors = [
  { main: "#06b6d4", bg: "rgba(6,182,212,0.1)", glow: "rgba(6,182,212,0.3)" },
  { main: "#8b5cf6", bg: "rgba(139,92,246,0.1)", glow: "rgba(139,92,246,0.3)" },
  { main: "#10b981", bg: "rgba(16,185,129,0.1)", glow: "rgba(16,185,129,0.3)" },
  { main: "#f97316", bg: "rgba(249,115,22,0.1)", glow: "rgba(249,115,22,0.3)" },
];

const timeRanges = ["1h", "6h", "24h", "7d"];

export default function InternalNetworkChart({
  lanes,
  timeRangeLabel = "7d",
  onRefresh,
}: InternalNetworkChartProps) {
  const laneItems = lanes && lanes.length ? lanes : defaultLanes;
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRangeLabel);
  const [isLive, setIsLive] = useState(true);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);
  const [trends, setTrends] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevValuesRef = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
    setAnimatedValues(laneItems.map(l => l.value));
  }, []);

  useEffect(() => {
    if (!mounted || !isLive) return;
    const nextValues = laneItems.map(l => l.value);
    const prevValues = prevValuesRef.current.length ? prevValuesRef.current : nextValues;
    const nextTrends = nextValues.map((val, idx) => {
      const prev = prevValues[idx] ?? 0;
      if (!prev) return 0;
      return Number((((val - prev) / prev) * 100).toFixed(1));
    });
    prevValuesRef.current = nextValues;
    setAnimatedValues(nextValues);
    setTrends(nextTrends);
  }, [laneItems, isLive, mounted]);

  const handleRangeChange = () => {
    const currentIndex = timeRanges.indexOf(currentTimeRange);
    setCurrentTimeRange(timeRanges[(currentIndex + 1) % timeRanges.length]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
    onRefresh?.();
  };

  const totalRequests = animatedValues.reduce((sum, val) => sum + val, 0);
  const maxValue = Math.max(...animatedValues, 10);
  const healthLabel = totalRequests > 0 ? "OPTIMAL" : "STABLE";
  const avgTrend = trends.length
    ? Number((trends.reduce((sum, val) => sum + val, 0) / trends.length).toFixed(1))
    : 0;

  return (
    <section className="relative h-full overflow-hidden rounded-2xl border border-border-1 bg-bg-1 shadow-2xl flex flex-col font-sans">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-border-1 bg-bg-2/40 backdrop-blur-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-p-500/10 border border-p-500/20 shadow-lg shadow-p-500/5">
              <ActivityIcon className="h-5 w-5 text-p-400 cyber-glow-purple" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-bg-1 animate-pulse shadow-[0_0_8px_rgba(var(--success),0.8)]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-text-1">
              Internal Audit
            </h3>
            <p className="text-[10px] text-text-3 font-bold uppercase mt-0.5 tracking-[0.1em]">Network Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black border transition-all uppercase tracking-widest ${isLive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
              : "bg-slate-900/50 text-slate-500 border-white/5"
              }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            {isLive ? 'MONITORING' : 'SUSPENDED'}
          </button>

          <button
            onClick={handleRangeChange}
            className="rounded-lg border border-white/5 bg-slate-900/50 px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest"
          >
            {currentTimeRange}
          </button>

          <button
            onClick={handleRefresh}
            className={`rounded-lg border border-white/5 bg-slate-900/50 p-2 text-slate-400 hover:text-purple-400 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col p-5 min-h-0">

        {/* Total Requests Header */}
        <motion.div
          className="mb-6 rounded-xl bg-bg-2/30 border border-border-1 px-5 py-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-p-400" />
              <div className="flex flex-col">
                <motion.span
                  key={totalRequests}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-black text-text-1 tracking-tighter"
                >
                  {mounted ? totalRequests.toLocaleString() : "---"}
                </motion.span>
                <span className="text-[10px] text-text-3 font-black uppercase tracking-widest">Total Requests</span>
              </div>
            </div>

            <div className="h-8 w-px bg-border-1" />

            <div className="flex flex-col">
              <div className={`flex items-center gap-1 text-[11px] font-black ${avgTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                {avgTrend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {avgTrend >= 0 ? '+' : ''}{avgTrend}%
              </div>
              <span className="text-[9px] text-text-3 font-bold uppercase">vs last period</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-lg border border-white/5">
            <Wifi className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-black uppercase">System Health</span>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">{healthLabel}</span>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {laneItems.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl bg-slate-900/20">
              <Activity className="h-8 w-8 text-slate-700 mb-2 opacity-20" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">No internal traffic sensors detected</p>
            </div>
          ) : (
            <AnimatePresence>
              {laneItems.map((lane, idx) => {
                const color = laneColors[idx % laneColors.length];
                const value = mounted ? (animatedValues[idx] ?? lane.value) : 0;
                const percentage = (value / maxValue) * 100;
                const trend = trends[idx] ?? 0;

                return (
                  <motion.div
                    key={lane.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 p-4 transition-all group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_${color.main}]`} style={{ backgroundColor: color.main }} />
                          <span className="text-[11px] font-black text-white uppercase tracking-widest">{lane.label}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                        </span>
                      </div>

                      <div className="text-2xl font-black text-white tracking-tighter mb-4">
                        {value.toLocaleString()}
                      </div>

                      <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-white/5 mb-3">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color.main, boxShadow: `0 0 10px ${color.glow}` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-end gap-1 h-4">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full"
                              style={{ backgroundColor: color.main }}
                              animate={{
                                height: [
                                  `${20 + Math.random() * 80}%`,
                                  `${20 + Math.random() * 80}%`,
                                  `${20 + Math.random() * 80}%`
                                ]
                              }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Sensor active</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Connections: {totalRequests.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nodes Registered: {laneItems.length}</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Encrypted Secure Link</span>
        </div>
      </div>
    </section>
  );
}
