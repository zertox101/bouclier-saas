"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Activity,
    ArrowUpRight,
    Shield,
    Globe,
    Terminal,
    Fingerprint,
    Zap,
    Search,
    Filter,
    BarChart3,
    Maximize2,
    Eye,
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import TrafficMap from "@/components/TrafficMap";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { apiClient } from '@/lib/api-client';

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
    hex?: string;
}

export default function TrafficPage() {
    // Force 'emulation' (Real Data) mode, ignore simulator preference
    const platformMode = "emulation";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [isCapturing, setIsCapturing] = useState(true);
    const MAX_CHART_POINTS = 50;

    // Filter Logic
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPackets(packets);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredPackets(packets.filter(p =>
                p.src.includes(term) ||
                p.dst.includes(term) ||
                p.protocol.toLowerCase().includes(term) ||
                (p.details && p.details.toLowerCase().includes(term))
            ));
        }
    }, [searchTerm, packets]);

    // Fetch Live Traffic Connections (REAL DATA ONLY)
    const fetchLiveTraffic = useCallback(async () => {
        try {
            const data = await apiClient('/api/traffic/live');
            if (data) {
                setIsConnected(true);

                const mappedPackets: Packet[] = (data.connections || []).map((conn: any) => ({
                    id: Math.random().toString(36).substr(2, 9), // UI ID only
                    timestamp: conn.timestamp || new Date().toISOString(),
                    src: conn.src_ip,
                    dst: `${conn.dst_ip}:${conn.dst_port}`,
                    protocol: conn.service || "TCP",
                    size: conn.src_port + conn.dst_port, // Approximation if bytes missing
                    flag: conn.state || "ESTABLISHED",
                    latency: "1ms", // Placeholder until backend provides latency
                    status: (conn.severity === "Critique" || conn.severity === "Élevé") ? 'DROP' : 'ALLOW',
                    details: conn.alerts?.[0] || 'Real-Time Flow',
                    severity: conn.severity === "Critique" ? 'high' : 'low',
                }));

                if (mappedPackets.length > 0) {
                    setPackets(prev => {
                        // Merge new packets at the top
                        const combined = [...mappedPackets, ...prev].slice(0, 500);
                        return combined;
                    });
                }
            }
        } catch (e) {
            console.error("Live Traffic Fetch Error:", e);
            setIsConnected(false);
        }
    }, []);

    // Polling for Real Stats
    useEffect(() => {
        if (!isCapturing) return;

        const fetchStats = async () => {
            try {
                const data = await apiClient('/api/traffic/stats');
                if (data) {
                    const totalRate = Number(data.inbound_rate || 0) + Number(data.outbound_rate || 0);

                    setStats({
                        throughput_kbps: totalRate,
                        packets_per_sec: Number(data.inbound_packets_rate || 0) + Number(data.outbound_packets_rate || 0),
                        active_connections: packets.length, // approximation based on buffer
                        threats_blocked: Object.values(data.severity || {}).reduce((a: any, b: any) => a + b, 0) as number
                    });

                    setChartData(prev => {
                        const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return [...prev, { time: now, kbps: totalRate }].slice(-MAX_CHART_POINTS);
                    });
                }
            } catch (e) { }
        };

        // Poll every 1s
        const interval = setInterval(() => {
            fetchLiveTraffic();
            fetchStats();
        }, 1000);

        return () => clearInterval(interval);
    }, [isCapturing, fetchLiveTraffic, apiBase, packets.length]);


    return (
        <div className="h-full text-text-1 font-sans selection:bg-neon-1/30 selection:text-white pb-20 relative">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                {/* Vertical Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100px_100%]"></div>
            </div>

            <div className="relative z-10 px-6 pt-6 max-w-[1920px] mx-auto space-y-6">

                {/* HEADER */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <Activity className="h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                                Network <span className="text-cyan-400">Traffic</span>
                                <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">REAL_TIME_FEED</span>
                            </h1>
                            <div className="text-[10px] font-mono text-text-3 uppercase tracking-[0.3em] flex items-center gap-4">
                                <span>Session_ID: {new Date().toISOString().slice(0,10).replace(/-/g,'')}-NET</span>
                                <span className="flex items-center gap-1">
                                    <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isConnected ? "bg-green-500" : "bg-red-500")}></span>
                                    {isConnected ? "UPLINK_ESTABLISHED" : "SEARCHING_UPLINK..."}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsCapturing(!isCapturing)} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 flex items-center gap-2", isCapturing ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse-slow" : "bg-cyan-500/10 border-cyan-500/50 text-cyan-400")}>
                            {isCapturing ? <><div className="h-2 w-2 bg-red-500 rounded-sm animate-spin" /> STOP_CAPTURE</> : <><div className="h-2 w-2 bg-cyan-400 rounded-full" /> START_CAPTURE</>}
                        </button>
                    </div>
                </header>

                {/* VISUALIZATION ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
                    {/* Main Graph */}
                    <div className="lg:col-span-9 bg-black/40 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                        {/* Decorative Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

                        <div className="absolute top-4 left-6 z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-2 mb-1">Bandwidth Throughput</h3>
                            <div className="text-2xl font-mono text-cyan-400">{stats.throughput_kbps.toFixed(2)} <span className="text-sm text-cyan-600">KB/s</span></div>
                        </div>

                        <div className="h-full w-full pt-10">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorKbps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide domain={[0, 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', fontSize: '10px' }}
                                            itemStyle={{ color: '#22d3ee' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="kbps"
                                            stroke="#22d3ee"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorKbps)"
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-text-3 font-mono text-xs uppercase tracking-widest">
                                    No Traffic Data Available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Stats */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {/* Card 1 */}
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-50 group-hover:scale-110 transition-transform"><Activity className="h-12 w-12 text-transparent stroke-purple-500/20" /></div>
                            <div className="text-[9px] font-black uppercase text-text-3 tracking-[0.2em] mb-2">Ingestion_Rate</div>
                            <div className="text-4xl font-mono text-white tracking-tighter">{stats.packets_per_sec.toFixed(0)} <span className="text-xs text-purple-400">PPS</span></div>
                            <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[60%] animate-pulse"></div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-red-500/30 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-50 group-hover:scale-110 transition-transform"><Shield className="h-12 w-12 text-transparent stroke-red-500/20" /></div>
                            <div className="text-[9px] font-black uppercase text-text-3 tracking-[0.2em] mb-2">Threats_Blocked</div>
                            <div className="text-4xl font-mono text-white tracking-tighter">{stats.threats_blocked} <span className="text-xs text-red-400">EVT</span></div>
                            <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[12%] animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - SPLIT VIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

                    {/* LEFT: PACKET LIST (2 COLS) */}
                    <div className="lg:col-span-2 bg-black/60 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm">

                        {/* Toolbar */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-2">
                                <Terminal className="h-4 w-4 text-cyan-500" />
                                <span>Live_Capture_Buffer</span>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-3" />
                                    <input
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="FILTER STREAM"
                                        className="pl-7 pr-3 py-1.5 bg-black/40 border border-white/10 rounded text-[10px] text-white focus:border-cyan-500/50 outline-none w-48 font-mono placeholder:text-white/20 uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-4 py-2 border-b border-white/5 bg-black/20 text-[9px] font-black uppercase tracking-widest text-text-3 select-none">
                            <div className="col-span-2">Time</div>
                            <div className="col-span-3">Source</div>
                            <div className="col-span-3">Destination</div>
                            <div className="col-span-1 text-center">Proto</div>
                            <div className="col-span-1 text-right">Len</div>
                            <div className="col-span-2 text-right">Status</div>
                        </div>

                        {/* Table Body - Virtualized feel */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px]">
                            {filteredPackets.length === 0 ? (
                                <div className="p-8 text-center text-text-3 uppercase tracking-widest opacity-50">
                                    Buffering Real-Time Data...
                                </div>
                            ) : (
                                filteredPackets.map((pkt, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedPacket(pkt)}
                                        className={cn(
                                            "grid grid-cols-12 px-4 py-1.5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors items-center group",
                                            selectedPacket?.id === pkt.id && "bg-cyan-500/10 border-l-2 border-l-cyan-500"
                                        )}
                                    >
                                        <div className="col-span-2 text-text-3 group-hover:text-white">{pkt.timestamp.split('T')[1]?.slice(0, 12) || pkt.timestamp}</div>
                                        <div className="col-span-3 text-cyan-200 truncate pr-2" title={pkt.src}>{pkt.src}</div>
                                        <div className="col-span-3 text-purple-200 truncate pr-2" title={pkt.dst}>{pkt.dst}</div>
                                        <div className="col-span-1 text-center">
                                            <span className={cn("px-1 rounded text-[9px] font-bold", pkt.protocol === 'TCP' ? "bg-blue-500/20 text-blue-400" : pkt.protocol === 'UDP' ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white")}>
                                                {pkt.protocol}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-right text-text-3">{pkt.size}</div>
                                        <div className="col-span-2 text-right">
                                            <span className={cn("uppercase font-bold tracking-wider", pkt.status === 'ALLOW' ? "text-green-500" : "text-red-500 animate-pulse")}>
                                                {pkt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {/* Scroll Anchor */}
                            <div className="h-10"></div>
                        </div>
                    </div>

                    {/* RIGHT: INSPECTOR (1 COL) */}
                    <div className="lg:col-span-1 flex flex-col gap-6">

                        {/* Hex Dump Panel */}
                        <div className="flex-1 bg-black/80 border border-white/10 rounded-2xl flex flex-col overflow-hidden sticky top-6">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-2">
                                    <Fingerprint className="h-4 w-4 text-purple-500" />
                                    <span>Payload_Inspector</span>
                                </div>
                                {selectedPacket && <div className="text-[10px] font-mono text-purple-400">ID: {selectedPacket.id}</div>}
                            </div>

                            <div className="flex-1 p-4 overflow-hidden relative">
                                {!selectedPacket ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <Eye className="h-12 w-12 mb-4 animate-pulse" />
                                        <div className="text-xs uppercase tracking-widest">Awaiting Selection</div>
                                    </div>
                                ) : (
                                    <div className="h-full overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed text-text-3 select-text">
                                        {/* Real metadata view since we don't store full payload bytes yet */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="text-white/40 uppercase tracking-widest">Source</div>
                                            <div className="text-right text-white select-all">{selectedPacket.src}</div>
                                            <div className="text-white/40 uppercase tracking-widest">Destination</div>
                                            <div className="text-right text-white select-all">{selectedPacket.dst}</div>
                                            <div className="text-white/40 uppercase tracking-widest">Protocol</div>
                                            <div className="text-right text-yellow-400">{selectedPacket.protocol}</div>
                                            <div className="text-white/40 uppercase tracking-widest">State</div>
                                            <div className="text-right text-cyan-400">{selectedPacket.flag}</div>
                                        </div>

                                        <div className="p-3 bg-black/50 rounded border border-white/5">
                                            <div className="text-[9px] uppercase text-text-3 mb-2 tracking-widest border-b border-white/5 pb-1">Packet Analysis</div>
                                            <p className="text-text-2 mb-2">{selectedPacket.details}</p>
                                            <div className={cn("text-xs font-bold uppercase", selectedPacket.status === 'DROP' ? "text-red-500" : "text-green-500")}>
                                                Verdict: {selectedPacket.status}
                                            </div>
                                        </div>

                                        <div className="mt-4 text-center text-white/20 text-[9px] uppercase">
                                            ** Raw payload capture disabled in passive mode **
                                        </div>
                                    </div>
                                )}

                                {/* Scanline Overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,23,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
                            </div>
                        </div>

                        {/* Minimap (using the TrafficMap component) */}
                        <div className="h-48 bg-black/40 border border-white/10 rounded-2xl overflow-hidden relative">
                            <TrafficMap />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
