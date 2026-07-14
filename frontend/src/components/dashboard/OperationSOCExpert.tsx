"use client";
import React, { useEffect, useState, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { 
  Shield, Activity, Zap, Lock, Globe, Server, Link2, ShieldCheck, 
  Radio, Cpu, Wifi, Database, MoreVertical, Download, RefreshCw, 
  Trash2, Settings, Target, Map as MapIcon, ChevronRight, Binary
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SummaryData {
  total_alerts_24h: number;
  priority: { critical: number; high: number; medium: number; low: number };
  kill_chain: { stage: string; count: number }[];
  sources: { name: string; count: number }[];
  top_countries: { country: string; alerts: number }[];
  latest_alerts: { 
    id: number; 
    time: string; 
    severity: string; 
    source: string; 
    description: string; 
    status: string;
    mitre_id?: string;
    src_ip?: string;
  }[];
  risk_score: number;
  active_incidents: { Critical: number; High: number; Medium: number; Low: number };
  hourly_trend: { t: string; critical: number; high: number; medium: number; low: number }[];
  daily_trend: { day: string; count: number }[];
  attack_types: { name: string; count: number }[];
  industry_stats: { label: string; icon: string; val: number }[];
  sla_percent: number;
  ai_metrics?: {
    is_fitted: boolean;
    accuracy: number;
    total_trained: number;
  };
}

const SEV_COLOR: Record<string, string> = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22d3ee" };
const KC_ICONS = ["🔍","⚙️","📦","💥","🖥️","📡","🎯"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[32px] border border-white/5 bg-[#0a0a0f] p-6 ${className} shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
      {children}
    </div>
  );
}

function STitle({ children, icon: Icon, onExport, onRefresh, menuActive, setMenu }: { children: string; icon?: any; onExport?: () => void; onRefresh?: () => void; menuActive: boolean; setMenu: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-6 relative">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-blue-500" />}
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{children}</p>
      </div>
      <div className="relative">
        <button 
          onClick={() => setMenu(!menuActive)}
          className={cn("p-1.5 rounded-lg transition-all", menuActive ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/5 text-slate-600")}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {menuActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0f] border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] overflow-hidden"
            >
               <button onClick={onRefresh} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-all group text-left">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Refresh Data</span>
               </button>
               <button onClick={onExport} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-all group text-left">
                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Export CSV</span>
               </button>
               <div className="h-px bg-white/5 my-1" />
               <button onClick={() => setMenu(false)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 rounded-xl transition-all group text-left">
                  <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-400">Clear View</span>
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OperationSOCExpert() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const json: SummaryData = await apiClient('/api/soc-expert/summary');
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleExportCSV = (widgetName: string) => {
    if (!data) return;
    const content = widgetName === 'Latest Alerts' 
      ? data.latest_alerts.map(a => `${a.time},${a.severity},${a.source},${a.description}`).join('\n')
      : JSON.stringify(data);
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_export_${widgetName.toLowerCase().replace(' ', '_')}.csv`;
    a.click();
    setActiveMenu(null);
  };

  const dateStr = now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB");

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.3)]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

      {/* TACTICAL HEADER */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-black/40 backdrop-blur-3xl shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] italic font-black">N</div>
          <div>
            <p className="text-xl font-black text-white leading-none uppercase tracking-[0.2em] italic">Nexus_AI_SOC_Command</p>
            <p className="text-[10px] text-emerald-500 font-bold tracking-[0.3em] uppercase mt-2">Level_4_Tactical_Control // Operational_State_Stable</p>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
            <div className="flex flex-col items-end">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Neural Node Status</p>
                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-tighter italic">System_Synchronized</span>
                </div>
            </div>
            <div className="text-right border-l border-white/10 pl-8">
                <p className="text-[12px] text-slate-500 font-mono font-black italic">{dateStr}</p>
                <p className="text-2xl text-white font-mono font-black italic tracking-tighter">{timeStr}</p>
            </div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-auto custom-scrollbar relative z-10">
        <div className="grid grid-cols-4 gap-8">
          
          {/* Global Threat Flux */}
          <Card className="flex flex-col group">
            <STitle 
              icon={Activity} 
              menuActive={activeMenu === 'Threat Flux'} 
              setMenu={(v) => setActiveMenu(v ? 'Threat Flux' : null)}
              onExport={() => handleExportCSV('Threat Flux')}
              onRefresh={fetchData}
            >Global_Threat_Flux</STitle>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                 <motion.p key={data?.total_alerts_24h} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black text-white italic tracking-tighter leading-none">
                   {data?.total_alerts_24h || 0}
                 </motion.p>
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                   <Zap className="w-3 h-3" /> 98.4% Accuracy Intercept
                 </p>
              </div>
              <div className="h-24 w-full mt-6 -mx-4">
                <ReactECharts option={{ grid: { top: 0, bottom: 0, left: 0, right: 0 }, xAxis: { type: 'category', show: false }, yAxis: { type: 'value', show: false }, series: [{ data: (data?.hourly_trend || []).map(h => h.critical + h.high), type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ef4444', width: 4, shadowBlur: 20, shadowColor: 'rgba(239, 68, 68, 0.5)' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(239, 68, 68, 0.3)' }, { offset: 1, color: 'transparent' }]) } }] }} style={{ height: '100%', width: 'calc(100% + 32px)' }} />
              </div>
            </div>
          </Card>

          {/* Cyber Kill Chain */}
          <Card className="col-span-3">
            <STitle 
              icon={Shield} 
              menuActive={activeMenu === 'Kill Chain'} 
              setMenu={(v) => setActiveMenu(v ? 'Kill Chain' : null)}
              onExport={() => handleExportCSV('Kill Chain')}
              onRefresh={fetchData}
            >Cyber_Kill_Chain_Analysis</STitle>
            <div className="relative mt-8 h-32 flex items-center justify-between px-10">
              {(data?.kill_chain || []).map((kc, i) => (
                <motion.div key={kc.stage} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                  <div className={cn("w-16 h-16 rounded-[24px] border-2 flex items-center justify-center relative transition-all duration-500", kc.count > 0 ? "border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-white/5 bg-white/[0.02] opacity-20")}>
                      <span className="text-2xl">{KC_ICONS[i]}</span>
                      {kc.count > 0 && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-full border-4 border-[#0a0a0f] text-[10px] font-black flex items-center justify-center">{kc.count}</span>}
                  </div>
                  <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500">{kc.stage}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Neural Honeypot */}
          <Card className="col-span-2 group">
              <STitle 
                icon={Radio}
                menuActive={activeMenu === 'Honeypot'} 
                setMenu={(v) => setActiveMenu(v ? 'Honeypot' : null)}
                onExport={() => handleExportCSV('Honeypot')}
                onRefresh={fetchData}
              >Neural_Honeypot_Countermeasures</STitle>
              <div className="grid grid-cols-2 gap-6 h-full py-2">
                  <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                      <div className="flex justify-between items-start mb-6">
                          <Wifi className="w-8 h-8 text-blue-500 animate-pulse" />
                          <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decoy_Nodes</p>
                              <p className="text-2xl font-black text-white italic">14 Active</p>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span>Engagement_Rate</span>
                              <span className="text-blue-400">82.4%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: '82.4%' }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                          </div>
                      </div>
                  </div>

                  <div className="bg-red-600/5 border border-red-500/10 rounded-3xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all">
                      <div className="flex justify-between items-start mb-6">
                          <Zap className="w-8 h-8 text-red-500 animate-bounce" />
                          <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active_Riposte</p>
                              <p className="text-2xl font-black text-red-500 italic">STANDBY</p>
                          </div>
                      </div>
                      <button className="mt-4 w-full py-4 bg-red-600/10 border border-red-500/20 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                          AUTHORIZE_COUNTERSTRIKE
                      </button>
                  </div>
              </div>
          </Card>

          {/* Auto Shield */}
          <Card className="col-span-2">
              <STitle 
                icon={ShieldCheck}
                menuActive={activeMenu === 'Shield'} 
                setMenu={(v) => setActiveMenu(v ? 'Shield' : null)}
                onExport={() => handleExportCSV('Shield')}
                onRefresh={fetchData}
              >Auto_Shield_Protocol</STitle>
              <div className="flex items-center gap-10 h-full py-2 px-6">
                  <div className="relative w-40 h-40 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${data?.sla_percent || 99} 100`} strokeLinecap="round" className="shadow-[0_0_20px_#10B981]" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-4xl font-black italic tracking-tighter text-white">{data?.sla_percent || 99.4}<span className="text-sm ml-1">%</span></p>
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Shield_Active</p>
                      </div>
                  </div>
                  <div className="flex-1 space-y-4">
                      {[
                          { label: "Neural Firewall", val: "ACTIVE", icon: Lock, color: "text-blue-500" },
                          { label: "Intrusion Prevention", val: "ENABLED", icon: Cpu, color: "text-emerald-500" },
                          { label: "Signature Sync", val: "128k+", icon: Database, color: "text-amber-500" },
                          { label: "Zero-Day Shield", val: "LOCKED", icon: ShieldCheck, color: "text-cyan-500" }
                      ].map(stat => (
                          <div key={stat.label} className="flex items-center justify-between group/stat">
                              <div className="flex items-center gap-3">
                                  <stat.icon className={cn("w-3.5 h-3.5 opacity-50 group-hover/stat:opacity-100 transition-opacity", stat.color)} />
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                              </div>
                              <span className={cn("text-[10px] font-black italic", stat.color)}>{stat.val}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </Card>

          {/* Risk Composite */}
          <Card className="flex flex-col items-center">
              <STitle 
                icon={Target}
                menuActive={activeMenu === 'Risk'} 
                setMenu={(v) => setActiveMenu(v ? 'Risk' : null)}
                onExport={() => handleExportCSV('Risk')}
                onRefresh={fetchData}
              >Risk_Composite</STitle>
              <div className="flex-1 w-full -mt-4">
                <ReactECharts option={{ series: [{ type: 'gauge', axisLine: { lineStyle: { width: 8, color: [[0.3, '#10b981'], [0.7, '#f59e0b'], [1, '#ef4444']] } }, pointer: { itemStyle: { color: 'auto' } }, detail: { fontSize: 32, fontWeight: 'black', color: 'inherit', offsetCenter: [0, '70%'], formatter: '{value}%' }, data: [{ value: data?.risk_score || 82 }] }] }} style={{ height: '100%', width: '100%' }} />
              </div>
          </Card>

          {/* Recent Alerts Feed */}
          <Card className="col-span-3">
             <STitle 
               icon={Activity}
               menuActive={activeMenu === 'Latest Alerts'} 
               setMenu={(v) => setActiveMenu(v ? 'Latest Alerts' : null)}
               onExport={() => handleExportCSV('Latest Alerts')}
               onRefresh={fetchData}
             >Latest_Tactical_Alerts</STitle>
             <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {(data?.latest_alerts || []).map((alert) => (
                   <div key={alert.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-2 h-10 rounded-full", alert.severity === 'Critical' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-orange-500")} />
                         <div>
                            <p className="text-[12px] font-black text-white italic">{alert.description}</p>
                            <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">{alert.time} // SRC: {alert.src_ip || 'Internal'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", alert.severity === 'Critical' ? "text-red-500" : "text-orange-500")}>{alert.severity}</p>
                         <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">Details</button>
                      </div>
                   </div>
                ))}
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
