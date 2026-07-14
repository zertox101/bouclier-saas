"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Eye, Map, Share2, Archive, 
  CheckCircle, Clock, ChevronRight, Target, 
  ShieldAlert, Fingerprint, Activity, Terminal,
  ExternalLink, FileText, Info, X, ShieldCheck,
  Zap, Globe, Cpu, Lock, AlertCircle, Scan, Atom,
  Skull, WifiOff, ShieldOff, Server, HardDrive,
  Ghost, BarChart3, Database, Shield, Radio, MoreVertical, Copy, TrendingUp, AlertTriangle, Trash2,
  MapPin, User, Building, Compass, Loader2, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Alert {
  id: string;
  alert_type: string;
  rule_id: string;
  severity: string;
  timestamp_epoch: number;
  user: string;
  host: string;
  details: any;
  status: string;
  evidence: {
    last_event: {
      event_type: string;
      src_ip: string;
      enrich?: {
        geoip?: any;
      };
    };
  };
}

export default function AlertsInboxPage() {
  const router = useRouter();
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isForensicScanning, setIsForensicScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannel, setActiveChannel] = useState("Active_Alerts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ analysis: string; recommended_actions: string[] } | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await apiClient('/alerts');
      setLiveAlerts(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const fetchAiExplanation = async (alertId: string) => {
    setAiAnalysis(null);
    try {
      const data = await apiClient(`/alerts/${alertId}/explain`);
      setAiAnalysis(data);
    } catch (e) {
      console.error("AI Explanation failed", e);
    }
  };

  useEffect(() => {
    if (selectedAlertId) {
      fetchAiExplanation(selectedAlertId);
    }
  }, [selectedAlertId]);

  const handleAction = async (alertId: string, action: string) => {
    try {
      const endpoint = action === 'archive' ? 'archive' : 'investigate';
      await apiClient(`/alerts/${alertId}/${endpoint}`, { method: 'POST' });
      fetchAlerts();
      if (action === 'archive') setSelectedAlertId(null);
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  const filteredAlerts = liveAlerts.filter(a => {
    const matchesSearch = a.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.evidence.last_event.src_ip?.includes(searchQuery);
    const matchesChannel = activeChannel === "Active_Alerts" || 
                           (activeChannel === "Neural Feeds" && a.alert_type === "ml") ||
                           (activeChannel === "Global SOC" && a.alert_type === "correlation");
    return matchesSearch && matchesChannel;
  });

  const selectedAlert = liveAlerts.find(a => a.id === selectedAlertId);

  const formatTime = (epoch: number) => {
    return new Date(epoch * 1000).toLocaleTimeString("en-GB");
  };

  if (loading && liveAlerts.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Tactical Feeds...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans relative">
      
      {/* ── Header Area ── */}
      <div className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-50">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center">
               <Bell className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <div>
               <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">Alerts_Inbox_v4</h1>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time Threat Interception Center</p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="FILTER_BY_IP_OR_ACTOR..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold text-white w-64 focus:outline-none focus:border-blue-500/50 transition-all uppercase placeholder:text-slate-700"
               />
            </div>
            <button onClick={fetchAlerts} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
               <RefreshCw className="w-4 h-4 text-emerald-500" />
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* ── Left Sidebar: Channels ── */}
         <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col p-6">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Tactical_Channels</h3>
            <div className="space-y-2">
               {[
                 { id: "Active_Alerts", label: "Active_Alerts" },
                 { id: "Neural Feeds", label: "Neural Feeds" },
                 { id: "Global SOC", label: "Global SOC" }
               ].map(channel => (
                  <button 
                     key={channel.id}
                     onClick={() => setActiveChannel(channel.id)}
                     className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeChannel === channel.id ? "bg-red-600/10 text-red-500 border border-red-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                     )}
                  >
                     {channel.label}
                     {activeChannel === channel.id && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444]" />}
                  </button>
               ))}
            </div>
         </div>

         {/* ── Main List Area ── */}
         <div className="flex-1 flex flex-col bg-black/40 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
               {filteredAlerts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                    <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No matching threats detected</p>
                 </div>
               ) : filteredAlerts.map((alert) => (
                  <motion.div 
                     key={alert.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     onClick={() => setSelectedAlertId(alert.id)}
                     className={cn(
                        "group p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden",
                        selectedAlertId === alert.id 
                           ? "bg-red-600/5 border-red-500/30 shadow-[0_20px_50px_rgba(239,44,44,0.05)]" 
                           : "bg-white/[0.02] border-white/[0.05] hover:border-white/20"
                     )}
                  >
                     <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-start gap-6">
                           <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center border",
                              alert.severity === 'critical' ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-orange-500/10 border-orange-500/30 text-orange-500"
                           )}>
                              {alert.severity === 'critical' ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{alert.alert_type.toUpperCase()}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-800" />
                                 <span className="text-[10px] font-mono text-slate-600">{formatTime(alert.timestamp_epoch)}</span>
                              </div>
                              <h3 className="text-lg font-black text-white italic group-hover:text-red-400 transition-colors">{alert.rule_id}</h3>
                              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic font-medium">Source: {alert.evidence.last_event.src_ip}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-[10px] font-black text-white">{alert.host}</p>
                              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{alert.user}</p>
                           </div>
                           <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-500 hover:text-white">
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* ── Right Panel: Deep Forensic Intel ── */}
         <AnimatePresence>
            {selectedAlert && (
               <motion.div 
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  className="w-[450px] border-l border-white/5 bg-[#050505] p-8 overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40"
               >
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Forensic_Intel</span>
                     </div>
                     <button onClick={() => setSelectedAlertId(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-8">
                     {/* Identity Card */}
                     <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                              <Fingerprint className="w-6 h-6 text-red-500" />
                           </div>
                           <div>
                              <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{selectedAlert.user}</h4>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Impacted Identity Profile</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Alert_ID</p>
                              <p className="text-sm font-black text-white italic">{selectedAlert.id}</p>
                           </div>
                           <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Severity</p>
                              <p className="text-sm font-black text-red-500 italic uppercase">{selectedAlert.severity}</p>
                           </div>
                        </div>
                     </div>

                     {/* AI Analysis Section */}
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                           <Zap className="w-3 h-3" /> Neural_AI_Reasoning
                        </h4>
                        <div className="p-6 rounded-[32px] bg-red-600/5 border border-red-500/10 min-h-[100px]">
                           {aiAnalysis ? (
                              <div className="space-y-4">
                                 <p className="text-[11px] text-slate-300 leading-relaxed italic">{aiAnalysis.analysis}</p>
                                 <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase">Recommended Actions</p>
                                    {aiAnalysis.recommended_actions.map((act, i) => (
                                       <div key={i} className="flex items-center gap-2 text-[10px] text-emerald-500">
                                          <CheckCircle className="w-3 h-3" />
                                          {act}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ) : (
                              <div className="flex items-center justify-center py-4">
                                 <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Source Telemetry */}
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                           <Globe className="w-3 h-3" /> Source_Origin_Metrics
                        </h4>
                        <div className="space-y-3">
                           {[
                              { label: 'Source IP', value: selectedAlert.evidence.last_event.src_ip, icon: Globe },
                              { label: 'Affected Host', value: selectedAlert.host, icon: Server },
                              { label: 'Event Type', value: selectedAlert.evidence.last_event.event_type, icon: Terminal },
                              { label: 'Current Status', value: selectedAlert.status, icon: Info }
                           ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                 <div className="flex items-center gap-3 text-slate-500">
                                    <item.icon className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                                 </div>
                                 <span className="text-[10px] font-black text-white">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                           onClick={() => handleAction(selectedAlert.id, 'investigate')}
                           className="py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)]"
                        >
                           Investigate_Threat
                        </button>
                        <button 
                           onClick={() => handleAction(selectedAlert.id, 'archive')}
                           className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                           Mute_Thread
                        </button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
