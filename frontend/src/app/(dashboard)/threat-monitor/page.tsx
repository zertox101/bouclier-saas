'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Activity, AlertTriangle, Shield, Globe, Wifi, Database, Lock,
    Radio, Zap, Eye, Server, TrendingUp, TrendingDown, Clock,
    Download, RefreshCw, Filter, Search, MapPin, Terminal,
    Network, FileText, Bell, CheckCircle, XCircle, Minus,
    BarChart3, PieChart, Circle, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { apiClient } from '@/lib/api-client';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

interface ThreatEvent {
    id: string;
    timestamp: string;
    sourceIp: string;
    geo: string;
    eventType: string;
    severity: string;
    status: string;
    description: string;
}

interface TelemetryStats {
  severity: Record<string, number>;
  timeline: { time: string; count: number }[];
  // Backend retourne alerts avec: id, type, severity, message, src_ip, country, created_at
  alerts: {
    id: string | number;
    type: string;
    severity: string;
    message: string;
    src_ip: string;
    country: string;
    created_at: string;
    // champs legacy optionnels
    title?: string;
    source?: string;
    category?: string;
    timestamp?: string;
    status?: string;
  }[];
  health: {
    status?: string;
    active_nodes?: number;
    // champs legacy optionnels
    total?: number;
    online?: number;
    offline?: number;
    degraded?: number;
  };
  counters: {
    events: number;
    alerts: number;
    incidents: number;
  };
  attack_types?: { name: string; count: number }[];
  top_talkers?: { ip: string; count: number }[];
}

export default function ThreatMonitorPage() {
    const [stats, setStats] = useState<TelemetryStats | null>(null);
    const [liveEvents, setLiveEvents] = useState<ThreatEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLive, setIsLive] = useState(true);
    const { notify } = useNotificationContext();

    const fetchStats = useCallback(async () => {
        try {
            const data = await apiClient('/api/telemetry/stats');

            // Normalise la structure health — backend retourne active_nodes, pas online/total
            const normalizedHealth = {
                total:   data.health?.total   ?? data.health?.active_nodes ?? 1,
                online:  data.health?.online  ?? data.health?.active_nodes ?? 1,
                offline: data.health?.offline ?? 0,
                degraded:data.health?.degraded ?? 0,
                status:  data.health?.status  ?? "online",
                active_nodes: data.health?.active_nodes ?? 1,
            };

            // Normalise severity — backend retourne critical/high/medium/low (minuscules)
            const rawSev = data.severity || {};
            const normalizedSeverity: Record<string, number> = {
                CRITICAL: rawSev.critical ?? rawSev.Critique ?? 0,
                HIGH:     rawSev.high     ?? rawSev["Élevé"] ?? 0,
                MEDIUM:   rawSev.medium   ?? rawSev.Moyen    ?? 0,
                INFO:     rawSev.low      ?? rawSev.Faible   ?? 0,
            };

            setStats({ ...data, health: normalizedHealth, severity: normalizedSeverity });

            // Normalise les alerts — backend retourne type/message/src_ip/country/created_at
            const rawAlerts: any[] = data.alerts || [];
            const mapped: ThreatEvent[] = rawAlerts.map((a: any) => {
                const ts = a.created_at || a.timestamp || new Date().toISOString();
                let timeStr = ts;
                try { timeStr = new Date(ts).toLocaleTimeString(); } catch {}

                const sev = (a.severity || "info")
                    .replace("Critique", "CRITICAL")
                    .replace("Élevé",   "HIGH")
                    .replace("Moyen",   "MEDIUM")
                    .replace("Faible",  "INFO")
                    .toUpperCase();

                return {
                    id:          String(a.id),
                    timestamp:   timeStr,
                    sourceIp:    a.src_ip   || a.source || "0.0.0.0",
                    geo:         a.country  || "Unknown",
                    eventType:   a.type     || a.category || "Unknown",
                    severity:    sev,
                    status:      a.status   || "active",
                    description: a.message  || a.title   || "",
                };
            });
            setLiveEvents(mapped);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        
        // SSE for real-time
        const sse = new EventSource(`${API}/api/telemetry/stream?channels=events`);
        sse.addEventListener('events', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                const ts = data.created_at || data.timestamp || new Date().toISOString();
                let timeStr = ts;
                try { timeStr = new Date(ts).toLocaleTimeString(); } catch {}

                const sev = (data.severity || "info")
                    .replace("Critique", "CRITICAL")
                    .replace("Élevé",   "HIGH")
                    .replace("Moyen",   "MEDIUM")
                    .replace("Faible",  "INFO")
                    .toUpperCase();

                const newEvt: ThreatEvent = {
                    id:          String(data.id || Date.now()),
                    timestamp:   timeStr,
                    sourceIp:    data.src_ip   || data.source || "0.0.0.0",
                    geo:         data.country  || "Unknown",
                    eventType:   data.type     || data.event_type || "Unknown",
                    severity:    sev,
                    status:      data.status   || "active",
                    description: data.message  || "",
                };

                // Notify for HIGH and CRITICAL events
                if (sev === 'HIGH' || sev === 'CRITICAL') {
                    notify({
                        id: newEvt.id,
                        type: newEvt.eventType,
                        severity: sev as 'HIGH' | 'CRITICAL',
                        message: newEvt.description || `${newEvt.eventType} detected`,
                        src_ip: newEvt.sourceIp,
                        country: newEvt.geo,
                        timestamp: new Date().toISOString()
                    });
                }

                setLiveEvents(prev => [newEvt, ...prev.slice(0, 49)]);
            } catch {}
        });
        sse.onerror = () => { /* silently ignore SSE errors */ };

        return () => {
            clearInterval(interval);
            sse.close();
        };
    }, [fetchStats]);

    const filteredEvents = liveEvents.filter(e => 
      e.sourceIp.includes(searchQuery) || e.eventType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !stats) return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Tapping Global Threat Stream...</p>
      </div>
    );

    return (
        <div className="p-8 space-y-8 bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden">
            
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            <Globe className="h-7 w-7 text-purple-400 animate-pulse" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-[#050505] animate-ping" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                          Threat <span className="text-purple-500">Sphere</span>.
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Real-time Global Interception Gateway</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Link</p>
                        <p className="text-xs font-black text-emerald-400">STABLE (14ms)</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SLA Status</p>
                        <p className="text-xs font-black text-white">99.99%</p>
                      </div>
                   </div>
                   <button onClick={fetchStats} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                      <RefreshCw className="w-6 h-6 text-slate-400" />
                   </button>
                </div>
            </header>

            {/* Tactical Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <TacticalCard label="Signals Processed" value={stats?.counters.events.toLocaleString() || '0'} icon={Zap} color="text-cyan-400" />
               <TacticalCard label="Verified Alerts" value={stats?.counters.alerts.toLocaleString() || '0'} icon={Bell} color="text-purple-400" />
               <TacticalCard label="Escalated Cases" value={stats?.counters.incidents.toLocaleString() || '0'} icon={Shield} color="text-red-500" />
               <TacticalCard label="Nodes Online" value={`${stats?.health?.online ?? stats?.health?.active_nodes ?? 0}/${stats?.health?.total ?? stats?.health?.active_nodes ?? 0}`} icon={Server} color="text-emerald-400" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">
               
               {/* Left Column: Severity Distribution */}
               <div className="col-span-3 space-y-8">
                  <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic">Severity Volatility</h3>
                     <div className="space-y-6">
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(sev => {
                          const count = stats?.severity[sev.toLowerCase()] || 0;
                          const max = Math.max(...Object.values(stats?.severity || {})) || 1;
                          return (
                            <div key={sev} className="space-y-2">
                               <div className="flex justify-between items-center">
                                  <span className={cn("text-[9px] font-black uppercase tracking-widest", {
                                    'text-red-500': sev === 'CRITICAL',
                                    'text-orange-500': sev === 'HIGH',
                                    'text-yellow-400': sev === 'MEDIUM',
                                    'text-blue-400': sev === 'INFO'
                                  })}>{sev}</span>
                                  <span className="text-xs font-black text-white italic">{count}</span>
                               </div>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count/max)*100}%` }}
                                    className={cn("h-full", {
                                      'bg-red-600': sev === 'CRITICAL',
                                      'bg-orange-600': sev === 'HIGH',
                                      'bg-yellow-500': sev === 'MEDIUM',
                                      'bg-blue-600': sev === 'INFO'
                                    })} 
                                  />
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-24 h-24" /></div>
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 italic">Neural Heuristics</h3>
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                           <p className="text-[8px] font-black text-slate-600 uppercase mb-2">Detection Rate</p>
                           <p className="text-xl font-black text-emerald-400 italic">98.2% <span className="text-[8px] text-slate-600 ml-1">UP 0.4%</span></p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                           <p className="text-[8px] font-black text-slate-600 uppercase mb-2">False Positives</p>
                           <p className="text-xl font-black text-blue-400 italic">0.03% <span className="text-[8px] text-slate-600 ml-1">DOWN 12%</span></p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Center Column: Live Logs */}
               <div className="col-span-6 bg-[#0D121B] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center border border-purple-500/20 text-purple-400"><Terminal className="w-5 h-5" /></div>
                        <div>
                           <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Tactical Intercept Log</h3>
                           <p className="text-[8px] font-black text-slate-600 uppercase mt-1 tracking-widest">Popping 50/1000 buffer</p>
                        </div>
                     </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input 
                           type="text" 
                           placeholder="FILTER_IP_OR_EVENT..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold text-white w-64 focus:outline-none focus:border-purple-500/40 transition-all uppercase placeholder:text-slate-700"
                        />
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                     <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-white/5 sticky top-0 z-10">
                           <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              <th className="px-8 py-4">Time</th>
                              <th className="px-8 py-4">Origin</th>
                              <th className="px-8 py-4">Vector</th>
                              <th className="px-8 py-4">Severity</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                           <AnimatePresence initial={false}>
                              {filteredEvents.map((evt) => (
                                 <motion.tr 
                                    key={evt.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="hover:bg-white/[0.02] transition-colors cursor-default"
                                 >
                                    <td className="px-8 py-5 text-[10px] font-mono text-slate-500">{evt.timestamp}</td>
                                    <td className="px-8 py-5">
                                       <div className="flex flex-col">
                                          <span className="text-[11px] font-black text-white font-mono">{evt.sourceIp}</span>
                                          <span className="text-[8px] font-black text-slate-600 uppercase">{evt.geo}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-black text-purple-400 italic truncate max-w-[200px]">{evt.eventType}</td>
                                    <td className="px-8 py-5">
                                       <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", {
                                          'bg-red-500/10 text-red-500 border-red-500/20': evt.severity === 'CRITICAL',
                                          'bg-orange-500/10 text-orange-500 border-orange-500/20': evt.severity === 'HIGH',
                                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20': evt.severity === 'MEDIUM',
                                          'bg-blue-500/10 text-blue-400 border-blue-500/20': evt.severity === 'INFO'
                                       })}>{evt.severity}</span>
                                    </td>
                                 </motion.tr>
                              ))}
                           </AnimatePresence>
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Right Column: Globe & Health */}
               <div className="col-span-3 space-y-8">
                  <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden h-[400px] flex flex-col">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 italic relative z-10">Live Infiltration Map</h3>
                     <div className="flex-1 relative z-10">
                        <div className="absolute inset-0 opacity-20"><WorldMapSVG /></div>
                        {liveEvents.slice(0, 3).map((e, i) => (
                           <div 
                            key={e.id} 
                            className="absolute w-3 h-3 bg-red-600 rounded-full animate-ping"
                            style={{ top: `${30 + i * 20}%`, left: `${20 + i * 25}%` }}
                           />
                        ))}
                     </div>
                     <div className="mt-auto relative z-10 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center">
                           <p className="text-[9px] font-black text-slate-500 uppercase">Top Source</p>
                           <p className="text-[11px] font-black text-white italic">United States (42%)</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#0D121B] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 italic">Sensor Health Cluster</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <HealthItem label="Endpoint Sensors" value={String(stats?.health?.online ?? stats?.health?.active_nodes ?? 0)} status="online" />
                        <HealthItem label="Network Nodes" value="12" status="online" />
                        <HealthItem label="AI Core" value="Sync" status="online" />
                        <HealthItem label="Cloud Uplinks" value={String(stats?.health?.offline ?? 0)} status={stats?.health?.offline ? "offline" : "online"} />
                     </div>
                  </div>
               </div>

            </div>

        </div>
    );
}

function TacticalCard({ label, value, icon: Icon, color }: any) {
   return (
      <div className="bg-[#0D121B] border border-white/5 p-8 rounded-[32px] flex items-center gap-6 shadow-xl group hover:border-white/10 transition-all">
         <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10", color)}>
            <Icon className="w-7 h-7" />
         </div>
         <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
         </div>
      </div>
   );
}

function DetailItem({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      <span className={cn("text-[10px] font-black uppercase italic", color)}>{value}</span>
    </div>
  );
}

function HealthItem({ label, value, status }: any) {
  return (
    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
       <div className="flex justify-between items-center mb-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]')} />
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{status}</span>
       </div>
       <p className="text-[10px] font-black text-white italic truncate mb-0.5">{label}</p>
       <p className="text-sm font-black text-slate-400">{value}</p>
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
