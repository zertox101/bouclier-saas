"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Shield, Activity, Zap, Crosshair, 
  Target, Info, RefreshCw, Maximize2, ShieldAlert,
  Cpu, Map as MapIcon, Radio, Terminal, Search,
  Lock, ZapOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { apiClient } from '@/lib/api-client';

export default function WorldMonitorPage() {
  const [activeAttacks, setActiveAttacks] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastIncident, setLastIncident] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({ total: 0, critical: 0, high: 0 });
  const notifiedIds = useRef(new Set<string>());
  const { notify } = useNotificationContext();

  const fetchRealThreats = async () => {
    try {
      const [pointsData, feedData] = await Promise.all([
        apiClient('/api/map/points?limit=50').catch(() => null),
        apiClient('/api/map/live-feed?limit=10').catch(() => null),
      ]);
      if (pointsData) {
        const arcs = pointsData.points
          .filter((p: any) => p.lat && p.lng)
          .map((p: any) => ({
            from: [p.lng, p.lat],
            to: [2.35, 48.85],
            type: p.attack_type || "UNKNOWN",
            severity: p.severity === "Critique" ? "Critical" : p.severity === "Élevé" ? "High" : "Medium",
            color: p.severity === "Critique" ? "#ff1f1f" : p.severity === "Élevé" ? "#ff4d4f" : "#faad14",
            src_ip: p.source_ip,
            country: p.country,
          }));
        setActiveAttacks(arcs);
        setLiveStats({ total: pointsData.total || 0, critical: pointsData.critical || 0, high: pointsData.high || 0 });
      }
      if (feedData && feedData.feed && feedData.feed.length > 0) {
        setLastIncident(feedData.feed[0]);
      }
    } catch (e) {
      console.error("World Monitor: Failed to fetch real threat data:", e);
    }
  };

  useEffect(() => {
    fetchRealThreats();
    const interval = setInterval(fetchRealThreats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Notification system: Notify on new critical/high attacks
  useEffect(() => {
    activeAttacks.forEach(attack => {
      const attackId = `${attack.src_ip}-${attack.type}`;
      
      // Only notify for Critical and High severity
      if ((attack.severity === 'Critical' || attack.severity === 'High') && !notifiedIds.current.has(attackId)) {
        notify({
          id: attackId,
          type: attack.type,
          severity: attack.severity === 'Critical' ? 'CRITICAL' : 'HIGH',
          message: `${attack.type} detected from ${attack.country || 'Unknown'}`,
          src_ip: attack.src_ip,
          country: attack.country || 'Unknown',
          timestamp: new Date().toISOString()
        });
        notifiedIds.current.add(attackId);
      }
    });

    // Clean up old IDs (keep only last 100)
    if (notifiedIds.current.size > 100) {
      const idsArray = Array.from(notifiedIds.current);
      notifiedIds.current = new Set(idsArray.slice(-100));
    }
  }, [activeAttacks, notify]);

  const chartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    geo: {
      map: 'world',
      roam: true,
      silent: true,
      itemStyle: {
        areaColor: '#0a0a0f',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
      },
      emphasis: { disabled: true }
    },
    series: [
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.4,
          color: '#fff',
          symbolSize: 3,
        },
        lineStyle: {
          color: (params: any) => params.data.color,
          width: 1,
          opacity: 0.1,
          curveness: 0.3
        },
        data: activeAttacks.map(a => ({
          coords: [a.from, a.to],
          color: a.color
        }))
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
          brushType: 'stroke',
          scale: 4,
          period: 4
        },
        label: { show: false },
        itemStyle: { color: '#ff4d4f' },
        data: activeAttacks.map(a => ({
          name: a.type,
          value: [...a.to, 100],
        }))
      }
    ]
  }), [activeAttacks]);

  return (
    <div className="h-full bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-cyan-600/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="h-full flex flex-col relative z-10">
        
        {/* ── Tactical Header ── */}
        <header className="h-24 flex items-center justify-between px-10 border-b border-white/5 bg-black/40 backdrop-blur-3xl shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="absolute -inset-4 bg-cyan-600/20 rounded-full blur-2xl group-hover:bg-cyan-600/30 transition-all animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-black border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Globe className="w-8 h-8 animate-spin-slow" />
                </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase leading-none italic">GAIA_3D_MATRIX</h1>
              <div className="flex items-center gap-3 mt-3 font-mono">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Global_Satellite_Uplink // Stream_Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Global Node Status</div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Synchronized</span>
                </div>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="flex items-center gap-3">
                <button className="p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] transition-all text-slate-400 hover:text-white">
                    <RefreshCw className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-lg shadow-cyan-600/20">
                    Deploy_Sensors
                </button>
            </div>
          </div>
        </header>

        {/* ── Main Monitor Area ── */}
        <main className="flex-1 relative p-8">
          
          <div className="absolute inset-0 z-0">
             <ReactECharts
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                onEvents={{
                  'click': (params: any) => console.log(params)
                }}
             />
          </div>

          <div className="absolute top-8 left-10 w-96 space-y-6 z-10">
             <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.05] to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-4">
                   <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Live_Threat_Intercepts
                </h3>
                <div className="space-y-4">
                   {activeAttacks.length === 0 ? (
                     <div className="text-center text-slate-600 font-mono text-[10px] uppercase py-4">Waiting for real traffic data...</div>
                   ) : (
                     activeAttacks.slice(0, 5).map((attack, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group/item"
                       >
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-mono font-black text-red-500 uppercase">{attack.type}</span>
                             <span className={cn(
                               "text-[7px] font-black px-2 py-0.5 rounded-full border",
                               attack.severity === 'Critical' ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-orange-500/10 border-orange-500/30 text-orange-500"
                             )}>{attack.severity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attack.country || attack.src_ip || 'UNKNOWN'}</span>
                             </div>
                             <span className="text-[9px] font-mono text-slate-600">{attack.src_ip}</span>
                          </div>
                       </motion.div>
                     ))
                   )}
                </div>
             </div>

             <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-3">
                   <Activity className="w-4 h-4" /> Detection_Telemetry
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   {[
                      { label: "Attackers", val: liveStats.total, icon: Target, color: "text-red-500" },
                      { label: "Active Arcs", val: activeAttacks.length, icon: Zap, color: "text-cyan-500" },
                      { label: "Critical", val: liveStats.critical, icon: Radio, color: "text-red-400" },
                      { label: "High Risk", val: liveStats.high, icon: Activity, color: "text-orange-400" }
                   ].map(s => (
                      <div key={s.label} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <div className="text-[8px] font-black text-slate-600 uppercase mb-1">{s.label}</div>
                         <div className={cn("text-lg font-black italic", s.color)}>{s.val}</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* ── Right Overlay: Tactical Analysis ── */}
          <div className="absolute top-8 right-10 w-96 space-y-6 z-10">
             <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-4 italic">
                   <Cpu className="w-5 h-5 text-cyan-500" /> Live_Threat_Feed
                </h3>
                <div className="space-y-6">
                   {lastIncident ? (
                     <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl">
                       <div className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-2">Last_Incident_Detected</div>
                       <div className="text-sm text-white font-black leading-relaxed italic opacity-80 uppercase tracking-tighter">
                         {lastIncident.attack_type} from {lastIncident.source_country || lastIncident.source_ip || 'Unknown'}
                       </div>
                       <div className="text-[9px] font-mono text-slate-500 mt-2">{lastIncident.source_ip}</div>
                     </div>
                   ) : (
                     <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                       <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No real incidents yet — monitoring active</div>
                     </div>
                   )}
                </div>
             </div>

             <div className="bg-black/60 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 h-[300px] flex flex-col font-mono shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/40" />
                   </div>
                   <span className="text-[8px] font-black text-slate-600 uppercase">SAT_INTEL_STREAM</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] space-y-1">
                   <p className="text-cyan-500">[SYSTEM] RESOLVING_COORD: {lastIncident ? lastIncident.from.join(',') : 'INIT'}</p>
                   <p className="text-slate-500">[GEO] ENUMERATING_ATTACK_SOURCE: RUSSIA_MOSCOW</p>
                   <p className="text-red-500 font-black">[ALERT] ARC_DETECTED: TARGETING_DC_FR_PARIS</p>
                   <p className="text-slate-500">[INTEL] SIGNATURE_MATCH: WANNACRY_RELIANT_v4</p>
                   <p className="text-cyan-500">[SYSTEM] AUTO_MITIGATION_DEPLOYED: Node_112</p>
                   <p className="text-white animate-pulse">_</p>
                </div>
             </div>
          </div>

          {/* ── Bottom Overlay: Status Bar ── */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl flex items-center gap-6 px-10 z-10">
             <div className="flex-1 h-20 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full flex items-center px-10 gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 shrink-0">
                   <Lock className="w-5 h-5 text-emerald-500" />
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-500 uppercase">System Integrity</span>
                      <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Absolute_Lockdown</span>
                   </div>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex-1 flex items-center justify-center gap-10">
                   {[
                      { label: "Active Sensors", val: "84/84", color: "text-cyan-400" },
                      { label: "Data Throughput", val: "2.4 GB/s", color: "text-blue-400" },
                      { label: "Orbital Sync", val: "99.9%", color: "text-emerald-400" }
                   ].map(s => (
                      <div key={s.label} className="flex flex-col items-center">
                         <span className="text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">{s.label}</span>
                         <span className={cn("text-[11px] font-black uppercase italic", s.color)}>{s.val}</span>
                      </div>
                   ))}
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-4 shrink-0">
                   <span className="text-[10px] font-black text-red-500 animate-pulse uppercase tracking-[0.2em] italic">Red_Alert_Active</span>
                   <button className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                      <ZapOff className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>

        </main>

      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .animate-spin-slow { animation: spin 30s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
