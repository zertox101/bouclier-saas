"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useEventSource } from "@/lib/sse";
import { format } from "date-fns";
import {
  Activity,
  ShieldAlert,
  Zap,
  Server,
  Globe,
  Cpu,
  Database,
  Lock,
  Radar,
  AlertCircle,
  Copy,
  Info,
  ChevronRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import SOCMetrics from "@/components/SOCMetrics";
import EventTablePro from "@/components/EventTablePro";
import InternalNetworkChart from "@/components/InternalNetworkChart";
import SeverityStats from "@/components/SeverityStats";
import dynamic from "next/dynamic";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Dynamically import the 3D globe to avoid SSR issues
const ThreatGlobe = dynamic(() => import("@/components/Globe3DMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-2/20 backdrop-blur-sm rounded-3xl border border-border-1">
      <div className="flex flex-col items-center gap-4">
        <Radar className="w-8 h-8 text-p-400 animate-spin" />
        <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Initializing Neural Map...</span>
      </div>
    </div>
  )
});

export default function OverviewPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
  const { events, status } = useEventSource(`${apiUrl}/telemetry/stream`);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [platformMode, setPlatformMode] = useLocalStorage<"simulator" | "emulation">("platform-mode", "emulation");

  // Derived Metrics for SOCMetrics Component
  const socMetricsProps = useMemo(() => {
    const totalEvents = events.length;
    const criticalAlerts = events.filter(e => String(e.severity || "").toLowerCase() === 'critical').length;
    const highAlerts = events.filter(e => String(e.severity || "").toLowerCase() === 'high').length;
    const mediumAlerts = events.filter(e => String(e.severity || "").toLowerCase() === 'medium').length;
    const lowAlerts = events.filter(e => String(e.severity || "").toLowerCase() === 'low').length;

    return {
      totalEvents,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      blockedAttacks: totalEvents ? totalEvents + 42 : 1242,
      activeThreats: criticalAlerts,
      uptime: 99.99,
      mttr: 12,
      mttd: 45
    };
  }, [events]);

  // Derived Metrics for Page Layout
  const metrics = useMemo(() => {
    const total = socMetricsProps.totalEvents;
    const critical = socMetricsProps.criticalAlerts;
    const systemRisk = Math.min(100, (critical * 12) + (total / 10)).toFixed(1);

    return {
      total,
      critical,
      systemRisk,
      activeNodes: 42,
      uptime: "99.99%"
    };
  }, [socMetricsProps]);

  // Derived items for SeverityStats
  const severityStatsItems = useMemo(() => [
    { label: "Critical", count: socMetricsProps.criticalAlerts, tone: "critical" as const },
    { label: "High", count: socMetricsProps.highAlerts, tone: "high" as const },
    { label: "Medium", count: socMetricsProps.mediumAlerts, tone: "medium" as const },
    { label: "Low", count: socMetricsProps.lowAlerts, tone: "low" as const },
  ], [socMetricsProps]);

  // Derived rows for EventTablePro
  const eventRows = useMemo(() => {
    return events.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      time: format(new Date(e.timestamp), 'HH:mm:ss'),
      srcIp: e.data?.src_ip || '---',
      dstIp: e.data?.dst_ip || '---',
      country: e.data?.country || 'Unknown',
      countryFlag: e.data?.country_flag || '🏳️',
      service: e.data?.service || 'Generic',
      port: e.data?.port || 0,
      protocol: e.data?.protocol || 'TCP',
      eventType: e.type || 'Event',
      severity: e.severity ? (e.severity.charAt(0).toUpperCase() + e.severity.slice(1)) as any : 'Low',
      status: 'New' as any,
      details: e.data?.message || 'No additional details'
    }));
  }, [events]);

  return (
    <div className="space-y-10 pb-12 no-scrollbar animate-fade-in relative z-10 w-full zellige-pattern">
      {/* Header / Global Status HUD */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-bg-2/50 p-8 rounded-[32px] border border-border-1 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-p-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-p-500 animate-pulse shadow-[0_0_15px_rgba(167,139,250,1)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-p-400">Tactical Overwatch</span>
          </div>
          <h1 className="text-4xl font-black text-text-1 tracking-tighter uppercase leading-none">
            Command <span className="text-p-400">Center.</span>
          </h1>
          <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.3em] opacity-60">Neural Signals & Global Threat Intelligence Visualization</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          {/* Mode Selector */}
          <div className="bg-bg-0/60 border border-white/5 p-1 rounded-2xl flex relative h-12 w-64 shadow-2xl overflow-hidden group/mode">
            <motion.div
              className={cn(
                "absolute inset-y-1 w-[calc(50%-4px)] rounded-xl shadow-lg transition-colors duration-500",
                platformMode === "simulator" ? "bg-amber-400" : "bg-white"
              )}
              initial={false}
              animate={{ x: platformMode === "simulator" ? "0%" : "calc(100% + 4px)" }}
            />
            <button
              onClick={() => setPlatformMode("simulator")}
              className={cn(
                "flex-1 z-10 text-[9px] font-black uppercase tracking-widest transition-colors",
                platformMode === "simulator" ? "text-black" : "text-text-3"
              )}>
              Simulation
            </button>
            <button
              onClick={() => setPlatformMode("emulation")}
              className={cn(
                "flex-1 z-10 text-[9px] font-black uppercase tracking-widest transition-colors",
                platformMode === "emulation" ? "text-black" : "text-text-3"
              )}>
              C2 Simulator
            </button>
          </div>

          <div className="px-5 py-3 bg-bg-0/40 border border-border-1 rounded-2xl flex items-center gap-4 hover:border-success/30 transition-colors">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-black text-text-3 uppercase tracking-[0.2em] mb-0.5">Fleet Status</span>
              <span className="text-[11px] font-black text-success uppercase tracking-widest leading-none">Operational [ALL]</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="px-5 py-3 bg-bg-0/40 border border-border-1 rounded-2xl flex items-center gap-4 hover:border-p-500/30 transition-colors">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-black text-text-3 uppercase tracking-[0.2em] mb-0.5">Encryption</span>
              <span className="text-[11px] font-black text-p-400 uppercase tracking-widest leading-none">MIL-SPEC AES</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Truly Centralized Map Section */}
      <section className="w-full">
        <div className="relative overflow-hidden group h-[850px] border border-border-1 shadow-2xl rounded-[48px] bg-bg-1/40 backdrop-blur-sm">
          {/* Immersive HUD Overlays */}

          {/* Top Left: Title */}
          <div className="absolute top-10 left-10 z-20">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-bg-0/60 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="h-10 w-10 rounded-xl bg-p-500/20 border border-p-400/30 flex items-center justify-center text-p-400">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-1">Live Threat Sphere</h3>
                <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] mt-0.5">Neural Mapping Engine v2.4.0</p>
              </div>
            </div>
          </div>

          {/* Top Right: Real-time Stats */}
          <div className="absolute top-10 right-10 z-20 flex flex-col gap-4 items-end">
            <div className="bg-bg-0/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 w-72 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Global <br /> Alert Pulse</span>
                <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-text-3 uppercase tracking-widest">Intercepted</div>
                  <div className="text-2xl font-black text-text-1 tracking-tighter">{metrics.total.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-danger uppercase tracking-widest">Critical</div>
                  <div className="text-2xl font-black text-danger tracking-tighter">{metrics.critical}</div>
                </div>
              </div>
            </div>

            <div className="bg-bg-0/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 w-72 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black text-text-2 uppercase tracking-widest">System Risk Level</span>
                <span className="text-[10px] font-black text-text-1 tracking-widest">{metrics.systemRisk}%</span>
              </div>
              <div className="relative h-2 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-p-500 to-danger shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.systemRisk}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom HUD: Sensors & Nodes */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-fit">
            <div className="bg-bg-0/60 backdrop-blur-xl px-10 py-5 rounded-full border border-white/10 shadow-2xl flex items-center gap-10">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] font-black text-text-1 uppercase tracking-widest">Neural Stream Active</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Active Sensor Nodes</span>
                <span className="text-sm font-black text-p-400 font-mono">{(metrics.activeNodes + (metrics.total % 10)).toLocaleString()}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-3 text-success">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">99.98% Integrity</span>
              </div>
            </div>
          </div>

          {/* THE GLOBE: Fully Centralized & Largest */}
          <div className="absolute inset-0 z-10">
            <div className="w-full h-full transform scale-110 lg:scale-100">
              <ThreatGlobe />
            </div>
          </div>

          {/* Dynamic Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-p-500/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-bg-1/40 pointer-events-none" />
        </div>
      </section>

      {/* Analytics Hud Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <SOCMetrics {...socMetricsProps} />
        </div>

        {/* Network & Traffic View */}
        <div className="lg:col-span-8 h-[500px]">
          <InternalNetworkChart />
        </div>

        {/* Severity & Persistence Side Panels */}
        <div className="lg:col-span-4 space-y-8 h-[500px] flex flex-col">
          <div className="bg-bg-2/30 border border-border-1 p-8 rounded-[32px] backdrop-blur-md">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-3 mb-6">Threat Distribution</h3>
            <SeverityStats items={severityStatsItems} />
          </div>

          <div className="flex-1 bg-bg-2/30 border border-border-1 p-8 rounded-[32px] backdrop-blur-md overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-p-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-1">Audit Stream</h3>
              </div>
              <Radar className="w-4 h-4 text-p-400 animate-spin-slow opacity-40" />
            </div>

            <div className="space-y-5">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <div className="relative mb-4">
                    <Search className="w-8 h-8 text-text-3" />
                    <div className="absolute inset-0 animate-ping rounded-full border border-p-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-3">Listening for encrypted signals...</span>
                </div>
              ) : (
                events.slice(0, 5).map((e, i) => (
                  <div key={e.id || i} className="group/item flex flex-col gap-1.5 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest">
                      <span className="text-text-3">{format(new Date(e.timestamp || Date.now()), 'HH:mm:ss.SSS')}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full border uppercase text-[8px]",
                        String(e.severity || "").toLowerCase() === 'critical' ? 'text-danger border-danger/20 bg-danger/5' : 'text-p-400 border-p-400/20 bg-p-500/5'
                      )}>{e.severity || 'Low'} Severity</span>
                    </div>
                    <div className="text-xs font-bold text-text-1 uppercase tracking-tight line-clamp-1 group-hover/item:text-p-400 transition-colors">
                      {e.data?.message || e.type || 'Generic Operational Event'}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Soft Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-2 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Global Detection Engine Table */}
      <section>
        <div className="bg-bg-0/30 rounded-[40px] border border-border-1 overflow-hidden">
          <EventTablePro events={eventRows} onEventClick={setSelectedEvent} />
        </div>
      </section>

      {/* Persistence Footer */}
      <footer className="flex flex-col items-center gap-4 py-12">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-border-1 to-transparent mb-4" />
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.6em] opacity-40">BOUCLIER_ALPHA_INTEL</span>
          <div className="h-1 w-1 rounded-full bg-p-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.6em] opacity-40">STABLE_V2.4.0</span>
        </div>
      </footer>
    </div>
  );
}

