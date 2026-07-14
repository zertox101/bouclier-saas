"use client";

import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";
import { 
    Activity, Shield, Zap, Cpu, Layers, Share2, Database, AlertTriangle, Maximize2, Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ENDPOINTS, fetchAPI } from "@/lib/api-config";

export default function AnalyticsProPage() {
    const [mounted, setMounted] = useState(false);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [sources, setSources] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const [statRes, sourceRes, eventRes] = await Promise.all([
                fetchAPI<any>(ENDPOINTS.TRAFFIC_STATS),
                fetchAPI<any>(ENDPOINTS.SOURCES),
                fetchAPI<any>(ENDPOINTS.EVENTS)
            ]);
            if (statRes.data) setTelemetry(statRes.data);
            if (sourceRes.data) setSources(sourceRes.data);
            if (eventRes.data) {
                const rawEvents = Array.isArray(eventRes.data)
                    ? eventRes.data
                    : eventRes.data.events || eventRes.data.items || [];
                setEvents(rawEvents.slice(0, 20));
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Transform Sankey Data from Backend
    const sankeyData = useMemo(() => {
        if (!sources) return { nodes: [], links: [] };
        const nodes = [
            ...sources.sources.left.map((n: string) => ({ name: n })),
            ...sources.sources.right.map((n: string) => ({ name: n }))
        ];
        const weights = sources.sources.weights || {};
        const totalPackets = Number(telemetry?.total_packets || telemetry?.inbound_packets || 0);
        const defaultValue = Math.max(1, Math.ceil(totalPackets / Math.max(1, sources.sources.left.length * sources.sources.right.length)));
        const links = sources.sources.left.flatMap((l: string) =>
            sources.sources.right.map((r: string) => ({
                source: l,
                target: r,
                value: Number(weights[`${l}:${r}`] || weights[l]?.[r] || defaultValue)
            }))
        );
        return { nodes, links };
    }, [sources, telemetry]);

    const sankeyOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        series: [{
            type: 'sankey',
            data: sankeyData.nodes.length > 0 ? sankeyData.nodes : [{name: 'Loading...'}],
            links: sankeyData.links,
            lineStyle: { color: 'gradient', opacity: 0.3 },
            label: { color: '#94a3b8', fontSize: 10 }
        }]
    };

    // 2. RADAR THREAT POSTURE
    const packetLoad = Math.min(100, Math.round(Number(telemetry?.packets_per_second || telemetry?.pps || telemetry?.total_packets || 0) / 10));
    const blockedLoad = Math.min(100, Math.round(Number(telemetry?.blocked_packets || telemetry?.blocked || 0)));
    const anomalyLoad = Math.min(100, Math.round(Number(telemetry?.anomalies || telemetry?.alerts || events.length || 0) * 10));
    const normalLoad = Math.max(0, 100 - anomalyLoad);

    const radarOption = {
        backgroundColor: 'transparent',
        radar: {
            indicator: [
                { name: 'FIREWALL', max: 100 },
                { name: 'AI_SENTINEL', max: 100 },
                { name: 'IDPS', max: 100 },
                { name: 'ENCRYPTION', max: 100 },
                { name: 'RECON_SHIELD', max: 100 },
                { name: 'AUTH_GATE', max: 100 }
            ],
            shape: 'circle',
            splitNumber: 5,
            axisName: { color: 'rgba(148, 163, 184, 0.8)' },
            splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
            splitArea: { areaStyle: { color: ['rgba(30, 41, 59, 0.2)', 'rgba(30, 41, 59, 0.4)'] } }
        },
        series: [{
            name: 'Defense Status',
            type: 'radar',
            data: [{
                value: [blockedLoad, normalLoad, packetLoad, normalLoad, blockedLoad, Math.max(0, 100 - events.length)],
                name: 'Current Score',
                areaStyle: { color: 'rgba(6, 182, 212, 0.3)' },
                lineStyle: { color: '#06b6d4', width: 2 },
                symbol: 'none'
            }]
        }]
    };

    // 3. REAL-TIME THROUGHPUT GAUGE
    const getGaugeOption = (value: number, label: string, unit: string, max: number) => ({
        series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            radius: '100%',
            center: ['50%', '75%'],
            min: 0,
            max,
            splitNumber: 8,
            axisLine: {
                lineStyle: {
                    width: 6,
                    color: [
                        [0.25, '#10b981'],
                        [0.75, '#f59e0b'],
                        [1, '#ef4444']
                    ]
                }
            },
            pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'inherit' } },
            axisTick: { length: 12, lineStyle: { color: 'inherit', width: 2 } },
            splitLine: { length: 20, lineStyle: { color: 'inherit', width: 5 } },
            axisLabel: { color: '#464646', fontSize: 10, distance: -60 },
            title: { offsetCenter: [0, '-20%'], fontSize: 20 },
            detail: { fontSize: 30, offsetCenter: [0, '0%'], valueAnimation: true, formatter: `{value} ${unit}`, color: 'inherit' },
            data: [{ value, name: label }]
        }]
    });

    const pps = Number(telemetry?.packets_per_second || telemetry?.pps || 0);
    const inbound = Number(telemetry?.inbound_packets || 0);
    const outbound = Number(telemetry?.outbound_packets || 0);
    const latestEventsText = events.length > 0
        ? events.map((event) => `[${event.severity || event.type || "EVENT"}] ${event.message || event.title || event.event || "Telemetry event"} ${event.src_ip || event.source || ""}`.trim())
        : ["Waiting for real backend telemetry events"];

    if (!mounted) return null;

    return (
        <div className="h-full text-slate-100 font-sans selection:bg-cyan-500/30">
            
            {/* 1. TOP HEADER NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                        <span className="text-cyan-500 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Layers className="h-8 w-8" />
                        </span>
                        Intelligence <span className="text-slate-500">Analytics</span>
                        <div className="h-6 w-px bg-white/10 mx-4 hidden md:block" />
                        <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase animate-pulse hidden md:inline">Neural Uplink: Active</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 pr-6">
                    <div className="h-10 w-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Live Sampling</span>
                        <span className="text-xs font-black uppercase tracking-widest text-white">{pps.toLocaleString()} Events/sec</span>
                    </div>
                </div>
            </div>

            {/* 2. MAIN ANALYTICS GRID */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* 2.1 THREAT FLOW (Large Sankey) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-12 lg:col-span-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 relative group"
                >
                    <div className="absolute top-4 right-8 flex items-center gap-4 opacity-50">
                        <Share2 className="h-4 w-4 cursor-pointer hover:text-cyan-400 transition-colors" />
                        <Maximize2 className="h-4 w-4 cursor-pointer hover:text-cyan-400 transition-colors" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-3">
                        <Database className="h-4 w-4 text-cyan-500" /> Attack Vector Propagation
                    </h2>
                    <div className="h-[450px]">
                        <ReactECharts option={sankeyOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </motion.div>

                {/* 2.2 DEFENSE RADAR */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-12 lg:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-3 relative z-10">
                        <Shield className="h-4 w-4 text-cyan-500 animate-pulse" /> Security Posture
                    </h2>
                    <div className="h-[350px] relative z-10">
                        <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Health Score</span>
                            <span className="text-2xl font-black text-emerald-400 tracking-tighter">{normalLoad}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Anomalies</span>
                            <span className="text-2xl font-black text-amber-500 tracking-tighter">{events.length}</span>
                        </div>
                    </div>
                </motion.div>

                {/* 2.3 REAL-TIME GAUGES (Bottom Row) */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "TRAFFIC_FLOW_PPS", value: pps, label: "PPS", unit: "", max: Math.max(1000, pps * 2), icon: Zap, color: "cyan" },
                        { title: "INBOUND_PACKETS", value: inbound, label: "IN", unit: "", max: Math.max(1000, inbound * 2), icon: Cpu, color: "fuchsia" },
                        { title: "OUTBOUND_PACKETS", value: outbound, label: "OUT", unit: "", max: Math.max(1000, outbound * 2), icon: Clock, color: "emerald" }
                    ].map((gauge, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-black/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex flex-col items-center group overflow-hidden relative"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6 flex items-center gap-2">
                                <gauge.icon className={cn("h-3.5 w-3.5", `text-${gauge.color}-500`)} /> {gauge.title}
                            </h3>
                            <div className="h-[200px] w-full">
                                <ReactECharts option={getGaugeOption(gauge.value, gauge.label, gauge.unit, gauge.max)} style={{ height: '100%', width: '100%' }} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2.4 LIVE EVENT TAPE */}
                <div className="col-span-12 bg-cyan-600/10 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-6 overflow-hidden">
                    <div className="flex items-center gap-3 shrink-0">
                        <AlertTriangle className="h-4 w-4 text-cyan-400 group-hover:animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Tactical_Stream:</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <motion.div 
                            animate={{ x: '-100%' }}
                            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                            className="flex gap-12 whitespace-nowrap text-[10px] font-mono text-slate-400"
                        >
                            {[...latestEventsText, ...latestEventsText].map((t, idx) => (
                                <span key={idx}>{t}</span>
                            ))}
                        </motion.div>
                    </div>
                </div>

            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
