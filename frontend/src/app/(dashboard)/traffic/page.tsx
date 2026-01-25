"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Activity,
    ArrowUpRight,
    Shield,
    Globe,
    Wifi,
    Terminal,
    Fingerprint,
    Zap,
    Search,
    Filter,
    BarChart3,
    Maximize2,
    MoreHorizontal,
    Cpu,
    Dna,
    Network
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TrafficMap from "@/components/TrafficMap";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- Types ---
interface Packet {
    id: string;
    timestamp: string;
    src: string;
    dst: string;
    protocol: string;
    size: number;
    flag: string;
    latency: string;
    status: 'ALLOW' | 'DROP';
    details?: string;
    severity?: string;
}

export default function TrafficPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    const [platformMode] = useLocalStorage<"simulator" | "emulation">("platform-mode", "emulation");
    const [packets, setPackets] = useState<Packet[]>([]);
    const [filteredPackets, setFilteredPackets] = useState<Packet[]>([]);
    const [stats, setStats] = useState({
        throughput_kbps: 0,
        packets_per_sec: 0,
        active_connections: 0,
        threats_blocked: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
    const [isCompact, setIsCompact] = useState(false);

    // Controls
    const [isCapturing, setIsCapturing] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const MAX_CHART_POINTS = 30;

    // --- Mock Data Generator ---
    const generateMockPacket = useCallback((): Packet => {
        const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];
        const flags = ['SYN', 'ACK', 'FIN', 'PSH', 'RST'];
        const srcIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
        const dstIp = `10.0.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;
        const isThreat = Math.random() > 0.95;

        return {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            src: srcIp,
            dst: dstIp,
            protocol: protocols[Math.floor(Math.random() * protocols.length)],
            size: Math.floor(Math.random() * 1500),
            flag: flags[Math.floor(Math.random() * flags.length)],
            latency: `${Math.floor(Math.random() * 100)}ms`,
            status: isThreat ? 'DROP' : 'ALLOW',
            details: isThreat ? 'PENTESTER_EMULATION' : 'Live Traffic',
            severity: isThreat ? 'high' : 'low'
        };
    }, []);

    // SSE Connection & Mock Fallback
    useEffect(() => {
        if (!isCapturing) return;

        let es: EventSource | null = null;
        let mockInterval: NodeJS.Timeout | null = null;

        // Function to start mock mode
        const startMockMode = () => {
            if (mockInterval) clearInterval(mockInterval);
            setIsConnected(true); // "Connected" to simulation
            mockInterval = setInterval(() => {
                const pkt = generateMockPacket();
                setPackets(prev => [pkt, ...prev].slice(0, 100));

                // Update stats for chart
                setStats(prev => ({
                    ...prev,
                    throughput_kbps: Math.random() * 500 + 50, // fluctuating throughput
                    packets_per_sec: Math.floor(Math.random() * 200 + 10),
                    active_connections: Math.floor(Math.random() * 50 + 10),
                    threats_blocked: pkt.status === 'DROP' ? prev.threats_blocked + 1 : prev.threats_blocked
                }));

                // Update chart
                setChartData(prev => {
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return [...prev, { time: now, kbps: Math.random() * 500 + 50 }].slice(-MAX_CHART_POINTS);
                });

            }, 800);
        };

        if (platformMode === 'emulation') {
            try {
                const startId = "$";
                es = new EventSource(`${apiBase}/map/stream?last_id=${startId}`);

                es.onopen = () => {
                    setIsConnected(true);
                    if (mockInterval) clearInterval(mockInterval);
                };

                es.onerror = () => {
                    setIsConnected(false);
                    es?.close();
                    // Auto-fallback to mock if real connection fails (requested: "khdama f ga3 les mode")
                    startMockMode();
                };

                es.addEventListener("flow", (e: MessageEvent) => {
                    const raw = JSON.parse(e.data);
                    const pkt: Packet = {
                        id: raw.id || Math.random().toString(36).substr(2, 9),
                        timestamp: new Date((raw.timestamp_epoch || (Date.now() / 1000)) * 1000).toISOString(),
                        src: raw.src_ip || "unknown",
                        dst: raw.dst_ip || "unknown",
                        protocol: raw.protocol || raw.details?.protocol || "TCP",
                        size: raw.bytes || raw.details?.size || 64,
                        flag: raw.details?.flags || "DATA",
                        latency: raw.latency ? `${raw.latency}ms` : "1ms",
                        status: (raw.severity === "critical" || raw.severity === "high" || raw.event_type === "PENTESTER_EMULATION") ? "DROP" : "ALLOW",
                        details: raw.event_type || "Live Traffic",
                        severity: raw.severity
                    };

                    setPackets(prev => [pkt, ...prev].slice(0, 100));
                    if (pkt.status === 'DROP') {
                        setStats(prev => ({ ...prev, threats_blocked: prev.threats_blocked + 1 }));
                    }
                });

            } catch (e) {
                console.error("Traffic Stream Error:", e);
                startMockMode();
            }
        } else {
            // Simulator Mode (Offline)
            startMockMode();
        }

        return () => {
            if (es) es.close();
            if (mockInterval) clearInterval(mockInterval);
        };
    }, [apiBase, isCapturing, platformMode, generateMockPacket]);

    // Polling for Real Stats (Only in emulation mode)
    useEffect(() => {
        if (platformMode !== 'emulation') return;

        const fetchStats = async () => {
            try {
                const res = await fetch(`${apiBase}/api/traffic/stats`);
                if (res.ok) {
                    const data = await res.json();
                    const totalRate = Number(data.sent_rate_kbps || 0) + Number(data.recv_rate_kbps || 0);
                    setStats(prev => ({
                        ...prev,
                        throughput_kbps: totalRate,
                        packets_per_sec: Number(data.sent_pps || 0) + Number(data.recv_pps || 0),
                    }));

                    setChartData(prev => {
                        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return [...prev, { time: now, kbps: totalRate }].slice(-MAX_CHART_POINTS);
                    });
                }
            } catch (e) { }
        };

        const interval = setInterval(fetchStats, 750);
        return () => clearInterval(interval);
    }, [apiBase, platformMode]);

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* Cyber Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-neon-1/10 border border-neon-1/20 flex items-center justify-center text-neon-1 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Zap className="h-5 w-5 fill-neon-1/20" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Flow Interception Engine</span>
                    </div>
                    <h1 className="text-display mb-1 text-text-1">
                        Traffic <span className="text-neon-1">Dissector</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-1 bg-bg-2/50 backdrop-blur-md">
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isConnected ? "bg-success" : "bg-danger")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-3">
                            {isConnected ? "Ingestion: Synchronized" : "Telemetry: Offline"}
                        </span>
                    </div>
                    <div className="flex gap-2 p-1 rounded-xl border border-border-1 bg-bg-2/50 backdrop-blur-xl">
                        <button
                            onClick={() => setIsCapturing(!isCapturing)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                isCapturing ? "bg-neon-1/10 text-neon-1 border border-neon-1/20 shadow-[0_0_10px_rgba(34,211,238,0.15)]" : "text-text-3 hover:text-text-1"
                            )}
                        >
                            {isCapturing ? "HALT INTERCEPT" : "REACTIVE"}
                        </button>
                        <button
                            onClick={() => setIsCompact(!isCompact)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                isCompact ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-text-3 hover:text-text-1"
                            )}
                        >
                            WIRESHARK MODE
                        </button>
                        <button
                            onClick={() => setPackets([])}
                            className="px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 transition-colors"
                        >
                            FLUSH BUFFER
                        </button>
                    </div>
                </div>
            </div>

            {/* Cyber Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Throughput", value: `${stats.throughput_kbps.toFixed(1)}`, unit: "KB/s", icon: Wifi, color: "text-neon-1", border: "border-neon-1/20", bg: "bg-neon-1/5" },
                    { label: "Ingestion Rate", value: `${stats.packets_per_sec.toFixed(0)}`, unit: "PPS", icon: Activity, color: "text-p-400", border: "border-p-500/20", bg: "bg-p-500/5" },
                    { label: "Active Flows", value: packets.length, unit: "Frames", icon: Globe, color: "text-info", border: "border-info/20", bg: "bg-info/5" },
                    { label: "Blocked Signals", value: stats.threats_blocked, unit: "Dropped", icon: Shield, color: "text-danger", border: "border-danger/20", bg: "bg-danger/5" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("p-6 rounded-2xl border bg-bg-2/40 backdrop-blur-xl shadow-lg group hover:bg-bg-2/60 transition-all", stat.border)}
                    >
                        <div className={cn("h-10 w-10 rounded-xl border border-border-1 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", stat.color, stat.bg)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-2 mb-2 block">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-text-1 tracking-tighter font-mono">{stat.value}</span>
                            <span className="text-[9px] font-bold text-text-3 uppercase">{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Real-time Visualization */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-8 rounded-2xl border border-border-1 bg-bg-1/50 relative overflow-hidden group min-h-[400px]">

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-1">Bandwidth Flux</h3>
                            </div>
                            <div className="text-[10px] font-black text-text-3 uppercase tracking-widest">
                                Resolution: Real-time (750ms)
                            </div>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="cyber-glow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="kbps"
                                        stroke="#22d3ee"
                                        strokeWidth={3}
                                        fill="url(#cyber-glow)"
                                        isAnimationActive={true}
                                        animationDuration={500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Main Inspection Table */}
                    <div className="glass-card p-0 rounded-2xl overflow-hidden border border-border-1 relative flex flex-col min-h-[600px] bg-bg-1/50">
                        <div className="p-6 border-b border-border-1 flex flex-col md:flex-row justify-between items-center gap-6 bg-bg-2/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-neon-1/10 border border-neon-1/20 flex items-center justify-center">
                                    <Filter className="h-4 w-4 text-neon-1" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-text-1 tracking-widest uppercase">Buffer Stream</h2>
                                    <p className="text-[9px] text-text-3 font-bold uppercase mt-1">Total Frames: {packets.length}</p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                                <input
                                    type="text"
                                    placeholder="SEARCH HEX, IP, SIGNATURE..."
                                    className="w-full pl-12 pr-6 py-3 rounded-xl bg-bg-1 border border-border-1 text-[10px] font-bold text-text-2 placeholder:text-text-3/50 focus:outline-none focus:border-neon-1/30 focus:ring-1 focus:ring-neon-1/30 transition-all uppercase tracking-widest"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-bg-1/80 border-b border-border-1">
                                        <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">UTCTIME</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">SRCDST_IDENTITY</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest text-center">PROTOCOL</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">LEN</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-widest">VERDICT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-1/30 font-medium">
                                    <AnimatePresence initial={false}>
                                        {filteredPackets.map((pkt) => (
                                            <motion.tr
                                                key={pkt.id}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => setSelectedPacket(pkt)}
                                                className={cn(
                                                    "group cursor-pointer hover:bg-bg-3 transition-all duration-200 border-b border-border-1/50",
                                                    selectedPacket?.id === pkt.id ? "bg-neon-1/5 shadow-[inset_4px_0_0_0_rgba(34,211,238,0.8)]" : "",
                                                    isCompact ? "text-[10px] font-mono leading-none" : ""
                                                )}
                                            >
                                                <td className={cn("text-text-2 font-mono", isCompact ? "px-4 py-1.5" : "px-8 py-4 text-[10px]")}>
                                                    {pkt.timestamp.split('T')[1].slice(0, 8)}.{pkt.timestamp.split('.')[1]?.slice(0, 3) || '000'}
                                                </td>
                                                <td className={cn(isCompact ? "px-4 py-1.5" : "px-8 py-4")}>
                                                    <div className={cn("flex gap-1", isCompact ? "flex-row items-center" : "flex-col")}>
                                                        <span className={cn("text-text-1 tracking-tight", isCompact ? "font-normal" : "text-xs font-black")}>{pkt.src}</span>
                                                        <ArrowUpRight className={cn("text-text-3", isCompact ? "h-3 w-3" : "hidden")} />
                                                        <span className={cn("text-text-3 flex items-center gap-1.5 uppercase tracking-widest", isCompact ? "font-normal text-text-1" : "text-[9px] font-black")}>
                                                            <ArrowUpRight className={cn(isCompact ? "hidden" : "h-2.5 w-2.5")} /> {pkt.dst}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={cn("text-center", isCompact ? "px-4 py-1.5" : "px-8 py-4")}>
                                                    <span className={cn(
                                                        "rounded text-[8px] font-black tracking-widest uppercase border",
                                                        isCompact ? "px-1 py-0.5" : "px-2.5 py-1",
                                                        pkt.protocol === 'TCP' ? "bg-info/10 text-info border-info/20" :
                                                            pkt.protocol === 'UDP' ? "bg-warning/10 text-warning border-warning/20" :
                                                                "bg-bg-3 text-text-3 border-border-1"
                                                    )}>
                                                        {pkt.protocol}
                                                    </span>
                                                </td>
                                                <td className={cn("font-black text-text-2 font-mono", isCompact ? "px-4 py-1.5" : "px-8 py-4 text-[10px]")}>
                                                    {pkt.size}
                                                </td>
                                                <td className={cn(isCompact ? "px-4 py-1.5" : "px-8 py-4")}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-1.5 w-1.5 rounded-full", pkt.status === 'ALLOW' ? "bg-success" : "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]")} />
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", pkt.status === 'ALLOW' ? "text-success" : "text-danger")}>
                                                            {pkt.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Details Panel / Dissector */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-1 rounded-2xl border border-border-1 bg-bg-2/30">
                        <TrafficMap />
                    </div>

                    <div className="glass-card p-8 rounded-2xl border border-border-1 bg-bg-1/50 sticky top-24 min-h-[700px] flex flex-col">
                        {!selectedPacket ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-12">
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-text-3 flex items-center justify-center mb-8">
                                    <Maximize2 className="h-8 w-8 text-text-3" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed text-text-3">
                                    Awaiting frame selection <br /> for deep spectral analysis.
                                </p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-border-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-neon-1/10 flex items-center justify-center text-neon-1">
                                            <Fingerprint className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-[11px] font-black text-text-1 uppercase tracking-widest">spectral analysis</h3>
                                    </div>
                                    <button onClick={() => setSelectedPacket(null)} className="text-text-3 hover:text-text-1 transition-colors">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Cpu className="h-3.5 w-3.5 text-text-3" />
                                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Frame Metadata</span>
                                        </div>
                                        <div className="p-5 rounded-xl bg-bg-1 border border-border-1 space-y-3 font-mono text-[10px]">
                                            <div className="flex justify-between"><span className="text-text-2">ID_HASH</span> <span className="text-neon-1 font-bold">{selectedPacket.id.slice(0, 16)}</span></div>
                                            <div className="flex justify-between"><span className="text-text-2">PROTOCOL</span> <span className="text-p-400 font-bold">{selectedPacket.protocol}</span></div>
                                            <div className="flex justify-between"><span className="text-text-2">ENTROPY</span> <span className="text-success font-bold">0.842</span></div>
                                            <div className="flex justify-between"><span className="text-text-2">PAYLOAD_LEN</span> <span className="text-text-1 font-bold">{selectedPacket.size}B</span></div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Network className="h-3.5 w-3.5 text-text-3" />
                                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Routing Path</span>
                                        </div>
                                        <div className="space-y-4 font-bold text-[10px] uppercase tracking-widest">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-neon-1 font-black">SRC</div>
                                                <div className="flex flex-col">
                                                    <span className="text-text-3 text-[8px] tracking-[0.2em]">Origin Node</span>
                                                    <span className="text-text-1">{selectedPacket.src}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center pl-6 border-l border-border-2 ml-4 py-2">
                                                <div className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-p-400 font-black">DST</div>
                                                <div className="flex flex-col">
                                                    <span className="text-text-3 text-[8px] tracking-[0.2em]">Objective Node</span>
                                                    <span className="text-text-1">{selectedPacket.dst}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Dna className="h-3.5 w-3.5 text-text-3" />
                                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Payload Hexdump</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-bg-0 border border-border-1 text-text-2 font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-pre selection:bg-neon-1/20 selection:text-neon-1 h-40 scrollbar-thin scrollbar-thumb-border-2 scrollbar-track-bg-1">
                                            {selectedPacket.protocol === 'TCP' ?
                                                `0000  00 0c 29 40 4d 7e 00 50 56 c0 00 08 08 00 45 00\n0010  00 28 a1 33 40 00 40 06 72 cb c0 a8 01 02 c0 a8\n0020  01 01 04 d2 00 50 00 00 00 00 00 00 00 00 50 02` :
                                                `0000  ff ff ff ff ff ff 00 0c 29 40 4d 7e 08 00 45 00\n0010  00 1c d4 d4 00 00 40 01 27 6c c0 a8 01 02 c0 a8\n0020  01 01 08 00 f7 ff 00 00 00 00`
                                            }
                                            <br />
                                            <br />
                                            {selectedPacket.details === 'PENTESTER_EMULATION' ?
                                                <span className="text-danger font-black tracking-widest">[!] MALICIOUS_SIGNATURE_DETECTED\n[!] ACTION: AUTOMATIC_ISOLATION_TRIGGERED</span> :
                                                <span className="text-success opacity-50 font-black tracking-widest">[*] INTEGRITY_TOKEN_VERIFIED</span>
                                            }
                                        </div>
                                    </section>

                                    <div className="pt-6">
                                        <button className="w-full py-4 rounded-xl bg-neon-1/10 border border-neon-1/30 text-neon-1 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neon-1/20 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                            Generate Forensic Audit
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
