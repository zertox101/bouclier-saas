"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Activity,
    Globe,
    Zap,
    Target,
    Bell,
    Search,
    Maximize2,
    Terminal,
    Cpu,
    Radar,
    Satellite,
    Crosshair,
    Layers,
    Settings,
    X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Mission Components
import SensorCapabilities from "@/components/dashboard/SensorCapabilities";
import EffectorsPanel from "@/components/dashboard/EffectorsPanel";
import FusionFeed from "@/components/dashboard/FusionFeed";

// Dynamic imports for Globe (No SSR)
const ThreatGlobe = dynamic(() => import("@/components/maps/Globe3DMap"), { ssr: false });

export default function MissionCommandPage() {
    const [mounted, setMounted] = useState(false);
    const [activeView, setActiveView] = useState('Tactical Hub');
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative w-full h-screen bg-[#020205] text-white overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* 1. IMMERSIVE TACTICAL GLOBE */}
            <div className="absolute inset-0 z-0">
                <ThreatGlobe viewMode={activeView as any} />
                {/* Digital Overlays / ScanLines */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/40 via-transparent to-[#020205]/60 pointer-events-none" />

                {/* Animated Grid Scan */}
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: '100vh' }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10 pointer-events-none"
                />
            </div>

            {/* 2. MISSION HEADER */}
            <header className="absolute top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-cyan-600 to-indigo-900 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] border border-cyan-500/30">
                            <Radar className="h-6 w-6 text-white animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-[0.4em] leading-none text-white">SHIELD FUSION PLATFORM</span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-cyan-500 mt-2">Mission Intelligence Hub</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden lg:block" />

                    <nav className="hidden xl:flex items-center gap-8">
                        {['Tactical Hub', 'Regional View', 'Global Scan', 'Signal Grid'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveView(item)}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative py-2 px-1",
                                    activeView === item ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {item}
                                {activeView === item && (
                                    <motion.div
                                        layoutId="activeMissionNav"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <Search className="h-3 w-3 text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-400">GEO_COORD_LOCK [48.85, 2.35]...</span>
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">Zulu Time</span>
                            <span className="text-[11px] font-mono text-cyan-400">{format(new Date(), "HH:mm:ss")}Z</span>
                        </div>

                        <button className="h-10 w-10 bg-slate-800/50 border border-white/10 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all group">
                            <Settings className="h-4 w-4 text-slate-300 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 3. NEW STANDALONE TACTICAL LAYOUT */}
            <main className="absolute inset-x-0 bottom-0 z-40 p-10 pointer-events-none flex flex-col gap-6">
                
                {/* FLOATING AOI HUD (Center-Top) */}
                <div className="flex-1 flex items-start justify-center pointer-events-none absolute inset-x-0 top-32">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-10 py-6 bg-black/40 backdrop-blur-3xl border border-cyan-500/30 rounded-3xl flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto group hover:border-cyan-400/50 transition-all duration-700"
                    >
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 mb-2">Tactical AOI Synthesis</span>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Sector 7-G1 (European Front)</h2>
                        <div className="flex gap-8 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMINT: OPTIMAL</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIGINT: NOMINAL</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* BOTTOM INTELLIGENCE GRID (Everything at the bottom as requested) */}
                <div className="grid grid-cols-12 gap-8 pointer-events-auto items-end">
                    
                    {/* SENSOR CAPABILITIES (Left-Bottom) */}
                    <div className="col-span-3 h-[300px] overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl relative group">
                         <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/[0.02] to-transparent pointer-events-none" />
                         <SensorCapabilities />
                    </div>

                    {/* CENTRAL COMMAND & TIMELINE */}
                    <div className="col-span-6 flex flex-col gap-6">
                        <EffectorsPanel />
                        
                        {/* MISSION TIMELINE BAR */}
                        <div className="h-20 bg-black/60 backdrop-blur-3xl border border-cyan-500/10 rounded-2xl flex items-center px-10 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/[0.02] via-transparent to-cyan-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4 shrink-0 mr-10">
                                <Target className="h-5 w-5 text-cyan-400 animate-tactical-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/70">Temporal_Vector</span>
                            </div>
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full relative">
                                <motion.div 
                                    initial={{ left: 0 }}
                                    animate={{ left: "68%" }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-lg shadow-[0_0_20px_#22d3ee] cursor-pointer rotate-45" 
                                />
                                {[0, 25, 50, 75, 100].map(m => (
                                    <div key={m} className="absolute h-3 w-px bg-white/20 top-0 translate-y-[-2px]" style={{ left: `${m}%` }} />
                                ))}
                            </div>
                            <div className="ml-10 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shrink-0">
                                <span className="text-[11px] font-black font-mono text-cyan-400 tracking-tighter">10 MAR 2026 01:45:00Z</span>
                            </div>
                        </div>
                    </div>

                    {/* FUSION FEED (Right-Bottom) */}
                    <div className="col-span-3 h-[300px] overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl relative group">
                         <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/[0.02] to-transparent pointer-events-none" />
                         <FusionFeed />
                    </div>

                </div>

            </main>

            {/* 4. OVERLAY / DETAILS WINDOW (Simulating Palantir Gotham deeper analysis) */}
            <AnimatePresence>
                {isOverlayOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-20 pointer-events-none"
                    >
                        <div className="w-full max-w-5xl h-full bg-[#05050a]/90 backdrop-blur-3xl border border-cyan-500/30 rounded-3xl shadow-[0_0_100px_rgba(6,182,212,0.2)] pointer-events-auto flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Layers className="h-6 w-6 text-cyan-400" />
                                    <div>
                                        <h2 className="text-lg font-black tracking-widest uppercase">Object Analysis: Sentinel_AOI_Data</h2>
                                        <span className="text-[10px] font-mono text-slate-500">ID: OBJ_7741_DELTA_9</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOverlayOpen(false)} className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-all">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 p-10 grid grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="aspect-video bg-slate-900 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                                        <span className="text-[10px] font-bold opacity-30">AWAITING_IMINT_STREAM...</span>
                                        <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-cyan-500" />
                                        <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-cyan-500" />
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                        <h3 className="text-xs font-black uppercase text-cyan-400">Sensor Metadata</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase block">Source</span>
                                                <span className="text-xs font-bold font-mono">Planet Labs SkySat-7</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase block">Resolution</span>
                                                <span className="text-xs font-bold font-mono">0.5m Pan/Multi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase text-purple-400 border-b border-white/5 pb-2">Relationship Graph</h3>
                                    <div className="flex-1 flex items-center justify-center opacity-40">
                                        <div className="h-60 w-60 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center">
                                            <Shield className="h-12 w-12 text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes pulse-cyan {
          0%, 100% { box-shadow: 0 0 15px rgba(6,182,212,0.2); }
          50% { box-shadow: 0 0 35px rgba(6,182,212,0.5); }
        }
        .animate-tactical-pulse {
          animation: pulse-cyan 3s infinite;
        }
      `}</style>
        </div>
    );
}
