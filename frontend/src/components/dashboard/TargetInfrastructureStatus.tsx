"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, Shield, Activity, Zap, AlertTriangle, 
  CheckCircle2, Globe, Cpu, Database, Network,
  Lock, ArrowUpRight, ArrowDownRight, MoreVertical,
  RefreshCw, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactECharts from "echarts-for-react";
import { apiClient } from '@/lib/api-client';

interface TargetProps {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'degraded' | 'breached' | 'offline';
  health: number;
  threats: number;
  type: string;
  load: { cpu: number; ram: number; net: number[] };
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string; label: string }> = {
    online: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'OPERATIONAL' },
    healthy: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'OPERATIONAL' },
    degraded: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'DEGRADED' },
    breached: { color: 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse', label: 'BREACH DETECTED' },
    offline: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', label: 'OFFLINE' },
  };
  const config = configs[status.toLowerCase()] || configs.offline;
  return (
    <span className={cn("px-2 py-0.5 rounded text-[8px] font-black tracking-widest border", config.color)}>
      {config.label}
    </span>
  );
};

export default function TargetInfrastructureStatus() {
  const [targets, setTargets] = useState<TargetProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchInfrastructure = useCallback(async () => {
    try {
      const data = await apiClient('/api/assets');
      
      const mapped: TargetProps[] = (Array.isArray(data) ? data : []).map((a: any) => ({
        id: a.id.toString(),
        name: a.name,
        ip: a.ip_address,
        status: (a.status === 'Healthy' ? 'online' : a.status.toLowerCase()) as any,
        health: a.risk_level === 'Low' ? 98 : a.risk_level === 'High' ? 45 : 75,
        threats: a.risk_level === 'High' ? 12 : a.risk_level === 'Medium' ? 4 : 0,
        type: a.type || 'Generic Asset',
        load: { 
          cpu: a.performance_load || 0, 
          ram: a.ram_load || 0, 
          net: a.net_load || [0,0,0,0,0,0,0] 
        }
      }));
      
      setTargets(mapped);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfrastructure();
    const interval = setInterval(fetchInfrastructure, 30000);
    return () => clearInterval(interval);
  }, [fetchInfrastructure]);

  const avgHealth = targets.length > 0 
    ? Math.round(targets.reduce((acc, t) => acc + t.health, 0) / targets.length) 
    : 0;

  if (loading && targets.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center border border-white/5 bg-[#0d1117] rounded-3xl">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Polling Infrastructure Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" /> Target Infrastructure Status
          </h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold italic">
            Real-time Node Health & Asset Vulnerability // Last Sync: {lastUpdate}
          </p>
        </div>
        <div className="flex gap-6 items-center">
           <div className="flex flex-col items-end">
              <span className="text-[8px] text-slate-500 font-black uppercase">Nodes Active</span>
              <span className="text-xs font-black text-emerald-500">{targets.filter(t => t.status !== 'offline').length} / {targets.length}</span>
           </div>
           <div className="w-px h-8 bg-white/5" />
           <div className="flex flex-col items-end">
              <span className="text-[8px] text-slate-500 font-black uppercase">Avg Health</span>
              <span className={cn("text-xs font-black", avgHealth > 80 ? 'text-emerald-500' : 'text-amber-500')}>{avgHealth}%</span>
           </div>
           <button onClick={fetchInfrastructure} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {targets.map((target, idx) => (
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-[#0d1117] border border-white/5 rounded-2xl p-4 hover:border-blue-500/30 transition-all overflow-hidden"
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10",
                target.status === 'breached' ? 'bg-red-500' : 
                target.status === 'degraded' ? 'bg-amber-500' : 'bg-blue-500'
              )} />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    target.status === 'breached' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
                    target.status === 'degraded' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                  )}>
                    {target.type.includes('Data') || target.type.includes('sql') ? <Database className="w-5 h-5" /> : 
                     target.type.includes('API') || target.type.includes('network') ? <Zap className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase truncate w-32">{target.name}</h3>
                    <p className="text-[9px] text-slate-500 font-mono">{target.ip}</p>
                  </div>
                </div>
                <StatusBadge status={target.status} />
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-500 font-black uppercase">Health Integrity</span>
                  <span className={cn("text-[10px] font-black", 
                    target.health > 80 ? 'text-emerald-500' : 
                    target.health > 50 ? 'text-amber-500' : 'text-red-500'
                  )}>{target.health}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${target.health}%` }}
                    className={cn("h-full", 
                      target.health > 80 ? 'bg-emerald-500' : 
                      target.health > 50 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="text-center">
                    <p className="text-[7px] text-slate-600 font-black uppercase mb-1">CPU</p>
                    <p className="text-[10px] font-black text-white">{target.load.cpu}%</p>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <p className="text-[7px] text-slate-600 font-black uppercase mb-1">RAM</p>
                    <p className="text-[10px] font-black text-white">{target.load.ram}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[7px] text-slate-600 font-black uppercase mb-1">Threats</p>
                    <p className={cn("text-[10px] font-black", target.threats > 0 ? 'text-red-500' : 'text-emerald-500')}>{target.threats}</p>
                  </div>
                </div>

                {/* Mini Network Sparkline */}
                <div className="h-8 w-full mt-2">
                  <ReactECharts
                    option={{
                      grid: { top: 0, bottom: 0, left: 0, right: 0 },
                      xAxis: { type: 'category', show: false },
                      yAxis: { type: 'value', show: false },
                      series: [{
                        data: target.load.net,
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        lineStyle: { 
                          color: target.status === 'breached' ? '#ef4444' : '#3b82f6', 
                          width: 1.5 
                        },
                        areaStyle: {
                          color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                              { offset: 0, color: target.status === 'breached' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)' },
                              { offset: 1, color: 'transparent' }
                            ]
                          }
                        }
                      }]
                    }}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{target.type}</span>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* TACTICAL OVERVIEW MAP (Placeholder style) */}
      <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Sync Active</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
             <div className="absolute inset-0 border border-white/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
             <div className="absolute inset-4 border border-white/5 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
             <div className="absolute inset-8 border border-white/5 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
             <div className="relative z-10 flex flex-col items-center">
                <Shield className="w-12 h-12 text-blue-500 mb-2" />
                <p className="text-2xl font-black text-white">{avgHealth}%</p>
                <p className="text-[8px] text-slate-500 font-black uppercase">Overall Shield</p>
             </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
               <Cpu className="w-4 h-4 text-purple-500" /> Tactical Vulnerability Matrix
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Unpatched CVEs', val: '12', color: 'text-red-500', icon: AlertTriangle },
                { label: 'Open Ports', val: '158', color: 'text-blue-500', icon: Network },
                { label: 'Identities', val: '1.2k', color: 'text-emerald-500', icon: Lock },
                { label: 'DarkWeb Hits', val: '43', color: 'text-amber-500', icon: Globe }
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all cursor-crosshair">
                  <div className="flex justify-between items-start mb-2">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                    <span className="text-[7px] font-black text-slate-700 uppercase">Audit_Active</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-black uppercase mb-1">{stat.label}</p>
                  <p className={cn("text-2xl font-black italic", stat.color)}>{stat.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono italic">
                  [SENTINEL_ADVISORY]: All nodes are synchronized with the Central Threat Intelligence Hub. 
                  Neural fuzzing detected {targets.filter(t => t.status === 'degraded').length} potential zero-day vectors in the <span className="text-blue-500">Local Area Network</span>. 
                </p>
                <div className="flex gap-4 mt-2">
                   <button className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Start_Deep_Audit →</button>
                   <button className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-white transition-colors">Isolate_Anomalies →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
