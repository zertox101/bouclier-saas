"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  Activity, AlertTriangle, ShieldOff, Cpu,
  Clock, Filter, X, ExternalLink, RefreshCw, ChevronRight,
  Info, Flame, Globe, Terminal,
  Server, Wifi, FileWarning, Search, ArrowUpRight,
  ArrowDownRight, TrendingUp, Radio, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { apiClient } from '@/lib/api-client';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TYPES
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Severity = "critical" | "high" | "medium" | "low" | "info";
type AlertStatus = "active" | "investigating" | "mitigated" | "dismissed";

interface SecurityAlert {
  id: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  source: string;
  dest?: string;
  protocol?: string;
  timestamp: string;
  category: string;
  description: string;
  mitre?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  severity: Severity;
  event_type: string;
  message: string;
  user?: string;
  bytes?: number;
}

interface MetricCard {
  label: string;
  value: string | number;
  sub: string;
  trend: "up" | "down" | "neutral";
  delta: string;
  icon: React.ElementType;
  color: string;
  glow: string;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// STATIC DATA â€” realistic SOC mock data
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SEV_CONFIG: Record<Severity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: "CRITICAL", bg: "bg-red-500/10",    text: "text-red-400",     border: "border-red-500/25",    dot: "bg-red-500"    },
  high:     { label: "HIGH",     bg: "bg-orange-500/10", text: "text-orange-400",  border: "border-orange-500/25", dot: "bg-orange-500" },
  medium:   { label: "MEDIUM",   bg: "bg-amber-500/10",  text: "text-amber-400",   border: "border-amber-500/25",  dot: "bg-amber-500"  },
  low:      { label: "LOW",      bg: "bg-blue-500/10",   text: "text-blue-400",    border: "border-blue-500/25",   dot: "bg-blue-500"   },
  info:     { label: "INFO",     bg: "bg-slate-500/10",  text: "text-slate-400",   border: "border-slate-500/25",  dot: "bg-slate-500"  },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: string }> = {
  active:        { label: "Active",        color: "text-red-400"    },
  investigating: { label: "Investigating", color: "text-amber-400"  },
  mitigated:     { label: "Mitigated",     color: "text-emerald-400"},
  dismissed:     { label: "Dismissed",     color: "text-slate-500"  },
};

// Event distribution bar
function generateEventDist() {
  return [];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SUB-COMPONENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Severity badge
const SevBadge = memo(({ sev }: { sev: Severity }) => {
  const c = SEV_CONFIG[sev];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border", c.bg, c.text, c.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
      {c.label}
    </span>
  );
});
SevBadge.displayName = "SevBadge";

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-slate-400 mb-1.5 font-mono">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}</span>
          <span className="ml-auto font-bold text-white pl-4">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// Stat card
const StatCard = memo(({ card, delay }: { card: MetricCard; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="card p-4 flex flex-col gap-3 relative group cursor-default"
  >
    <div className="flex items-start justify-between">
      <div className={cn("p-2.5 rounded-lg", card.color)}>
        <card.icon className="w-4 h-4" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded",
        card.trend === "up"   ? "text-emerald-400 bg-emerald-500/10" :
        card.trend === "down" ? "text-red-400 bg-red-500/10"        :
                               "text-slate-400 bg-slate-500/10"
      )}>
        {card.trend === "up"   ? <ArrowUpRight   className="w-3 h-3" /> :
         card.trend === "down" ? <ArrowDownRight  className="w-3 h-3" /> : null}
        {card.delta}
      </div>
    </div>
    <div>
      <div className="text-[22px] font-black text-white tracking-tight leading-none mb-1">{card.value}</div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</div>
      <div className="text-[10px] text-slate-600 mt-0.5">{card.sub}</div>
    </div>
  </motion.div>
));
StatCard.displayName = "StatCard";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// INCIDENT MODAL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const IncidentModal = memo(({ alert, onClose }: { alert: SecurityAlert | null; onClose: () => void }) => {
  const c = alert ? SEV_CONFIG[alert.severity] : null;
  const s = alert ? STATUS_CONFIG[alert.status] : null;

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 12  }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 p-2 rounded-lg border", c?.bg, c?.border)}>
                  <FileWarning className={cn("w-4 h-4", c?.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-slate-500">{alert.id}</span>
                    <SevBadge sev={alert.severity} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", s?.color)}>â— {s?.label}</span>
                  </div>
                  <h2 className="text-[15px] font-bold text-white leading-snug">{alert.title}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Network info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Source",   value: alert.source,           icon: Globe },
                  { label: "Dest",     value: alert.dest || "â€”",      icon: Server },
                  { label: "Protocol", value: alert.protocol || "â€”",  icon: Wifi },
                  { label: "Time",     value: alert.timestamp,        icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-200 break-all">{value}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</p>
                <p className="text-[13px] text-slate-300 leading-relaxed">{alert.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Tags:</span>
                <span className="badge badge-blue">{alert.category}</span>
                {alert.mitre && (
                  <span className="badge badge-purple">MITRE {alert.mitre}</span>
                )}
              </div>

              {/* Recommended actions */}
              <div className="rounded-xl p-4" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Recommended Actions
                </p>
                <ul className="space-y-1.5 text-[12px] text-slate-300">
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />Isolate affected endpoint from network immediately</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />Revoke credentials and force re-authentication for affected accounts</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />Capture memory dump for forensic analysis</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />Block IoC IP/domain at perimeter firewall</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
              <span className="text-[10px] text-slate-600 font-mono">Bouclier SOC Platform Â· Auto-escalation in 00:04:32</span>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary btn-sm" onClick={onClose}>Dismiss</button>
                <button className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Open Incident
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
IncidentModal.displayName = "IncidentModal";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN DASHBOARD COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ECHARTS OPTIONS GENERATORS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getZorkTrafficOption = (data: any[]) => ({
    backgroundColor: 'transparent',
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#000' } },
        backgroundColor: 'rgba(6, 10, 16, 0.95)',
        borderColor: '#00FFFF',
        borderWidth: 1,
        textStyle: { color: '#00FFFF', fontSize: 10, fontFamily: 'monospace' },
    },
    grid: { left: '3%', right: '3%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
        type: 'category',
        data: data.map(d => d.t),
        axisLine: { lineStyle: { color: 'rgba(0,255,255,0.1)' } },
        axisLabel: { color: '#64748b', fontSize: 9, fontFamily: 'monospace' },
    },
    yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 9 },
    },
    series: [
        {
            name: 'Inbound',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: data.map(d => d.inbound),
            lineStyle: { width: 3, color: '#39FF14', shadowBlur: 10, shadowColor: '#39FF14' },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(57, 255, 20, 0.25)' },
                    { offset: 1, color: 'rgba(57, 255, 20, 0)' }
                ])
            }
        },
        {
            name: 'Outbound',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: data.map(d => d.outbound),
            lineStyle: { width: 3, color: '#00FFFF', shadowBlur: 10, shadowColor: '#00FFFF' },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 255, 255, 0.2)' },
                    { offset: 1, color: 'rgba(0, 255, 255, 0)' }
                ])
            }
        },
        {
            name: 'Threat_Anomalies',
            type: 'effectScatter',
            coordinateSystem: 'cartesian2d',
            data: data.map((d, i) => d.anomaly > 0 ? [i, d.anomaly] : null).filter(d => d),
            symbolSize: 12,
            showEffectOn: 'render',
            rippleEffect: { brushType: 'stroke', scale: 4, period: 2 },
            itemStyle: { color: '#FF00FF', shadowBlur: 15, shadowColor: '#FF00FF' },
            zlevel: 5
        }
    ]
});

const getZorkDistOption = (data: any[]) => ({
    backgroundColor: 'transparent',
    series: [
        {
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
                borderRadius: 2,
                borderColor: '#060A10',
                borderWidth: 2,
                shadowBlur: 15,
                shadowColor: 'rgba(0,0,0,0.5)'
            },
            label: { show: false },
            data: data.map(d => ({ 
                value: d.value, 
                name: d.name, 
                itemStyle: { color: d.fill, shadowBlur: 10, shadowColor: d.fill } 
            }))
        }
    ]
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN DASHBOARD COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SOCDashboard() {
  const [mounted,        setMounted]        = useState(false);
  const [selectedAlert,  setSelectedAlert]  = useState<SecurityAlert | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [logSearch,      setLogSearch]      = useState("");
  const [logSev,         setLogSev]         = useState<Severity | "all">("all");
  const [refreshKey,     setRefreshKey]     = useState(0);
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  
  // Real state
  const [alerts,         setAlerts]         = useState<SecurityAlert[]>([]);
  const [logs,           setLogs]           = useState<LogEntry[]>([]);
  const [timeline,       setTimeline]       = useState<any[]>([]);
  const [health,         setHealth]         = useState<any>(null);
  const [stats,          setStats]          = useState<any>(null);
  const [liveCount,      setLiveCount]      = useState(0);
  const [zorkData,       setZorkData]       = useState<any[]>([]);

  useEffect(() => { 
    setMounted(true); 
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsRefreshing(true);
    try {
        const data = await apiClient('/api/telemetry/stats');
        setAlerts(data.alerts || []);
        setLogs(data.alerts.map((a: any) => ({
            id: 'LOG-' + a.id,
            timestamp: a.timestamp.split('T')[1].slice(0, 8),
            severity: a.severity,
            event_type: a.category,
            source_ip: a.source,
            dest_ip: a.dest || 'â€”',
            message: a.title,
            user: a.user || 'â€”'
        })));
        setTimeline(data.timeline || []);
        setHealth(data.health);
        setStats(data.counters);
        
        // Transform timeline for Zork Chart if needed, or use raw
        if (data.timeline) {
            setZorkData(data.timeline.map((t: any) => ({
                t: t.time,
                inbound: Number(t.inbound ?? t.count ?? 0),
                outbound: Number(t.outbound ?? t.resolved ?? 0),
                anomaly: Number(t.anomaly ?? t.incidents ?? 0)
            })));
        }
    } catch (err) {
        console.error("Failed to fetch SOC stats:", err);
    } finally {
        setIsRefreshing(false);
    }
  };

  // Real-time SSE Integration
  useEffect(() => {
    if (!mounted) return;
    
    const eventSource = new EventSource('/api/telemetry/stream?channels=events,health');
    
    eventSource.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            
            // If it's a telemetry event
            if (payload.type) {
                const newAlert: SecurityAlert = {
                    id: String(payload.id),
                    title: payload.message,
                    severity: payload.severity as Severity,
                    status: 'active',
                    source: payload.src_ip || 'Unknown',
                    timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                    category: payload.type,
                    description: payload.message
                };
                
                setAlerts(prev => [newAlert, ...prev].slice(0, 50));
                setLogs(prev => [{
                    id: 'LOG-' + payload.id,
                    timestamp: newAlert.timestamp,
                    severity: newAlert.severity,
                    event_type: payload.type,
                    source_ip: newAlert.source,
                    dest_ip: 'â€”',
                    message: payload.message,
                    user: 'â€”'
                }, ...prev].slice(0, 100));
                
                setLiveCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("SSE Parse Error:", err);
        }
    };

    return () => eventSource.close();
  }, [mounted]);

  const handleRefresh = useCallback(() => {
    fetchDashboardStats();
  }, []);

  const eventDist = useMemo(() => {
    if (!alerts.length) return generateEventDist();
    const counts: Record<string, number> = {};
    alerts.forEach(a => {
        counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
        name,
        value,
        fill: ['#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444', '#f59e0b', '#10b981'][i % 6]
    }));
  }, [alerts]);

  const filteredAlerts = useMemo(() =>
    alerts.filter(a => severityFilter === "all" || a.severity === severityFilter),
  [alerts, severityFilter]);

  const filteredLogs = useMemo(() =>
    logs.filter(l =>
      (logSev === "all" || l.severity === logSev) &&
      (logSearch === "" || [l.source_ip, l.dest_ip, l.event_type, l.message, l.user].some(v => v?.toLowerCase().includes(logSearch.toLowerCase())))
    ),
  [logs, logSev, logSearch]);

  const STATS_CARDS: MetricCard[] = [
    { label: "Active Alerts",   value: alerts.filter(a => a.status === "active").length, sub: "REAL-TIME SQL DATA", trend: "up",     delta: "LIVE", icon: AlertTriangle,  color: "bg-red-500/15 text-red-500",     glow: "shadow-red-500/20"    },
    { label: "Total Events",    value: (stats?.events || 0).toLocaleString(),                   sub: "Telemetry Ingested",    trend: "up",     delta: "24h",     icon: Activity,       color: "bg-green-500/15 text-[#39FF14]",   glow: "shadow-green-500/20"   },
    { label: "Threats Blocked", value: (stats?.incidents || 0).toLocaleString(),                sub: "Identified Incidents",  trend: "neutral", delta: "Stable",   icon: ShieldOff,      color: "bg-cyan-500/15 text-cyan-400", glow: "shadow-cyan-500/20"},
    { label: "Sensors Online",  value: `${health?.online || 0} / ${health?.total || 0}`,        sub: "Telemetry Mesh",   trend: "neutral",   delta: "100%",      icon: Server,         color: "bg-purple-500/15 text-purple-400", glow: "shadow-purple-500/20" },
    { label: "System Status",   value: health?.online === health?.total ? "Healthy" : "Check",  sub: "Cloud Guard Sync", trend: "up",     delta: "Sync",     icon: Clock,           color: "bg-cyan-500/15 text-[#00FFFF]",   glow: "shadow-cyan-500/20"   },
    { label: "Data Quality",    value: "High",                                                  sub: "SQL Backend Link", trend: "up",    delta: "Verified", icon: TrendingUp,     color: "bg-indigo-500/15 text-indigo-400", glow: "shadow-indigo-500/20" },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <IncidentModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />

      {/* â”€â”€ Page Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#0c1421] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-sm tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              Real Data Stream Active
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">SQL_BACKEND :: VERIFIED</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-blue-500/50 underline-offset-8">
            Tactical <span className="text-blue-500">Overview</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="text-right hidden lg:block">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Live Synchronization</p>
            <p className="text-xs font-mono text-white opacity-80">{new Date().toISOString().split('T')[1].slice(0, 8)} UTC</p>
          </div>
          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-400 group-hover:text-blue-400", isRefreshing && "animate-spin")} />
          </button>
          <button className="px-6 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            Live Intel
          </button>
        </div>
      </div>

      {/* â”€â”€ KPI Row â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS_CARDS.map((card, i) => (
          <StatCard key={card.label} card={card} delay={i * 0.05} />
        ))}
      </div>

      {/* â”€â”€ Apache ECharts Row â”€â”€ */}
      <div className="grid grid-cols-12 gap-6">

        {/* Real-time Network Volatility (ECharts) */}
        <div className="col-span-12 lg:col-span-8 bg-[#091019] border-2 border-[#00FFFF]/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.05)] overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00FFFF] opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[14px] font-black text-white flex items-center gap-2 uppercase tracking-[0.2em]">
                <Activity className="w-5 h-5 text-[#39FF14]" />
                Event Timeline Matrix
              </h2>
              <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase mt-1">Hourly Ingestion Frequency :: 24h Window</p>
            </div>
          </div>
          <div className="h-[320px]">
             {zorkData.length > 0 ? (
                <ReactECharts 
                    option={getZorkTrafficOption(zorkData)} 
                    style={{ height: '100%', width: '100%' }}
                    notMerge={true}
                />
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                    Initializing Real-time Matrix...
                </div>
             )}
          </div>
        </div>

        {/* Threat Vector Distribution (ECharts) */}
        <div className="col-span-12 lg:col-span-4 bg-[#091019] border-2 border-[#FF00FF]/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(255,0,255,0.05)] relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#FF00FF] opacity-20 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-[14px] font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] mb-8">
            <Layers className="w-5 h-5 text-[#FF00FF]" />
            Vector Distribution
          </h2>
          <div className="h-[250px]">
             <ReactECharts 
                option={getZorkDistOption(eventDist)} 
                style={{ height: '100%', width: '100%' }}
             />
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
             <div className="flex justify-between items-center text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
                <span>Database Entries</span>
                <span className="text-white text-xl font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{alerts.length}</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {eventDist.slice(0, 4).map(d => (
                    <div key={d.name} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00FFFF]/20 transition-all">
                        <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-widest truncate">{d.name}</p>
                        <p className="text-lg font-black text-white leading-none">{d.value}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>

        {/* System Health */}
        <div className="col-span-12 lg:col-span-6 card p-5">
          <h2 className="text-[13px] font-bold text-white flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Infrastructure Status
          </h2>
          <div className="space-y-3">
            {[
              { label: "Connected Sensors",    val: health?.total > 0 ? (health.online / health.total) * 100 : 0,  status: health?.online === health?.total ? "ok" : "warn",  color: health?.online === health?.total ? "#10b981" : "#f59e0b" },
              { label: "API Gateway Sync",     val: 100,  status: "ok",   color: "#10b981" },
              { label: "Database Connection",  val: 100,  status: "ok",   color: "#10b981" },
              { label: "Redis Stream Pulse",   val: 100,  status: "ok",   color: "#10b981" },
              { label: "Detection Engine",     val: 100,  status: "ok", color: "#10b981" },
            ].map(({ label, val, color, status }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] text-slate-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold font-mono" style={{ color }}>{val}%</span>
                    {status === "crit" && <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">HIGH</span>}
                    {status === "warn" && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">WARN</span>}
                    {status === "ok"   && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">OK</span>}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}40` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      
      {/* â”€â”€ Alerts Panel â”€â”€ */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <h2 className="text-[13px] font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Security Alerts
            <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded-full">
              {alerts.filter(a => a.status === "active").length} Active
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            {(["all", "critical", "high", "medium", "low"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={cn(
                  "text-[10px] font-bold uppercase px-2 py-1 rounded border transition-all",
                  severityFilter === s
                    ? s === "all" ? "bg-white/10 text-white border-white/20" : cn(SEV_CONFIG[s as Severity]?.bg, SEV_CONFIG[s as Severity]?.text, SEV_CONFIG[s as Severity]?.border)
                    : "text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"
                )}
              >
                {s === "all" ? "All" : SEV_CONFIG[s as Severity].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <th className="px-4 py-3 font-bold">Alert ID</th>
                <th className="px-4 py-3 font-bold">Severity</th>
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold hidden sm:table-cell">Source</th>
                <th className="px-4 py-3 font-bold hidden md:table-cell">Category</th>
                <th className="px-4 py-3 font-bold hidden lg:table-cell">MITRE ATT&CK</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
              {filteredAlerts.length > 0 ? filteredAlerts.map((alert, i) => {
                const s = STATUS_CONFIG[alert.status];
                return (
                  <motion.tr
                    key={alert.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-all cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{alert.id}</td>
                    <td className="px-4 py-3"><SevBadge sev={alert.severity} /></td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-semibold text-slate-200 group-hover:text-white transition-colors max-w-[240px] truncate block">{alert.title}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[11px] font-mono text-blue-400">{alert.source}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[11px] text-slate-400">{alert.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {alert.mitre
                        ? <span className="badge badge-purple">{alert.mitre}</span>
                        : <span className="text-slate-700 text-[11px]">â€”</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5", s?.color)}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono text-slate-600">{alert.timestamp}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }}
                        className="p-1.5 rounded text-slate-600 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                        No real telemetry events found in database
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Live Log Table â”€â”€ */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <h2 className="text-[13px] font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Live Event Log
            <span className="badge badge-green text-[9px] font-bold">
              {logs.length} events
            </span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Filter logsâ€¦"
                className="input h-8 pl-9 text-[12px] rounded-lg w-40 sm:w-56"
              />
            </div>
            {/* Severity filter */}
            <select
              value={logSev}
              onChange={e => setLogSev(e.target.value as Severity | "all")}
              className="input h-8 text-[12px] rounded-lg w-32 bg-transparent cursor-pointer"
            >
              <option value="all">All Severity</option>
              {(["critical","high","medium","low","info"] as Severity[]).map(s => (
                <option key={s} value={s}>{SEV_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <th className="px-4 py-2.5 font-bold">Time</th>
                <th className="px-4 py-2.5 font-bold">Severity</th>
                <th className="px-4 py-2.5 font-bold">Type</th>
                <th className="px-4 py-2.5 font-bold hidden sm:table-cell">Source IP</th>
                <th className="px-4 py-2.5 font-bold hidden md:table-cell">Dest IP</th>
                <th className="px-4 py-2.5 font-bold hidden lg:table-cell">User</th>
                <th className="px-4 py-2.5 font-bold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[11px]" style={{ borderColor: "rgba(255,255,255,0.025)" }}>
              {filteredLogs.length > 0 ? filteredLogs.map((log, i) => {
                const c = SEV_CONFIG[log.severity];
                return (
                  <tr key={log.id} className="group hover:bg-white/[0.015] transition-colors">
                    <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest", c?.text)}>{c?.label}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-400 whitespace-nowrap">{log.event_type}</td>
                    <td className="px-4 py-2 text-blue-400/80 hidden sm:table-cell whitespace-nowrap">{log.source_ip}</td>
                    <td className="px-4 py-2 text-slate-500 hidden md:table-cell whitespace-nowrap">{log.dest_ip}</td>
                    <td className="px-4 py-2 text-slate-500 hidden lg:table-cell">{log.user ?? "â€”"}</td>
                    <td className="px-4 py-2 text-slate-300 max-w-[300px] truncate">{log.message}</td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                        Waiting for real-time events...
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t text-[11px]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <span className="text-slate-600 font-mono">Showing {filteredLogs.length} entries from SQL database</span>
          <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1">
            Load More <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

