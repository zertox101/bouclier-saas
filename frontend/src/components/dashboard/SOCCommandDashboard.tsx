"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Shield, Activity, Zap, Lock, Globe, Server, Link2, ShieldCheck, 
  Radio, Cpu, Wifi, Database, MoreVertical, Download, RefreshCw, 
  Trash2, Settings, Target, Map as MapIcon, ChevronRight, Binary,
  Bell, User, LayoutDashboard, AlertTriangle, Briefcase, Search,
  Box, FileText, Bug, Mail, Key, Network, MousePointer2, ExternalLink,
  CheckCircle2, XCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from '@/lib/api-client';

// --- Types ---
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
    src_lat?: number;
    src_lon?: number;
    source_country?: string;
    intelligence?: string;
  }[];
  risk_score: number;
  active_incidents: { Critical: number; High: number; Medium: number; Low: number };
  hourly_trend: { t: string; critical: number; high: number; medium: number; low: number }[];
  daily_trend: { day: string; count: number }[];
  attack_types: { name: string; count: number }[];
  industry_stats: { label: string; icon: string; val: number }[];
  ai_metrics?: {
    is_fitted: boolean;
    accuracy: number;
    total_trained: number;
    inference_ms: number;
  };
  sla_percent: number;
  top_talkers?: { ip: string; count: number }[];
  geo_points?: { name: string; value: [number, number, number]; severity: string }[];
}

// Helper components for icons
const Monitor = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);
const Package = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
);
const Megaphone = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.8 6c.4 0 .7.3.7.7v10.6c0 .4-.3.7-.7.7H17l-3.3-3.3H5.7C5.3 14.7 5 14.4 5 14V10c0-.4.3-.7.7-.7h8L17 6h1.8zM17 14.7V9.3l-2.7 2.7L17 14.7z"/></svg>
);

const KC_ICONS: Record<string, any> = {
  "Reconnaissance": Search,
  "Weaponization": Bug,
  "Delivery": Box,
  "Exploitation": Monitor,
  "Installation": Package,
  "Command & Control": Megaphone,
  "Actions on Objectives": Target
};

export default function SOCCommandDashboard() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [selectedAlert, setSelectedAlert] = useState<SummaryData['latest_alerts'][0] | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const json = await apiClient('/api/soc-expert/summary');
      if (json.error) throw new Error(json.error);
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
    const t_data = setInterval(fetchData, 10000);
    const t_time = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(t_data);
      clearInterval(t_time);
    };
  }, [fetchData]);

  const handleAlertAction = async (alertId: number, source: string, action: string) => {
    try {
      await apiClient('/api/soc-expert/action', {
        method: "POST",
        body: JSON.stringify({ alert_id: alertId, source, action })
      });
      fetchData();
      setSelectedAlert(null);
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  if (loading && !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#080B12] text-white">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">Initializing SOC Command...</p>
    </div>
  );

  if (error && !data) return (
    <div className="h-screen flex items-center justify-center bg-[#080B12] text-white">
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 max-w-xl">
        <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-red-500 text-lg uppercase tracking-widest">Failed to initialize SOC Command</h3>
          <p className="text-sm text-red-400 mt-2 font-mono">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#080B12] text-white overflow-hidden font-sans">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-[#0A0E16] border-r border-white/5 flex flex-col py-8 shrink-0 relative z-50">
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">SOC</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bouclier v4.0</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1 px-3">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/operation-soc-expert" active />
          <SidebarItem icon={Bell} label="Alerts Feed" href="/alerts" />
          <SidebarItem icon={Briefcase} label="Incidents" href="/incidents" />
          <SidebarItem icon={Zap} label="Threat Intelligence" href="/threat-monitor" />
          <SidebarItem icon={Search} label="Neural Hunt" href="/analysis" />
          <SidebarItem icon={Box} label="Evidence Cases" href="/cases" />
          <SidebarItem icon={ShieldCheck} label="Asset Inventory" href="/assets" />
          <SidebarItem icon={FileText} label="Reports" href="/reports" />
          <SidebarItem icon={Settings} label="SOC Settings" href="/settings" />
        </nav>
        
        <div className="mt-auto px-6 space-y-6">
           <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
             <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Node Connectivity</p>
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[11px] font-bold text-emerald-500">Uplink Stable (99.9%)</span>
             </div>
           </div>

           <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-blue-500/50">
               <User className="w-5 h-5 text-slate-400" />
             </div>
             <div className="flex-1">
               <p className="text-[11px] font-bold">SOC Analyst</p>
               <p className="text-[9px] text-slate-500 font-mono tracking-tighter">OP-ID: 772-X</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- Main Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glow background effects */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />

        {/* --- Top Header --- */}
        <header className="h-20 flex items-center justify-between px-8 bg-[#080B12]/80 backdrop-blur-md z-10 border-b border-white/5">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Alerts (24h)</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{data?.total_alerts_24h || 0}</span>
                <span className="text-[9px] text-emerald-500 font-bold">+12%</span>
              </div>
            </div>
            {['Critical', 'High', 'Medium', 'Low'].map(sev => (
              <div key={sev} className="flex flex-col border-l border-white/10 pl-6">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{sev}</p>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xl font-bold", {
                    "text-red-500": sev === 'Critical',
                    "text-orange-500": sev === 'High',
                    "text-amber-500": sev === 'Medium',
                    "text-blue-500": sev === 'Low'
                  })}>
                    {data?.priority[sev.toLowerCase() as keyof typeof data.priority] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6">
             {error && (
               <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                 <AlertTriangle className="w-4 h-4 text-red-500" />
                 <span className="text-[10px] font-bold text-red-500 uppercase">{error}</span>
               </div>
             )}
             <div className="text-right border-r border-white/10 pr-6 mr-6">
               <p className="text-lg font-bold font-mono tracking-tighter">{timeStr}</p>
               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{dateStr}</p>
             </div>
             <div className="flex gap-2">
               <HeaderButton icon={Bell} badge="3" />
               <HeaderButton icon={Settings} onClick={() => router.push('/settings')} />
               <HeaderButton icon={RefreshCw} onClick={fetchData} />
             </div>
          </div>
        </header>

        {/* --- Dashboard Content --- */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
          
          <div className="grid grid-cols-4 gap-6">
            {/* Kill Chain Section */}
            <div className="col-span-3">
              <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8 h-[420px] relative overflow-hidden shadow-2xl flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(239,68,68,0.06)_0%,transparent_60%)] pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                      <Zap className="w-4 h-4 text-red-500" />
                      MITRE ATT&CK — KILL CHAIN ANALYSIS
                    </h3>
                    <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-widest">Unified Cyber Kill Chain v2 · Real-time Threat Correlation Engine</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                        {data?.kill_chain.reduce((a,b)=>a+b.count,0)} Active Threat Indicators
                      </span>
                    </div>
                    <div className="bg-[#0a0e14] border border-white/5 px-3 py-1.5 rounded-full">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CICIDS-2017 · MITRE ATT&CK v14</span>
                    </div>
                  </div>
                </div>

                {/* Stage Grid */}
                <div className="flex-1 grid grid-cols-7 gap-2 relative z-10 overflow-hidden">
                  {(() => {
                    const STAGE_META: Record<string, {
                      mitre: string; tactic: string; color: string;
                      ttp: string[]; indicator: string; border: string;
                    }> = {
                      "Reconnaissance": {
                        mitre: "TA0043", tactic: "Recon",
                        color: "text-blue-400", border: "border-blue-500/30",
                        ttp: ["T1595", "T1592", "T1589"],
                        indicator: "Port scanning / OSINT",
                      },
                      "Weaponization": {
                        mitre: "TA0001", tactic: "Resource Dev",
                        color: "text-purple-400", border: "border-purple-500/30",
                        ttp: ["T1588", "T1587", "T1608"],
                        indicator: "Malware crafting / C2 infra",
                      },
                      "Delivery": {
                        mitre: "TA0001", tactic: "Initial Access",
                        color: "text-yellow-400", border: "border-yellow-500/30",
                        ttp: ["T1566", "T1190", "T1133"],
                        indicator: "Phishing / Exploit pubApp",
                      },
                      "Exploitation": {
                        mitre: "TA0002", tactic: "Execution",
                        color: "text-orange-400", border: "border-orange-500/30",
                        ttp: ["T1059", "T1203", "T1068"],
                        indicator: "Script exec / Priv escalation",
                      },
                      "Installation": {
                        mitre: "TA0003", tactic: "Persistence",
                        color: "text-pink-400", border: "border-pink-500/30",
                        ttp: ["T1078", "T1053", "T1136"],
                        indicator: "Backdoor / Sched task / Acct",
                      },
                      "Command & Control": {
                        mitre: "TA0011", tactic: "C2",
                        color: "text-red-400", border: "border-red-500/40",
                        ttp: ["T1071", "T1095", "T1102"],
                        indicator: "Beaconing / DNS tunneling",
                      },
                      "Actions on Objectives": {
                        mitre: "TA0010", tactic: "Exfiltration",
                        color: "text-red-300", border: "border-red-400/50",
                        ttp: ["T1041", "T1048", "T1020"],
                        indicator: "Data exfil / Impact / Ransom",
                      },
                    };

                    return data?.kill_chain.map((node, i) => {
                      const meta = STAGE_META[node.stage] || {
                        mitre: "TA00??", tactic: "Unknown", color: "text-slate-400",
                        border: "border-white/10", ttp: [], indicator: "—"
                      };
                      const hasThreat = node.count > 0;
                      const isLast = i === (data?.kill_chain.length || 0) - 1;

                      return (
                        <div
                          key={node.stage}
                          className={cn(
                            "relative flex flex-col rounded-2xl border p-3 transition-all duration-300 cursor-default group/kc h-full",
                            hasThreat
                              ? `${meta.border} bg-gradient-to-b from-white/[0.03] to-black/20 shadow-[0_0_20px_rgba(239,68,68,0.08)]`
                              : "border-white/5 bg-white/[0.01] opacity-60 hover:opacity-90"
                          )}
                        >
                          {/* Stage number + arrow connector */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-[8px] font-black uppercase tracking-widest", hasThreat ? meta.color : "text-slate-600")}>
                              {String(i+1).padStart(2,'0')}
                            </span>
                            {hasThreat && (
                              <span className="w-4 h-4 rounded bg-red-600 text-white text-[8px] font-black flex items-center justify-center shadow-[0_0_8px_#ef4444]">
                                {node.count}
                              </span>
                            )}
                          </div>

                          {/* Stage Icon */}
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2 border",
                            hasThreat ? `bg-black/40 ${meta.border}` : "bg-black/20 border-white/5"
                          )}>
                            {(() => {
                              const Icon = KC_ICONS[node.stage] || Shield;
                              return <Icon className={cn("w-4 h-4", hasThreat ? meta.color : "text-slate-600")} />;
                            })()}
                          </div>

                          {/* Stage Name */}
                          <p className={cn("text-[9px] font-black uppercase leading-tight mb-1.5 tracking-tight",
                            hasThreat ? "text-white" : "text-slate-500"
                          )}>
                            {node.stage}
                          </p>

                          {/* MITRE ID */}
                          <div className={cn("text-[7px] font-mono px-1.5 py-0.5 rounded border self-start mb-2",
                            hasThreat ? `${meta.color} ${meta.border} bg-black/30` : "text-slate-700 border-white/5"
                          )}>
                            {meta.mitre}
                          </div>

                          {/* TTPs */}
                          <div className="space-y-0.5 mb-2">
                            {meta.ttp.slice(0,2).map(t => (
                              <div key={t} className={cn("text-[7px] font-mono", hasThreat ? "text-slate-400" : "text-slate-700")}>
                                · {t}
                              </div>
                            ))}
                          </div>

                          {/* Indicator */}
                          <div className="mt-auto">
                            <p className={cn("text-[7px] leading-tight italic",
                              hasThreat ? "text-slate-500" : "text-slate-700"
                            )}>
                              {meta.indicator}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className={cn(
                            "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                            hasThreat ? "bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" : "bg-slate-700"
                          )} />

                          {/* Arrow connector (between stages) */}
                          {!isLast && (
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-20">
                              <ChevronRight className={cn("w-3 h-3", hasThreat ? "text-red-500" : "text-slate-700")} />
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Severity & Categories Side Panel */}
            <div className="space-y-6">
              <div className="bg-[#0D121B] border border-white/5 rounded-[24px] p-6 h-[220px] flex flex-col">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest italic">Alerts by Severity</h4>
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-32 h-32">
                    <ReactECharts 
                      option={{
                        series: [{
                          type: 'pie',
                          radius: ['65%', '90%'],
                          avoidLabelOverlap: false,
                          label: { show: true, position: 'center', formatter: '{c}\nTotal', fontSize: 16, fontWeight: 'bold', color: '#fff' },
                          data: [
                            { value: data?.priority.critical, name: 'Critical', itemStyle: { color: '#EF4444' } },
                            { value: data?.priority.high, name: 'High', itemStyle: { color: '#F97316' } },
                            { value: data?.priority.medium, name: 'Medium', itemStyle: { color: '#F59E0B' } },
                            { value: data?.priority.low, name: 'Low', itemStyle: { color: '#3B82F6' } },
                          ]
                        }]
                      }} 
                      style={{ height: '100%', width: '100%' }} 
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    {['Critical', 'High', 'Medium', 'Low'].map((label) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", {
                             "bg-red-500": label === 'Critical',
                             "bg-orange-500": label === 'High',
                             "bg-amber-500": label === 'Medium',
                             "bg-blue-500": label === 'Low'
                          })} />
                          <span className="text-[10px] font-bold text-slate-400">{label}</span>
                        </div>
                        <span className="text-[10px] font-bold">{data?.priority[label.toLowerCase() as keyof typeof data.priority] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0D121B] border border-white/5 rounded-[24px] p-6 h-[174px] flex flex-col">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest italic">Top Vectors</h4>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                  {data?.attack_types.slice(0, 4).map(cat => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 truncate w-32">{cat.name}</span>
                        <span>{cat.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.count/(data?.attack_types[0]?.count || 1))*100}%` }}
                          className="h-full bg-red-600" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-4 gap-6 pb-6">
            
            {/* Recent Alerts Feed */}
            <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-6 h-[450px] flex flex-col shadow-xl">
               <div className="flex justify-between items-center mb-6">
                 <h4 className="text-sm font-bold italic">Tactical Feed</h4>
                 <Link href="/alerts" className="text-[10px] text-red-500 font-bold hover:underline uppercase tracking-widest">Live Monitoring</Link>
               </div>
               <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide pr-2">
                 {data?.latest_alerts.map(alert => (
                   <div 
                    key={alert.id} 
                    onClick={() => setSelectedAlert(alert)}
                    className="flex items-center gap-4 group cursor-pointer bg-white/[0.02] p-3 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all"
                   >
                     <div className="relative">
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-black/40", {
                         "text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]": alert.severity === 'Critical',
                         "text-orange-500": alert.severity === 'High',
                         "text-amber-500": alert.severity === 'Medium',
                         "text-blue-500": alert.severity === 'Low'
                       })}>
                         <Bug className="w-5 h-5" />
                       </div>
                       <div className={cn("absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-[#0D121B]", {
                         "bg-red-500": alert.severity === 'Critical',
                         "bg-orange-500": alert.severity === 'High',
                         "bg-amber-500": alert.severity === 'Medium',
                         "bg-blue-500": alert.severity === 'Low'
                       })} />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-[11px] font-bold text-white group-hover:text-red-400 transition-colors truncate">{alert.description}</p>
                       <p className="text-[9px] text-slate-500 font-mono">{alert.src_ip || '10.0.0.1'}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-400">{alert.time}</p>
                       <p className={cn("text-[8px] font-black uppercase tracking-tighter", {
                         "text-red-500": alert.severity === 'Critical',
                         "text-orange-500": alert.severity === 'High',
                         "text-amber-500": alert.severity === 'Medium',
                         "text-blue-500": alert.severity === 'Low'
                       })}>{alert.severity}</p>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SIEM Integration</p>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">ONLINE</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   {['Sentinel', 'ML-Core', 'DDoS-Guard', 'OSINT-API'].map(s => (
                     <div key={s} className="bg-black/40 rounded-xl p-2 flex items-center justify-between border border-white/5">
                       <span className="text-[9px] text-slate-400 font-bold">{s}</span>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]" />
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Middle Section: Assets & AI */}
            <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-6 h-[450px] flex flex-col gap-8 shadow-xl">
              <div>
                <h4 className="text-sm font-bold mb-4 italic uppercase tracking-widest">Infiltration Targets</h4>
                <div className="space-y-4">
                  {data?.top_talkers?.slice(0, 5).map(talker => (
                    <div key={talker.ip} className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-400 font-mono">{talker.ip}</span>
                        <span>{talker.count} events</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(talker.count/(data?.top_talkers?.[0].count || 1))*100}%` }}
                          className="h-full bg-blue-500" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                 <h4 className="text-sm font-bold mb-4 italic uppercase tracking-widest">Neural Accuracy (AI)</h4>
                 <div className="flex-1 flex flex-col justify-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 shrink-0">
                         <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                           <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                           <motion.circle 
                            cx="18" cy="18" r="16" fill="none" stroke="#ef4444" strokeWidth="3" 
                            strokeDasharray={`${data?.ai_metrics?.accuracy || 98} 100`} strokeLinecap="round" 
                            className="drop-shadow-[0_0_8px_#ef4444]" 
                           />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-xl font-bold italic">{data?.ai_metrics?.accuracy || 98.4}<span className="text-[10px] ml-0.5">%</span></p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Acc.</p>
                         </div>
                      </div>
                      <div className="space-y-2 flex-1">
                         <div className="flex justify-between text-[10px] font-bold">
                           <span className="text-slate-500">Trained Samples</span>
                           <span className="text-white">{(data?.ai_metrics?.total_trained || 352444).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-bold">
                           <span className="text-slate-500">Inference Time</span>
                           <span className="text-emerald-500">1.2ms</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-bold">
                           <span className="text-slate-500">False Positive Rate</span>
                           <span className="text-blue-500">0.02%</span>
                         </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/ai-training')}
                      className="w-full py-3 bg-red-600/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      Optimize Neural Model
                    </button>
                 </div>
              </div>
            </div>

            {/* Right Section: Threat Map */}
            <div className="col-span-2 bg-[#0D121B] border border-white/5 rounded-[32px] p-6 h-[450px] flex flex-col relative overflow-hidden shadow-xl">
               <div className="flex justify-between items-center mb-6 relative z-10">
                 <h4 className="text-sm font-bold italic flex items-center gap-2">
                   <Globe className="w-5 h-5 text-blue-500" />
                   GLOBAL THREAT TELEMETRY
                 </h4>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-red-500 uppercase">Live Intercepts</span>
                    </div>
                 </div>
               </div>
               
               <div className="flex-1 relative mb-6">
                 {/* Dynamic Threat Map with Real Coordinates */}
                 <DynamicThreatMap data={data} />
               </div>

               <div className="h-[180px] border-t border-white/5 pt-6 overflow-hidden relative z-10">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-white/5">
                       <th className="pb-3">Source Region</th>
                       <th className="pb-3 text-center">Intensity</th>
                       <th className="pb-3 text-right">Anomaly Trend</th>
                     </tr>
                   </thead>
                   <tbody className="text-[11px] font-bold">
                     {data?.top_countries.slice(0, 5).map((row, i) => (
                       <tr key={row.country} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                         <td className="py-3 text-slate-300 flex items-center gap-3">
                           <span className="text-slate-600 font-mono">0{i+1}</span>
                           {row.country}
                         </td>
                         <td className="py-3 text-center">
                           <span className={cn("px-2 py-0.5 rounded text-[9px]", 
                             row.alerts > 100 ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                           )}>
                             {row.alerts} pts
                           </span>
                         </td>
                         <td className="py-3 text-right">
                           <div className="flex items-center justify-end">
                              <Sparkline color={i % 2 === 0 ? '#EF4444' : '#10B981'} />
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- Alert Details Side Panel --- */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[450px] h-full bg-[#0D121B] border-l border-white/10 z-[101] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", {
                      "bg-red-500/10 text-red-500 border border-red-500/20": selectedAlert.severity === 'Critical',
                      "bg-orange-500/10 text-orange-500 border border-orange-500/20": selectedAlert.severity === 'High',
                      "bg-amber-500/10 text-amber-500 border border-amber-500/20": selectedAlert.severity === 'Medium',
                      "bg-blue-500/10 text-blue-500 border border-blue-500/20": selectedAlert.severity === 'Low',
                    })}>
                      {selectedAlert.severity} Alert
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{selectedAlert.time}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{selectedAlert.description}</h2>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-white/5 rounded-full"><XCircle className="w-6 h-6 text-slate-500" /></button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
                <section>
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Forensic Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Source IP" value={selectedAlert.src_ip || "10.0.0.1"} icon={Globe} />
                    <DetailItem label="Region" value={selectedAlert.source_country || "United States"} icon={MapIcon} />
                    <DetailItem label="MITRE ATT&CK" value={selectedAlert.mitre_id || "T1059.001"} icon={Target} />
                    <DetailItem label="Status" value={selectedAlert.status} icon={Info} />
                  </div>
                </section>

                <section className="bg-black/40 rounded-2xl p-6 border border-white/5">
                   <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Zap className="w-4 h-4" /> AI Threat Intelligence
                   </h5>
                   <p className="text-sm text-slate-400 leading-relaxed italic">
                     {selectedAlert.intelligence || "Neural patterns suggest an advanced persistent threat (APT) actor. High similarity with known Lazarus Group tactics. Source IP has been blacklisted in 14 regional nodes."}
                   </p>
                </section>

                <section>
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tactical Actions</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleAlertAction(selectedAlert.id, selectedAlert.source, "resolve")}
                      className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Resolve
                    </button>
                    <button 
                      onClick={() => handleAlertAction(selectedAlert.id, selectedAlert.source, "investigate")}
                      className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <Search className="w-4 h-4" /> Investigate
                    </button>
                    <button 
                      className="col-span-2 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> Pivot to Sentinel
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Sub-components ---

function SidebarItem({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={cn("flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer group relative", 
        active ? 'bg-red-600/10 text-red-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
        {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-600 rounded-r-full shadow-[2px_0_10px_rgba(220,38,38,0.5)]" />}
      </div>
    </Link>
  );
}

function HeaderButton({ icon: Icon, badge, onClick }: { icon: any, badge?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="p-2.5 bg-[#0D121B] border border-white/5 hover:border-white/20 rounded-xl transition-all relative group">
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
      {badge && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] flex items-center justify-center font-black shadow-[0_0_10px_rgba(220,38,38,0.5)]">{badge}</span>}
    </button>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-slate-600" />
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-bold truncate">{value}</p>
    </div>
  );
}

/** Projects lon/lat to SVG viewport [800x400] using equirectangular projection */
function lonLatToSVG(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 400;
  return [x, y];
}

function DynamicThreatMap({ data }: { data: SummaryData | null }) {
  // Build threat points from geo_points OR from latest_alerts coords
  const threatPoints: { x: number; y: number; severity: string; label: string; key: string }[] = [];
  
  // From geo_points (real GeoIP resolved)
  if (data?.geo_points && data.geo_points.length > 0) {
    data.geo_points.slice(0, 20).forEach((pt, i) => {
      const [lon, lat] = pt.value;
      const [x, y] = lonLatToSVG(lon, lat);
      threatPoints.push({ x, y, severity: pt.severity, label: pt.name, key: `geo-${i}` });
    });
  } else if (data?.latest_alerts) {
    // Fallback: use src_lat/src_lon from latest alerts
    data.latest_alerts.forEach((a, i) => {
      if (a.src_lat !== undefined && a.src_lon !== undefined) {
        const [x, y] = lonLatToSVG(a.src_lon!, a.src_lat!);
        threatPoints.push({ x, y, severity: a.severity, label: a.source_country || 'Unknown', key: `alert-${i}` });
      }
    });
  }

  // SOC HQ: Casablanca, Morocco (~-7.09, 33.59)
  const [hqX, hqY] = lonLatToSVG(-7.09, 33.59);

  const sevColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="absolute inset-0">
      {/* World map background */}
      <div className="absolute inset-0 opacity-30">
        <WorldMapSVG />
      </div>

      {/* SVG overlay for attack vectors */}
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {/* Draw attack lines from threat origins to SOC HQ */}
        {threatPoints.map((pt) => (
          <g key={`line-${pt.key}`}>
            <line
              x1={pt.x} y1={pt.y}
              x2={hqX} y2={hqY}
              stroke={sevColor(pt.severity)}
              strokeWidth="0.6"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
            />
          </g>
        ))}
        
        {/* SOC HQ marker */}
        <circle cx={hqX} cy={hqY} r="5" fill="#10B981" opacity="0.9" />
        <circle cx={hqX} cy={hqY} r="10" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        <text x={hqX + 12} y={hqY + 4} fill="#10B981" fontSize="8" fontFamily="monospace">SOC HQ</text>
      </svg>

      {/* Animated threat pulses (DOM elements for CSS animations) */}
      {threatPoints.map((pt, i) => {
        const pxLeft = (pt.x / 800) * 100;
        const pxTop = (pt.y / 400) * 100;
        const color = sevColor(pt.severity);
        return (
          <motion.div
            key={pt.key}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="absolute"
            style={{ left: `${pxLeft}%`, top: `${pxTop}%`, transform: 'translate(-50%,-50%)' }}
          >
            {/* Outer ring pulse */}
            <div
              className="absolute rounded-full animate-ping"
              style={{
                width: 20, height: 20,
                left: -10, top: -10,
                background: `${color}22`,
                border: `1px solid ${color}55`,
              }}
            />
            {/* Core dot */}
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              title={`${pt.label} — ${pt.severity}`}
            />
          </motion.div>
        );
      })}

      {/* Empty state */}
      {threatPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Awaiting Telemetry Feed...</p>
        </div>
      )}
    </div>
  );
}

function WorldMapSVG() {
  return (
    <svg viewBox="0 0 800 400" className="w-full h-full fill-slate-800">
      <path d="M150,100 Q180,80 200,100 T250,120 T300,100 T350,150 T400,130 T450,160 T500,120 T550,140 T600,100 T650,130 T700,110" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="150" r="1.5" />
      <circle cx="450" cy="180" r="1.5" />
      <circle cx="600" cy="250" r="1.5" />
      <circle cx="300" cy="280" r="1.5" />
      <circle cx="100" cy="200" r="1.5" />
    </svg>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <path d="M 0,15 L 10,12 L 20,18 L 30,5 L 40,10 L 50,2 L 60,8" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
