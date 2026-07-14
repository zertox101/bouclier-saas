"use client";

import {
  Bell, Search, Activity,
  Clock, AlertTriangle, Shield,
  Volume2, VolumeX, Monitor, ExternalLink
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { NotificationPanel, useNotifications } from "@/components/shared/NotificationSystem";
import { GlobalCommandTerminal } from "@/components/layout/GlobalCommandTerminal";
import { MonitorConfigModal, MonitorParams } from "@/components/shared/MonitorConfigModal";

export default function TopNavBar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [mounted,           setMounted]           = useState(false);
  const [time,              setTime]               = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMonitorConfig, setShowMonitorConfig] = useState(false);

  const { unreadCount, isMuted, toggleMute } = useNotifications();

  const handleProject = (params: MonitorParams) => {
    setShowMonitorConfig(false);
    const [width, height] = params.resolution.split('x').map(Number);
    const separator = window.location.search ? '&' : '?';
    
    // Add extra params based on config
    let extraParams = `&standalone=true&mode=${params.visualMode}`;
    if (!params.showMetrics) extraParams += '&hideMetrics=true';
    if (params.showFooter) extraParams += '&showFooter=true';

    const url = `${window.location.origin}${pathname}${window.location.search}${separator}${extraParams}`;
    window.open(url, '_blank', `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no`);
    
    window.dispatchEvent(new CustomEvent('notify', { 
       detail: { message: `Projection Sequence Initiated: ${params.resolution} @ ${params.visualMode}`, type: 'success' } 
    }));
  };

  const updateClock = () =>
    setTime(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    setMounted(true);
    updateClock();
    const id = setInterval(updateClock, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b"
      style={{
        background: 'rgba(7, 9, 13, 0.85)',
        backdropFilter: 'blur(32px)',
        borderColor: 'rgba(255,255,255,0.04)',
      }}
    >
      {/* ── Left: Breadcrumbs / System Identity ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Gotham AI Core</span>
        </div>
        <div className="h-4 w-px bg-white/5" />
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
           <span className="uppercase tracking-widest">{pathname.replace('/', '') || 'Overview'}</span>
        </div>
      </div>

      {/* ── Center: Search ── */}
      <div className="flex-1 flex justify-center">
        <GlobalCommandTerminal />
      </div>

      {/* ── Right: HUD Metrics ── */}
      <div className="flex items-center gap-6">
        
        {/* Metric group */}
        <div className="hidden xl:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Active Threats</span>
            <span className="text-sm font-black text-red-500 font-mono tracking-tighter">2,458</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">System Health</span>
            <div className="flex items-center gap-2">
               <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               </div>
               <span className="text-[10px] font-black text-emerald-400 font-mono">92%</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Data Processed</span>
            <span className="text-sm font-black text-blue-400 font-mono tracking-tighter">5.3 TB</span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/5" />

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMute}
            title={isMuted ? "Enable Sentinel Voice" : "Disable Sentinel Voice"}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl border transition-all",
              isMuted 
                ? "bg-red-600/10 border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white" 
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            )}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setShowMonitorConfig(true)}
            title="Project to Secondary Monitor"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/30 transition-all group"
          >
            <Monitor className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
          </button>

          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all relative"
          >
            <Bell className="w-4 h-4 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="flex flex-col items-end hidden sm:flex">
               <span className="text-[10px] font-black text-white leading-none mb-1 uppercase tracking-wider">Net-Ops Administrator</span>
               <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Level 7 Access</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-xl relative group cursor-pointer overflow-hidden">
               A
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <MonitorConfigModal 
        isOpen={showMonitorConfig}
        onClose={() => setShowMonitorConfig(false)}
        onProject={handleProject}
      />
    </header>
  );
}
