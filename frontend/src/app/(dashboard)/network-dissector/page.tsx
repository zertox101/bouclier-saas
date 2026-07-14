"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Activity, ArrowUpRight, Shield, Globe, Wifi, Terminal, Fingerprint, Zap, Search, Filter, 
    BarChart3, Maximize2, MoreHorizontal, Cpu, Dna, Network, Play, Square, RefreshCw, Database, 
    Layers, Clock, Eye, ChevronRight, X
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/lib/api-client';

// --- Types ---
interface TsharkPacket {
    timestamp: string;
    layers: {
        frame?: any;
        eth?: any;
        ip?: any;
        tcp?: any;
        udp?: any;
        dns?: any;
        http?: any;
        tls?: any;
        data?: any;
        [key: string]: any;
    };
    raw: any;
}

interface Interface {
    id: string;
    name: string;
    description: string;
}

export default function NetworkDissectorPage() {
    const apiBase = process.env.NEXT_PUBLIC_TOOLS_API_BASE || 'http://localhost:8100';

    const [interfaces, setInterfaces] = useState<Interface[]>([]);
    const [selectedInterface, setSelectedInterface] = useState<string>("eth0");
    const [packets, setPackets] = useState<TsharkPacket[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [filter, setFilter] = useState("");
    const [selectedPacket, setSelectedPacket] = useState<TsharkPacket | null>(null);
    const [stats, setStats] = useState({ total: 0, tcp: 0, udp: 0, dns: 0, http: 0, tls: 0, other: 0, pps: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isInterfaceLoading, setIsInterfaceLoading] = useState(false);
    const [menuPacketId, setMenuPacketId] = useState<number | null>(null);

    const handlePacketAction = async (packet: any, action: string) => {
        setMenuPacketId(null);
        
        try {
            const data = await apiClient('/api/network/action', {
                method: 'POST',
                json: {
                    action: action,
                    packet_id: packet.layers?.frame?.["frame.number"] || 'unknown'
                }
            });
            
            if (data.status === 'success') {
                // Afficher notification de succès
                window.dispatchEvent(new CustomEvent('notify', { 
                   detail: { 
                       message: `${action} executed: ${data.message}`, 
                       type: 'success' 
                   } 
                }));
            } else {
                throw new Error(data.message || 'Action failed');
            }
        } catch (e: any) {
            window.dispatchEvent(new CustomEvent('notify', { 
               detail: { 
                   message: `Failed to execute ${action}: ${e.message}`, 
                   type: 'error' 
               } 
            }));
        }
    };

    const eventSourceRef = useRef<EventSource | null>(null);
    const lastPpsCalcRef = useRef<number>(Date.now());
    const packetCountRef = useRef<number>(0);
    const simIntervalRef = useRef<any>(null);

    const loadInterfaces = useCallback(async () => {
        setIsInterfaceLoading(true);
        try {
            const res = await fetch(`${apiBase}/system/interfaces`);
            if (res.ok) {
                const data = await res.json();
                setInterfaces(data.interfaces || []);
            } else { throw new Error("Offline"); }
        } catch (e) {
            setInterfaces([
                { id: 'eth0', name: 'eth0', description: 'Primary Fiber Uplink' },
                { id: 'wlan0', name: 'wlan0', description: 'Neural Mesh Bridge' }
            ]);
        } finally { setIsInterfaceLoading(false); }
    }, [apiBase]);

    useEffect(() => { loadInterfaces(); }, [loadInterfaces]);

    const processPacket = (packet: TsharkPacket) => {
        setPackets(prev => [packet, ...prev].slice(0, 50));
        packetCountRef.current += 1;
        setStats(prev => {
            const newStats = { ...prev, total: prev.total + 1 };
            const l = packet.layers;
            if (l.tcp) newStats.tcp += 1; else if (l.udp) newStats.udp += 1;
            if (l.dns) newStats.dns += 1; if (l.http) newStats.http += 1; if (l.tls) newStats.tls += 1;
            return newStats;
        });
    };



    const startCapture = () => {
        if (isCapturing) return;
        setIsCapturing(true);
        const es = new EventSource(`${apiBase}/network/sniff?interface=${selectedInterface}`);
        es.onmessage = (e) => processPacket(JSON.parse(e.data));
        es.onerror = () => { es.close(); setIsCapturing(false); };
        eventSourceRef.current = es;
    };

    const stopCapture = () => {
        if (eventSourceRef.current) eventSourceRef.current.close();
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setIsCapturing(false);
    };

    const getPacketSummary = (pkt: TsharkPacket) => {
        const l = pkt.layers;
        if (l.http) return `HTTP ${l.http["http.request.method"] || 'RESP'} ${l.http["http.host"] || ''}`;
        if (l.dns) return `DNS Query: ${l.dns["dns.qry.name"] || '...'}`;
        if (l.tcp) return `TCP ${l.tcp["tcp.srcport"]} -> ${l.tcp["tcp.dstport"]} [${l.tcp["tcp.flags_str"] || 'ACK'}]`;
        return "General Traffic Payload";
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-p-500/20 flex items-center justify-center border border-p-500/30">
                        <Network className="w-5 h-5 text-p-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-[0.3em]">Network_Dissector_v4</h1>
                        <p className="text-[8px] text-p-400/70 font-bold uppercase tracking-widest">Real-time Deep Packet Inspection</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <select value={selectedInterface} onChange={(e) => setSelectedInterface(e.target.value)} className="bg-bg-2 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold">
                        {interfaces.map(iface => <option key={iface.id} value={iface.name}>{iface.name}</option>)}
                    </select>
                    <button onClick={isCapturing ? stopCapture : startCapture} className={cn("px-6 py-2 rounded-lg font-black text-[10px] uppercase transition-all flex items-center gap-2", isCapturing ? "bg-danger text-white" : "bg-p-500 text-white")}>
                        {isCapturing ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isCapturing ? "Stop" : "Start"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Table */}
                <div className="flex-1 overflow-auto custom-scrollbar relative bg-black/20">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-bg-1/90 backdrop-blur-md z-30">
                            <tr className="text-text-3 uppercase tracking-widest text-[8px] border-b border-white/5">
                                <th className="px-6 py-4 text-left">Timestamp</th>
                                <th className="px-6 py-4 text-left">Source</th>
                                <th className="px-6 py-4 text-left">Destination</th>
                                <th className="px-6 py-4 text-center">Proto</th>
                                <th className="px-6 py-4 text-left">Info</th>
                                <th className="px-6 py-4 text-right">Tactical</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {packets.map((pkt, idx) => (
                                <motion.tr key={idx} onClick={() => setSelectedPacket(pkt)} className={cn("group cursor-pointer text-[10px]", selectedPacket === pkt ? "bg-p-500/10" : "hover:bg-white/5")}>
                                    <td className="px-6 py-3 font-mono opacity-50">{new Date(pkt.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-6 py-3 font-black">{pkt.layers.ip?.ip_src || "Local"}</td>
                                    <td className="px-6 py-3 font-black">{pkt.layers.ip?.ip_dst || "Remote"}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black border border-white/10 bg-white/5 uppercase">
                                            {pkt.layers.tcp ? "TCP" : pkt.layers.udp ? "UDP" : "OTHER"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-400 truncate max-w-[300px]">{getPacketSummary(pkt)}</td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="relative inline-block">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setMenuPacketId(menuPacketId === idx ? null : idx); }}
                                                className="p-2 hover:bg-white/10 rounded-xl relative z-40 text-slate-500 hover:text-white"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            <AnimatePresence>
                                                {menuPacketId === idx && (
                                                    <>
                                                        <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setMenuPacketId(null); }} />
                                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0f] border border-white/10 rounded-2xl p-2 shadow-2xl z-[70]">
                                                            {[
                                                                { label: 'Follow Stream', icon: Layers, action: 'FOLLOW' },
                                                                { label: 'Extract Data', icon: Database, action: 'EXTRACT' },
                                                                { label: 'Filter Source', icon: Filter, action: 'FILTER' },
                                                                { label: 'Kill Connection', icon: Shield, action: 'KILL' },
                                                            ].map((opt) => (
                                                                <button 
                                                                    key={opt.label} 
                                                                    onClick={(e) => { e.stopPropagation(); handlePacketAction(pkt, opt.action); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-left group"
                                                                >
                                                                    <opt.icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-p-400" />
                                                                    <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase">{opt.label}</span>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
