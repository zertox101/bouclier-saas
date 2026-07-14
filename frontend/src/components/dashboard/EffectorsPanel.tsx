"use client";

import { motion } from "framer-motion";
import {
    Zap,
    ShieldOff,
    Send,
    Signal,
    Crosshair,
    AlertOctagon,
    Lock,
    Unlock,
    Radio,
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
    { id: 'drone', label: 'Deploy Recon Drone', icon: Crosshair, color: 'bg-cyan-500', shadow: 'shadow-cyan-500/50' },
    { id: 'jam', label: 'Signal Jammer', icon: Signal, color: 'bg-purple-600', shadow: 'shadow-purple-500/50' },
    { id: 'block', label: 'Blacklist Perimeter', icon: Lock, color: 'bg-red-600', shadow: 'shadow-red-500/50' },
    { id: 'sat', label: 'Retask Satellite', icon: Radio, color: 'bg-blue-600', shadow: 'shadow-blue-500/50' },
    { id: 'soc', label: 'Alert Command', icon: AlertOctagon, color: 'bg-orange-600', shadow: 'shadow-orange-500/50' },
];

export default function EffectorsPanel() {
    return (
        <div className="w-full bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
            <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Effector Control (Actions)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-slate-500">Auto-Response:</span>
                    <span className="text-[8px] font-black uppercase text-emerald-500">Enabled</span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-5 gap-3">
                {ACTIONS.map((action) => (
                    <button
                        key={action.id}
                        className="group relative flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-all hover:bg-white/10 overflow-hidden"
                    >
                        <div className={cn(
                            "p-2 rounded-lg transition-all group-hover:scale-110",
                            action.color,
                            "shadow-lg",
                            action.shadow
                        )}>
                            <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 group-hover:text-white text-center leading-tight">
                            {action.label}
                        </span>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 border-t border-r border-white/40" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="px-5 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-slate-500">LOCAL_CMD_GATEWAY: UP</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500">LAST_OP: NULL</span>
                    </div>
                </div>
                <button className="text-[10px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-widest">
                    Op History
                </button>
            </div>
        </div>
    );
}
