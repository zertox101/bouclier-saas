"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Lock, Radio, Terminal, AlertTriangle, 
  Activity, Shield, Globe,
  Server, Cpu, Database, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

export default function LockdownControlPage() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiClient("/api/lockdown/sectors").catch(() => ({ sectors: [] } as any)),
      apiClient("/api/lockdown/status").catch(() => null),
    ]).then(([s, st]) => {
      setSectors((s as any)?.sectors || []);
      setStatus(st);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.1)]">
               <Power className="w-7 h-7 text-red-500" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tactical_Authorization</h1>
               <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em] mt-1">Command Center // Level 5 Clearance Required</p>
            </div>
         </div>
         <div className="px-4 py-2 rounded-xl bg-red-600/5 border border-red-500/20 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Live_System_Link</span>
         </div>
      </div>

      {status && <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800"><span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Threat Level</span><span className="text-lg font-black text-white uppercase">{status.threat_level}</span></div>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800"><span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Global Lockdown</span><span className={`text-lg font-black ${status.global_lockdown ? 'text-red-500' : 'text-emerald-400'}`}>{status.global_lockdown ? 'ACTIVE' : 'INACTIVE'}</span></div>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800"><span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Sectors Locked</span><span className="text-lg font-black text-white">{status.sectors_locked}/{status.total_sectors}</span></div>
      </div>}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
           <div className="grid grid-cols-2 gap-4">
              {sectors.map((s, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-[#050505] border border-white/5 hover:border-red-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-red-600/10 transition-colors">
                          <Server className="w-5 h-5 text-slate-500 group-hover:text-red-500" />
                       </div>
                       <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{s.load}% Load</span>
                    </div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{s.name}</h3>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest mt-4">
                       <span className={cn("px-2 py-1 rounded-md", s.status === "secure" || s.status === "locked" ? "bg-emerald-500/10 text-emerald-500" : s.status === "compromised" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")}>{s.status}</span>
                       <span className="text-slate-600">INT: {s.integrity}%</span>
                       {s.threat_level !== "none" && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{s.threat_level}</span>}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="col-span-4 space-y-6">
           <div className="p-8 rounded-[32px] bg-[#050505] border border-white/10 shadow-2xl">
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><ShieldAlert className="w-5 h-5 text-red-500" /> Quick_Actions</h2>
              <div className="space-y-4">
                 <button className="w-full p-4 bg-red-600/10 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-600/20 transition-all flex items-center justify-center gap-3"><Lock className="w-4 h-4" />Global Lockdown</button>
                 <button className="w-full p-4 bg-emerald-600/10 border border-emerald-500/30 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-600/20 transition-all flex items-center justify-center gap-3"><Shield className="w-4 h-4" />Release All</button>
              </div>
           </div>
           <div className="p-8 rounded-[32px] bg-[#050505] border border-white/10">
              <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><Activity className="w-5 h-5" /> Network_Pulse</h2>
              <div className="flex gap-1 h-8 items-end">
                 {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-blue-600/30 rounded-t" style={{ height: `${Math.random() * 100}%` }} />
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
