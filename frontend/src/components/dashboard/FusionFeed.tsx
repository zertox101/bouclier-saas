"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Fingerprint,
    MapPin,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";

export default function FusionFeed({ events = [] }: { events?: any[] }) {
    const [apiEvents, setApiEvents] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/events/logs")
            .then((d: any) => {
                if (Array.isArray(d)) setApiEvents(d);
                else if (d.events) setApiEvents(d.events);
                else if (d.logs) setApiEvents(d.logs);
            })
            .catch((err) => console.warn("Events fetch failed:", err));
    }, []);

    const allEvents = [...apiEvents, ...events].length > 0 ? [...apiEvents, ...events] : [];
    const displayEvents = allEvents.length > 0
        ? allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
        : [];

    return (
        <div className="w-full h-full flex flex-col bg-slate-950/40 backdrop-blur-2xl border-l border-white/5 shadow-2xl overflow-hidden pointer-events-auto">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">AI Fusion Stream</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Fused Feed Active</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <div className="divide-y divide-white/5">
                    {displayEvents.map((detection, i) => (
                        <motion.div
                            key={detection.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 hover:bg-white/[0.03] transition-colors relative group border-l-2 border-transparent hover:border-cyan-500/50"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all",
                                        detection.color
                                    )}>
                                        {detection.icon ? <detection.icon className="h-3 w-3" /> : <Fingerprint className="h-3 w-3" />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                                            {detection.type}
                                        </div>
                                        <div className="text-[8px] font-mono text-slate-500 uppercase">{detection.source}</div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                    detection.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                                        detection.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                )}>
                                    {detection.severity}
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed font-medium">
                                {detection.message}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3 text-slate-600" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{detection.aoi || "Unknown Sector"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-slate-600" />
                                        <span className="text-[9px] font-mono text-slate-600 italic">{format(new Date(detection.timestamp), "HH:mm:ss")}</span>
                                    </div>
                                </div>
                                {detection.confidence && (
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500" style={{ width: detection.confidence }} />
                                        </div>
                                        <span className="text-[9px] font-black text-cyan-400/70">{detection.confidence}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <button className="w-full py-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-purple-500/30 text-[9px] font-black uppercase tracking-[0.2em] text-purple-200 hover:text-white hover:from-indigo-600/30 hover:to-purple-600/30 transition-all shadow-lg hover:shadow-purple-500/20">
                    Analyze Full Fusion Set
                </button>
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
      `}</style>
        </div>
    );
}
