"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Activity, Globe, Zap, Search, Layers, Shield,
    Terminal, Fingerprint, Eye, Wifi, BarChart3,
    Clock, Database, ArrowUpRight, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { apiClient } from '@/lib/api-client';

// Dynamic imports for heavy components
const ThreatMap2D = dynamic(() => import("@/components/maps/ThreatMap2D"), { ssr: false });
const ThreatMapPro = dynamic(() => import("@/components/maps/ThreatMapPro"), { ssr: false });

type ViewMode = "flows" | "packets" | "threats";

export default function NetworkIntelligence() {
    const [view, setView] = useState<ViewMode>("flows");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-8 pb-20">
            {/* Senior Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pt-4">
                <div className="space-y-2">
                    <div className="section-label">Signal Intelligence</div>
                    <h1 className="display-title italic">Systems <span className="text-violet-400">Intelligence</span></h1>
                    <p className="body-medium max-w-xl">
                        Consolidated multi-layer network observation portal.
                        Real-time flow analysis, deep packet inversion, and global threat synchronization.
                    </p>
                </div>

                <div className="flex bg-[#0D0C18] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                    {(["flows", "packets", "threats"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setView(mode)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                view === mode
                                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="min-h-[600px]"
                >
                    {view === "flows" && <FlowsView />}
                    {view === "packets" && <PacketsView />}
                    {view === "threats" && <ThreatsView />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// --- Flows View (Combined Traffic) ---
function FlowsView() {
    const [flows, setFlows] = useState<any[]>([]);
    const [stats, setStats] = useState({ throughput: 0, threats: 0 });

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await apiClient('/api/traffic/live');
                if (data) {
                    setFlows(prev => [...(data.connections || []), ...prev].slice(0, 50));
                }
            } catch (e) { }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 premium-card p-0 flex flex-col h-[700px]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-violet-400" />
                        <span className="caption-bold">Live Flow Stream</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0D0C18] z-10 border-b border-white/5">
                            <tr className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Protocol</th>
                                <th className="px-6 py-4 text-right">Verdict</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] font-mono text-[10px]">
                            {flows.map((f, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-3 text-slate-300 group-hover:text-violet-300">{f.src_ip}</td>
                                    <td className="px-6 py-3 text-slate-400">{f.dst_ip}:{f.dst_port}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[8px] font-black border border-white/5">
                                            {f.service || "TCP"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-tight",
                                            f.severity === "Critique" ? "text-red-500" : "text-emerald-500"
                                        )}>
                                            {f.severity === "Critique" ? "BLOCKED" : "ALLOWED"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="premium-card p-8 bg-gradient-to-br from-[#0D0C18] to-violet-950/10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="caption-bold">Network Load</div>
                        <Zap className="h-4 w-4 text-violet-400 animate-pulse" />
                    </div>
                    <div className="text-4xl font-black tracking-tighter mb-2 italic">12.4 <span className="text-sm opacity-30 not-italic">GBPS</span></div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-violet-500"
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                        />
                    </div>
                </div>

                <div className="premium-card p-0 h-[450px] overflow-hidden">
                    <ThreatMap2D />
                </div>
            </div>
        </div>
    );
}

// --- Packets View (Real Live Traffic) ---
function PacketsView() {
    const [packets, setPackets] = useState<any[]>([]);

    useEffect(() => {
        const fetchPackets = async () => {
            try {
                const data = await apiClient('/api/traffic/live');
                if (data) {
                    const mapped = (data.connections || []).map((conn: any) => ({
                        id: conn.id || `${conn.src_ip}:${conn.src_port}`,
                        len: conn.bytes_sent || (conn.src_port + conn.dst_port),
                        proto: conn.service || conn.protocol || "TCP",
                        src: conn.src_ip,
                        dst: conn.dst_ip,
                        delta: conn.duration ? conn.duration.toFixed(4) : "0.0000",
                        state: conn.state || "ESTABLISHED",
                    }));
                    setPackets(prev => [...mapped, ...prev].slice(0, 30));
                }
            } catch (e) {}
        };
        fetchPackets();
        const interval = setInterval(fetchPackets, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
            <div className="lg:col-span-8 premium-card p-0 flex flex-col overflow-hidden bg-black/40">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Layers className="h-5 w-5 text-violet-400" />
                        <span className="caption-bold">Deep Packet Dissection</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0D0C18] z-10 border-b border-white/5">
                            <tr className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4">Frame_ID</th>
                                <th className="px-6 py-4">Length</th>
                                <th className="px-6 py-4">Protocol</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Delta (ms)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] font-mono text-[10px]">
                            <AnimatePresence>
                                {packets.map((p, i) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="hover:bg-violet-500/5 transition-colors group"
                                    >
                                        <td className="px-6 py-3 text-violet-400 font-bold">{p.id}</td>
                                        <td className="px-6 py-3 text-slate-400">{p.len} B</td>
                                        <td className="px-6 py-3">
                                            <span className="text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px]">{p.proto}</span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500">{p.src}</td>
                                        <td className="px-6 py-3 text-slate-600 text-[9px]">{p.delta}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="premium-card p-10 flex flex-col items-center justify-center text-center space-y-8 h-full">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-[32px] bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 cyber-glow">
                            <Fingerprint className="h-10 w-10" />
                        </div>
                        <div className="absolute -inset-4 bg-violet-500 rounded-full blur-3xl opacity-10 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Payload Analysis</h3>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                            Surgical inversion of cryptographic frames.
                            Identifying hidden patterns in encrypted streams.
                        </p>
                    </div>
                    <div className="w-full pt-4 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Buffer Load</span>
                            <span className="text-violet-400">42%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500" initial={{ width: 0 }} animate={{ width: "42%" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Threats View (Map & Global) ---
function ThreatsView() {
    return (
        <div className="premium-card p-0 h-[750px] relative">
            <ThreatMapPro />
            <div className="absolute top-8 left-8 space-y-4">
                <div className="premium-card p-4 bg-black/80 backdrop-blur-3xl border border-white/10 w-64 shadow-2xl">
                    <div className="caption-bold mb-3 text-red-500">Live Incursions</div>
                    <div className="space-y-3">
                        {[
                            { target: "Casablanca DC-01", type: "SQL Injection", time: "2s ago" },
                            { target: "Rabat Edge RT-04", type: "DDoS Flood", time: "14s ago" },
                            { target: "Tangier Hub-12", type: "Brute Force", time: "1m ago" },
                        ].map((t, i) => (
                            <div key={i} className="flex justify-between items-center text-[9px] font-mono border-l border-red-500/30 pl-3">
                                <div className="space-y-0.5">
                                    <div className="text-white font-bold">{t.target}</div>
                                    <div className="text-red-400 opacity-70">{t.type}</div>
                                </div>
                                <div className="text-slate-600">{t.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
