"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RefreshCw, TrendingUp, ArrowRight, ShieldAlert } from "lucide-react";

type MultiSourceChartProps = {
  leftLabels?: string[];
  rightLabels?: string[];
  leftValues?: number[];
  rightValues?: number[];
  timeRangeLabel?: string;
  onRangeChange?: () => void;
  onRefresh?: () => void;
};

const defaultLeftLabels = ["SSH", "HTTP/S", "SMTP", "FTP", "DNS"];
const defaultRightLabels = [
  "Web Portal",
  "Data Harvest",
  "Phishing",
  "C2 Server",
  "Exfiltration",
];

const timeRanges = ["5m", "15m", "1h", "6h", "24h"];

const sourceColors = [
  { main: "#06b6d4", glow: "rgba(6,182,212,0.4)" },    // Cyan
  { main: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },   // Violet
  { main: "#ec4899", glow: "rgba(236,72,153,0.4)" },   // Pink
  { main: "#f97316", glow: "rgba(249,115,22,0.4)" },   // Orange
  { main: "#10b981", glow: "rgba(16,185,129,0.4)" },   // Emerald
];

export default function MultiSourceChart({
  leftLabels,
  rightLabels,
  leftValues,
  rightValues,
  timeRangeLabel,
  onRangeChange,
  onRefresh,
}: MultiSourceChartProps) {
  const left = leftLabels && leftLabels.length ? leftLabels : defaultLeftLabels;
  const right = rightLabels && rightLabels.length ? rightLabels : defaultRightLabels;

  const [currentTimeRange, setCurrentTimeRange] = useState(timeRangeLabel || "5m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [flowValues, setFlowValues] = useState<number[]>([]);
  const [rates, setRates] = useState<number[]>([]);
  const [totalFlux, setTotalFlux] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Number of items (use minimum between left and right)
  const itemCount = Math.min(left.length, right.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const flows = (leftValues && leftValues.length ? leftValues : new Array(itemCount).fill(0)).slice(0, itemCount);
    const rightFlow = (rightValues && rightValues.length ? rightValues : flows).slice(0, itemCount);
    setFlowValues(flows);
    setRates(rightFlow);
    setTotalFlux(flows.reduce((sum, val) => sum + val, 0));
  }, [itemCount, leftValues, rightValues, mounted]);

  const handleRangeChange = () => {
    const currentIndex = timeRanges.indexOf(currentTimeRange);
    setCurrentTimeRange(timeRanges[(currentIndex + 1) % timeRanges.length]);
    onRangeChange?.();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
    onRefresh?.();
  };

  const maxValue = Math.max(...flowValues, 10);
  const maxRate = Math.max(...rates, 1);

  const getRiskLevel = (rate: number) => {
    const ratio = rate / maxRate;
    if (ratio >= 0.85) return "critical";
    if (ratio >= 0.65) return "high";
    if (ratio >= 0.4) return "medium";
    return "low";
  };

  return (
    <section className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-slate-950 shadow-2xl flex flex-col font-sans">
      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scan-fast" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <Zap className="h-5 w-5 text-cyan-400 cyber-glow-cyan" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Traffic Flow Analysis
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-[0.1em]">Multi-source Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
          </div>

          <button
            onClick={handleRangeChange}
            className="rounded-lg border border-white/5 bg-slate-900/50 px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-white hover:border-white/10 transition-all uppercase tracking-widest"
          >
            {currentTimeRange}
          </button>

          <button
            onClick={handleRefresh}
            className={`rounded-lg border border-white/5 bg-slate-900/50 p-2 text-slate-400 hover:text-cyan-400 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col p-5 min-h-0">

        {/* Total Flux Header */}
        <motion.div
          className="mb-6 flex items-center justify-between rounded-xl bg-slate-900/30 border border-white/5 px-4 py-3 relative overflow-hidden group"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="text-4xl font-black text-white tracking-tighter">
              {mounted ? totalFlux.toLocaleString() : "---"}
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Total Flux</div>
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                +12.4%
              </div>
            </div>
          </div>

          {/* Mini bars */}
          <div className="flex items-end gap-1 h-8 relative z-10 pr-2">
            {[...Array(8)].map((_, idx) => (
              <motion.div
                key={idx}
                className="w-1.5 rounded-full bg-cyan-500/20"
                initial={{ height: "20%" }}
                animate={{
                  height: ["20%", "100%", "40%", "80%", "20%"],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: idx * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Clean Flow Visualization */}
        <div className="flex-1 flex items-stretch gap-0 min-h-0">

          {/* Sources Column */}
          <div className="flex flex-col justify-around gap-2 w-24 shrink-0 pr-4">
            {left.slice(0, itemCount).map((label, idx) => {
              const color = sourceColors[idx % sourceColors.length];
              const value = flowValues[idx] || 0;
              const isActive = activeIndex === null || activeIndex === idx;

              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive ? 1 : 0.3, x: 0, scale: activeIndex === idx ? 1.05 : 1 }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`relative rounded-xl border border-white/5 bg-slate-900/40 p-3 cursor-pointer transition-all ${activeIndex === idx ? "border-cyan-500/30 ring-4 ring-cyan-500/5" : "hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full shrink-0 animate-pulse"
                      style={{
                        backgroundColor: color.main,
                        boxShadow: `0 0 10px ${color.main}`
                      }}
                    />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">{label}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-1 pl-4">{value} REQ</div>
                </motion.div>
              );
            })}
          </div>

          {/* Center SVG Lines */}
          <div className="flex-1 relative">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                {sourceColors.map((color, idx) => (
                  <linearGradient key={`grad-${idx}`} id={`line-gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color.main} stopOpacity="1" />
                    <stop offset="50%" stopColor={color.main} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color.main} stopOpacity="1" />
                  </linearGradient>
                ))}
              </defs>

              {mounted && [...Array(itemCount)].map((_, idx) => {
                const totalHeight = 100;
                const spacing = totalHeight / (itemCount + 1);
                const yPos = spacing * (idx + 1);
                const isActive = activeIndex === null || activeIndex === idx;
                const flowValue = flowValues[idx] || 0;
                const strokeWidth = activeIndex === idx ? 3 : 1;

                return (
                  <g key={idx}>
                    <motion.line
                      x1="0%" y1={`${yPos}%`}
                      x2="100%" y2={`${yPos}%`}
                      stroke={sourceColors[idx % sourceColors.length].main}
                      strokeWidth={strokeWidth}
                      strokeOpacity={isActive ? 0.3 : 0.05}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                    />

                    <motion.circle
                      r={strokeWidth + 2}
                      fill={sourceColors[idx % sourceColors.length].main}
                      initial={{ cx: "0%" }}
                      animate={{
                        cx: ["0%", "100%"],
                        opacity: isActive ? [0, 1, 1, 0] : 0
                      }}
                      transition={{
                        duration: 1.5 + (idx * 0.2),
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      cy={`${yPos}%`}
                      className="blur-[1px]"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center HUD Element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-12 w-12 rounded-full border border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-center shadow-2xl relative">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
                <ArrowRight className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Destinations Column */}
          <div className="flex flex-col justify-around gap-2 w-28 shrink-0 pl-4">
            {right.slice(0, itemCount).map((label, idx) => {
              const color = sourceColors[idx % sourceColors.length];
              const rate = rates[idx] || 0;
              const riskLevel = getRiskLevel(rate);
              const isActive = activeIndex === null || activeIndex === idx;

              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isActive ? 1 : 0.3, x: 0, scale: activeIndex === idx ? 1.05 : 1 }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`relative rounded-xl border border-white/5 bg-slate-900/40 p-3 cursor-pointer transition-all ${activeIndex === idx ? "border-cyan-500/30 ring-4 ring-cyan-500/5" : "hover:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color.main }} />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider truncate">{label}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black text-white">{rate}/S</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${riskLevel === 'critical' ? 'bg-red-500/20 text-red-500' :
                      riskLevel === 'high' ? 'bg-orange-500/20 text-orange-500' :
                        riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-emerald-500/20 text-emerald-500'
                      }`}>
                      {riskLevel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <span>Active Signals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Data Ingestion</span>
          </div>
        </div>
      </div>
    </section>
  );
}
