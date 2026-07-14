"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, X, ChevronRight, Layout, Eye, 
    Zap, Tv, Maximize, Settings2, Sliders,
    Shield, Activity, Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonitorConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProject: (params: MonitorParams) => void;
}

export interface MonitorParams {
    resolution: string;
    showMetrics: boolean;
    showFooter: boolean;
    visualMode: 'Tactical' | 'High_Contrast' | 'Minimalist';
    refreshRate: number;
}

export function MonitorConfigModal({ isOpen, onClose, onProject }: MonitorConfigModalProps) {
    const [params, setParams] = useState<MonitorParams>({
        resolution: '1920x1080',
        showMetrics: true,
        showFooter: false,
        visualMode: 'Tactical',
        refreshRate: 1000
    });

    const resolutions = [
        { id: '1920x1080', label: '1080p Tactical', desc: 'Standard HD Monitor' },
        { id: '3840x2160', label: '4K UHD Command', desc: 'Large Scale SOC Wall' },
        { id: '2560x1080', label: 'Ultra-Wide Arc', desc: 'Panoptic Viewport' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
                    />

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0f] border border-blue-500/20 rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* Header */}
                        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-blue-600/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                                    <Tv className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 italic">Projection_Interface</h2>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">External_Monitor_Setup</h3>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-10 grid grid-cols-2 gap-10">
                            {/* Left Column: Resolution & Mode */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Maximize className="w-3 h-3" /> Target_Resolution
                                    </p>
                                    <div className="space-y-2">
                                        {resolutions.map(res => (
                                            <button 
                                                key={res.id} onClick={() => setParams({...params, resolution: res.id})}
                                                className={cn(
                                                    "w-full p-4 rounded-2xl border text-left transition-all group",
                                                    params.resolution === res.id ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                                )}
                                            >
                                                <p className={cn("text-[11px] font-black uppercase tracking-widest mb-1", params.resolution === res.id ? "text-blue-400" : "text-white")}>{res.label}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">{res.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Sliders className="w-3 h-3" /> Visual_Rendering_Mode
                                    </p>
                                    <div className="flex gap-2">
                                        {['Tactical', 'High_Contrast', 'Minimalist'].map(mode => (
                                            <button 
                                                key={mode} onClick={() => setParams({...params, visualMode: mode as any})}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all",
                                                    params.visualMode === mode ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500 border border-white/10"
                                                )}
                                            >
                                                {mode.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Layer Toggles & Health */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Layout className="w-3 h-3" /> Active_UI_Layers
                                    </p>
                                    <div className="space-y-3">
                                        <LayerToggle 
                                            label="System Health Metrics" desc="Show real-time status ribbons" 
                                            active={params.showMetrics} onClick={() => setParams({...params, showMetrics: !params.showMetrics})} icon={Activity}
                                        />
                                        <LayerToggle 
                                            label="Footer Infrastructure" desc="Show global node stats" 
                                            active={params.showFooter} onClick={() => setParams({...params, showFooter: !params.showFooter})} icon={Gauge}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest">NEXUS_LINK_STABILITY</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} className="h-full bg-blue-500" />
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase">Ready for seamless multi-monitor handover.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-8 border-t border-white/5 bg-black/40">
                            <button 
                                onClick={() => onProject(params)}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 group"
                            >
                                <Zap className="w-5 h-5 fill-current animate-pulse" />
                                INITIATE_PROJECTION_SEQUENCE
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function LayerToggle({ label, desc, active, onClick, icon: Icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full p-4 rounded-2xl border flex items-center justify-between transition-all group",
                active ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.01] border-white/5 hover:bg-white/5"
            )}
        >
            <div className="flex items-center gap-4 text-left">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all", active ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-slate-600")}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-white" : "text-slate-500")}>{label}</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase">{desc}</p>
                </div>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-all", active ? "bg-blue-600" : "bg-slate-800")}>
                <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", active ? "right-1" : "left-1")} />
            </div>
        </button>
    );
}
