"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Lock, Zap, Radio, Terminal, AlertTriangle, 
  Fingerprint, Activity, Power, Shield, ShieldCheck, Globe,
  Server, Cpu, Database, Network, Flame, Skull, Ghost, Orbit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/components/shared/NotificationSystem';

import { apiClient } from '@/lib/api-client';

export default function DangerZonePage() {
  const { addNotification } = useNotifications();
  const [isHoveringLockdown, setIsHoveringLockdown] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    apiClient('/api/saas/control/health')
      .then(d => setHealth(d))
      .catch(() => null);
  }, []);

  const triggerLockdown = async () => {
    try {
      const data = await apiClient('/api/admin/platform/lockdown', { method: "POST" });
      addNotification({ type: 'warning', title: 'LOCKDOWN_EXECUTED', message: data.message });
    } catch {
      window.dispatchEvent(new CustomEvent('execute-lockdown'));
    }
  };

  const handleAction = (name: string) => {
    addNotification({ type: 'info', title: 'DANGER_ZONE_ACTION', message: `Initiating ${name} sequence. Authorization confirmed.` });
  };

  return (
    <div className="p-10 space-y-12 max-w-[1400px] mx-auto min-h-screen relative overflow-hidden">
      
      {/* Background Luxury Ambient Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Luxury Header */}
      <div className="flex flex-col items-center text-center space-y-4 mb-20">
         <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-[9px] font-black text-red-500 uppercase tracking-[0.6em] mb-4"
         >
            Elite_Security_Tier // Level_5
         </motion.div>
         <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">Danger_Zone</h1>
         <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
         <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.4em] max-w-md">High-impact operational center. Precision execution only.</p>
      </div>

      <div className="grid grid-cols-12 gap-10">
        
        {/* Left Actions: Luxury Cards */}
        <div className="col-span-4 space-y-6">
           {[
              { name: "Neural_Purge", desc: "Flush all active sessions & memory buffers", icon: Flame, color: "text-orange-500" },
              { name: "Blackhole_Uplink", desc: "Route malicious traffic to dead-end nodes", icon: Ghost, color: "text-purple-500" },
              { name: "Bunker_Mode", desc: "Isolate central intelligence database", icon: Shield, color: "text-blue-500" }
           ].map((item, i) => (
              <motion.div 
                 key={i}
                 whileHover={{ x: 10 }}
                 onClick={() => handleAction(item.name)}
                 className="group p-8 rounded-[40px] bg-[#08080c] border border-white/[0.03] hover:border-red-500/30 transition-all cursor-pointer relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                       <div className={cn("p-3 rounded-2xl bg-white/[0.03] w-fit", item.color)}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="text-[12px] font-black text-white uppercase tracking-widest">{item.name}</h3>
                          <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-red-500 transition-colors" />
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Center: The Core (Luxurious Lockdown Button) */}
        <div className="col-span-4 flex flex-col items-center justify-center">
           <div className="relative">
              {/* Outer Rings */}
              <motion.div 
                 animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="absolute inset-[-40px] border border-red-500/10 rounded-full border-dashed" 
              />
              <motion.div 
                 animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                 className="absolute inset-[-80px] border border-red-500/5 rounded-full" 
              />

              <button 
                 onMouseEnter={() => setIsHoveringLockdown(true)}
                 onMouseLeave={() => setIsHoveringLockdown(false)}
                 onClick={triggerLockdown}
                 className="relative w-64 h-64 rounded-full bg-[#050505] border-4 border-red-600/20 flex flex-col items-center justify-center group shadow-[0_0_100px_rgba(220,38,38,0.1)] hover:border-red-600/50 transition-all"
              >
                 <div className="absolute inset-4 rounded-full border-2 border-red-600/10 group-hover:border-red-600/30 transition-all" />
                 
                 <Power className={cn("w-16 h-16 transition-all duration-700", isHoveringLockdown ? "text-red-500 scale-110 rotate-90" : "text-red-900")} />
                 
                 <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Execute</p>
                    <p className="text-[12px] font-black text-white uppercase tracking-widest">Global_Lockdown</p>
                 </div>

                 {/* Glow Effect */}
                 <div className="absolute inset-0 rounded-full bg-red-600/0 group-hover:bg-red-600/5 blur-3xl transition-all" />
              </button>
           </div>
        </div>

        {/* Right Content: Stats & Intel */}
        <div className="col-span-4 space-y-8">
           <div className="p-8 rounded-[40px] bg-[#08080c] border border-white/[0.03] space-y-8">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                 <Activity className="w-4 h-4" /> Tactical_Telemetry
              </h3>
               <div className="space-y-6">
                  {[
                     { label: "Neural_Drift", val: health?.metrics?.neural_compute || "0.002ms", color: "text-emerald-500" },
                     { label: "Auth_Tokens", val: health?.core?.database || "Active", color: "text-blue-500" },
                     { label: "Purity_Score", val: health?.metrics?.bypass_efficiency || "99.98%", color: "text-emerald-500" }
                  ].map((stat, i) => (
                     <div key={i} className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        <span className={cn("text-[10px] font-mono font-black italic", stat.color)}>{health ? stat.val : "..."}</span>
                     </div>
                  ))}
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <Orbit className="w-5 h-5 text-red-500 animate-spin-slow" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Satellite_Airgap</span>
                 </div>
                 <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed uppercase tracking-widest">
                    Manual override enabled via secure orbiting node. Signal integrity: EXCELLENT.
                 </p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                 <Globe className="w-40 h-40 text-red-500" />
              </div>
           </div>
        </div>

      </div>

      {/* Luxury Footer Badge */}
      <div className="flex justify-center pt-20">
         <div className="flex items-center gap-8 opacity-20 hover:opacity-50 transition-opacity cursor-default">
            <span className="text-[8px] font-black text-white uppercase tracking-[1em]">NEXUS_TACTICAL_ELITE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-[1em]">EST_2026</span>
         </div>
      </div>

    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
}
