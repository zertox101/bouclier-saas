"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Lock, Zap, Activity, X } from "lucide-react";

export function KillSwitchOverlay() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleTrigger = () => setIsActive(true);
    window.addEventListener('kill-switch-trigger', handleTrigger);
    return () => window.removeEventListener('kill-switch-trigger', handleTrigger);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Cyberpunk Grid Background */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 flex flex-col items-center text-center p-8">
             <motion.div 
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-32 h-32 rounded-full bg-red-600/20 border-4 border-red-500 flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(220,38,38,0.5)]"
             >
                <ShieldAlert className="w-16 h-16 text-red-500" />
             </motion.div>

             <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4">SYSTEM_ISOLATED</h1>
             <p className="text-xl font-mono text-red-500 font-bold uppercase tracking-[0.4em] mb-12 animate-pulse">Global Network Lockdown Active</p>
             
             <div className="grid grid-cols-3 gap-12 max-w-4xl w-full">
                {[
                  { label: 'Subnet Alpha', status: 'Isolated', icon: Lock },
                  { label: 'Cloud Nodes', status: 'Encrypted', icon: Zap },
                  { label: 'Database Flux', status: 'Offline', icon: Activity }
                ].map(item => (
                  <div key={item.label} className="bg-red-600/5 border border-red-500/20 p-6 rounded-[32px] space-y-4">
                     <item.icon className="w-8 h-8 text-red-500 mx-auto" />
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                     <p className="text-sm font-black text-white italic">{item.status}</p>
                  </div>
                ))}
             </div>

             <button 
               onClick={() => setIsActive(false)}
               className="mt-16 px-12 py-4 border border-white/20 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white hover:border-white transition-all"
             >
                Enter Administrator Bypass →
             </button>
          </div>

          {/* Red scanline effect */}
          <motion.div 
            animate={{ y: ["-100%", "1000%"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1 bg-red-500/50 blur-sm shadow-[0_0_20px_#ef4444]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
