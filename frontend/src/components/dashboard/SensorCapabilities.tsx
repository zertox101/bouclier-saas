"use client";

import { useState, useEffect } from "react";
import {
    Satellite,
    Target,
    Wifi,
    Video,
    Filter,
    Search,
    ChevronDown,
    Layers,
    Radar,
    Activity,
    Zap,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface SensorType {
    id: string;
    name: string;
    count: number;
    icon: any;
    color: string;
}

const SENSOR_CATEGORIES: SensorType[] = [
    { id: "sat", name: "Satellite imagery", count: 298, icon: Satellite, color: "text-blue-400" },
    { id: "drone", name: "Drones (IMINT)", count: 42, icon: Target, color: "text-purple-400" },
    { id: "cyber", name: "Cyber sensors", count: 2150, icon: Wifi, color: "text-cyan-400" },
    { id: "iot", name: "IoT cameras", count: 85, icon: Video, color: "text-emerald-400" },
];

export default function SensorCapabilities() {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["sat", "cyber"]);
    const [search, setSearch] = useState("");
    const [sensorStats, setSensorStats] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/sensors/stats")
            .then(d => setSensorStats(d))
            .catch(() => {});
    }, []);

    const totalSensors = sensorStats?.total || 2575;
    const activeSensors = sensorStats?.active || 1241;

    const toggleType = (id: string) => {
        setSelectedTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 text-slate-300 font-sans">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <Radar className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Sensor Capabilities</span>
                </div>
                <Filter className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white transition-colors" />
            </div>

            {/* Overview Stats */}
            <div className="p-5 grid grid-cols-2 gap-3 border-b border-white/5 bg-black/20">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Total Sensors</span>
                    <span className="text-xl font-black text-white">{totalSensors.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Active Now</span>
                    <span className="text-xl font-black text-emerald-400">{activeSensors.toLocaleString()}</span>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 px-5">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search AOI or Sensor ID..."
                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Sensor Categories */}
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar space-y-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Layers className="h-3 w-3" />
                        Sensor Type <span className="text-slate-700 ml-auto">({selectedTypes.length} selected)</span>
                    </h3>

                    <div className="space-y-2">
                        {SENSOR_CATEGORIES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => toggleType(type.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all relative group overflow-hidden",
                                    selectedTypes.includes(type.id)
                                        ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                                        : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10"
                                )}
                            >
                                {selectedTypes.includes(type.id) && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_15px_#22d3ee]"
                                    />
                                )}
                                <type.icon className={cn("h-4 w-4", selectedTypes.includes(type.id) ? type.color : "text-slate-600")} />
                                <span className="text-[11px] font-bold tracking-tight">{type.name}</span>
                                <span className="ml-auto text-[10px] font-mono opacity-60">{type.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Object Types */}
                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        Object Detect Priority
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Surface-To-Air Missile", count: 298, progress: 85 },
                            { label: "Interceptor aircraft", count: 142, progress: 65 },
                            { label: "Mobile C2 Unit", count: 24, progress: 40 },
                            { label: "Maritime Vessel", count: 562, progress: 20 },
                        ].map((obj) => (
                            <div key={obj.label} className="space-y-2 group cursor-pointer">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{obj.label}</span>
                                    <span className="font-mono text-slate-600">{obj.count}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                        style={{ width: `${obj.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resolution Levels */}
                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Imagery Resolution
                    </h3>
                    <div className="grid grid-cols-2 gap-2 pb-10">
                        {["0.25m High", "0.5m Mid", "1m Standard", "5m Low"].map((res) => (
                            <button
                                key={res}
                                className="p-2 border border-white/5 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-slate-500 hover:text-cyan-400"
                            >
                                {res}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer / Status */}
            <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="flex items-center justify-between mb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">
                    <span>Uplink Status</span>
                    <span className="text-emerald-500">Live</span>
                </div>
                <div className="flex gap-1 h-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 rounded-full",
                                i < 15 ? "bg-emerald-500/50" : "bg-slate-800"
                            )}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
}
