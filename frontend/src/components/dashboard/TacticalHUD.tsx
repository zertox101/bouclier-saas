"use client";

import { motion } from 'framer-motion';
import { Radar, Target, Crosshair, Zap, Activity, Shield } from 'lucide-react';
import { useSecurityWebSocket } from '@/hooks/useSecurityAPI';
import { useState } from 'react';

export function TacticalHUD() {
    const [stats, setStats] = useState({
        active_scans: 0,
        system_load: "14%",
        threat_level: "NOMINAL",
        global_risk: "LOW"
    });

    useSecurityWebSocket((data: any) => {
        if (data.type === 'status_update') {
            setStats({
                active_scans: data.active_scans,
                system_load: data.system_load,
                threat_level: data.threat_level,
                global_risk: data.global_risk
            });
        }
    });

    return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {/* Corner Brackets */}
            <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-p-500/30 rounded-tl-3xl" />
            <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-p-500/30 rounded-tr-3xl" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-b-2 border-l-2 border-p-500/30 rounded-bl-3xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-p-500/30 rounded-br-3xl" />

            {/* Floating Tactical Data */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-16 bg-bg-2/60 backdrop-blur-md border border-p-500/20 p-4 rounded-2xl"
            >
                <div className="flex items-center gap-3 mb-2">
                    <Target className="w-4 h-4 text-p-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Active Scans</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-[8px] font-bold text-text-3">GLOBAL_NMAP</span>
                        <span className="text-[8px] font-black text-success">{stats.active_scans > 0 ? "RUNNING" : "IDLE"}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: stats.active_scans > 0 ? "100%" : "5%" }}
                            className={`h-full ${stats.active_scans > 0 ? 'bg-p-500 animate-pulse' : 'bg-white/20'}`}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Scanning Ring Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-p-500/5 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-p-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

            {/* Side HUD Stats */}
            <div className="absolute right-16 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-6">
                {[
                    { label: "TR_INTEL", icon: Radar, val: stats.threat_level, color: stats.threat_level === 'CRITICAL' ? 'text-danger' : 'text-p-400' },
                    { label: "SYS_LOAD", icon: Activity, val: stats.system_load, color: parseInt(stats.system_load) > 80 ? 'text-danger' : 'text-p-400' },
                    { label: "SEC_SYNC", icon: Shield, val: "ONLINE", color: "text-success" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-4 bg-bg-2/40 backdrop-blur-sm p-3 border-r-2 border-p-500/50 rounded-l-xl"
                    >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-text-3 uppercase">{item.label}</span>
                            <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.val}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
