"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
    Globe as GlobeIcon, Activity, Shield,
    Terminal, Zap, Crosshair,
    RefreshCw, Lock, Radio, Target,
    Wifi, Cpu, Signal, AlertOctagon,
    Maximize2, Minimize2, Search
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../shared/NotificationSystem";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/lib/api-client';

// Dynamic import with no SSR to avoid window issues
const Globe3D = dynamic(() => import("react-globe.gl"), { ssr: false });
import ReactECharts from "echarts-for-react";

// --- Types & Constants ---
interface AttackPoint {
    id: string;
    lat: number;
    lng: number;
    country: string;
    countryCode: string;
    count: number;
    severity: "critical" | "high" | "medium" | "low" | "target";
    ip?: string;
    timestamp: string;
    type: string;
    altitude?: number;
}

const TARGET = { lat: 33.5731, lng: -7.5898, name: "CASABLANCA_HQ", code: "MA" };

const ATTACK_TYPES = [
    { name: "Brute Force", percentage: 33, color: "#ef4444", icon: Lock, code: "BF-01" },
    { name: "Port Scan", percentage: 27, color: "#f97316", icon: Crosshair, code: "PS-99" },
    { name: "Phishing", percentage: 19, color: "#f59e0b", icon: GlobeIcon, code: "PH-23" },
    { name: "DDoS", percentage: 15, color: "#3b82f6", icon: Activity, code: "DD-05" },
    { name: "Exploit", percentage: 6, color: "#8b5cf6", icon: Zap, code: "EX-77" },
];

export default function ThreatMapPro() {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Data States
    const [attackPoints, setAttackPoints] = useState<AttackPoint[]>([]);
    const [docket, setDocket] = useState<AttackPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);
    const [radarActive, setRadarActive] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(2.2);

    const { notifications } = useNotifications();

    // Initialization
    useEffect(() => {
        setMounted(true);
    }, []);

    // Resize Observer
    useEffect(() => {
        if (!containerRef.current) return;
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateDimensions();
        const obs = new ResizeObserver(updateDimensions);
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [mounted]);

    // Load Data
    const loadHistoricalData = useCallback(async () => {
        try {
            const data = await apiClient('/api/map/points?limit=25');
            const history = (data.points || []).map((p: any) => ({
                    id: Math.random().toString(36),
                    lat: p.lat,
                    lng: p.lng,
                    country: p.country || "UNKNOWN",
                    countryCode: p.country_code || "XX",
                    count: 1,
                    severity: p.severity || "medium",
                    ip: p.ip || "0.0.0.0",
                    timestamp: new Date().toLocaleTimeString(),
                    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)].name,
                    altitude: Math.random() * 0.3
                }));
                setAttackPoints(history);
                setDocket(history.slice(0, 10));
        } catch (e) {
            console.error("Failed to load historical map data", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (mounted) loadHistoricalData();
    }, [mounted, loadHistoricalData]);

    // ECharts Option for Attack Trends
    const getChartOption = () => ({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#7C3AED', textStyle: { color: '#fff', fontSize: 10 } },
        grid: { top: '10%', left: '5%', right: '5%', bottom: '5%', containLabel: true },
        xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8 } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8 } },
        series: [{
            data: [120, 300, 150, 800, 400, 900],
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: '#7C3AED' },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: 'rgba(124, 58, 237, 0.3)' }, { offset: 1, color: 'rgba(124, 58, 237, 0)' }]
                }
            }
        }]
    });

    const getPieOption = () => ({
        backgroundColor: 'transparent',
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 4, borderColor: '#000', borderWidth: 2 },
            label: { show: false },
            data: ATTACK_TYPES.map(t => ({ value: t.percentage, name: t.name, itemStyle: { color: t.color } }))
        }]
    });

    const arcs = useMemo(() => {
        return attackPoints.map(p => ({
            startLat: p.lat,
            startLng: p.lng,
            endLat: TARGET.lat,
            endLng: TARGET.lng,
            color: p.severity === 'critical' ? ['rgba(239,68,68,0)', '#ef4444'] : ['rgba(139,92,246,0)', '#8b5cf6'],
            dashGap: 0.1,
            dashLength: 0.5,
            dashAnimateTime: p.severity === 'critical' ? 1000 : 2000
        }));
    }, [attackPoints]);

    const handleGlobeReady = () => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 25, lng: -10, altitude: zoomLevel }, 2000);
        const controls = globeRef.current.controls();
        if (controls) {
            controls.autoRotate = autoRotate;
            controls.autoRotateSpeed = 0.4;
            controls.enableZoom = true;
        }
    };

    if (!mounted) return <div className="h-full w-full bg-black flex items-center justify-center font-mono text-p-400 uppercase tracking-widest animate-pulse">Initializing Global Radar System...</div>;

    return (
        <div className="relative h-[calc(100vh-6rem)] w-full bg-[#030305] overflow-hidden select-none" ref={containerRef}>

            {/* --- GRID & SCAN EFFECTS --- */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.2) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            {/* --- GLOBE LAYER --- */}
            <div className="absolute inset-0 z-0">
                <Globe3D
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="/textures/earth-night.jpg"
                    bumpImageUrl="/textures/earth-topology.png"
                    atmosphereColor="#7C3AED"
                    atmosphereAltitude={0.15}
                    arcsData={arcs}
                    arcColor={(d: any) => d.color}
                    arcDashLength={0.4}
                    arcDashGap={0.2}
                    arcDashAnimateTime={1200}
                    arcStroke={0.6}
                    pointsData={[...attackPoints, { ...TARGET, severity: 'target' }]}
                    pointLat={(d: any) => d.lat}
                    pointLng={(d: any) => d.lng}
                    pointColor={(d: any) => d.severity === 'target' ? '#FFFFFF' : d.severity === 'critical' ? '#EF4444' : '#A78BFA'}
                    pointAltitude={(d: any) => d.severity === 'target' ? 0.12 : (d.altitude || 0.02)}
                    pointRadius={(d: any) => d.severity === 'target' ? 0.8 : 0.4}
                    ringsData={[TARGET]}
                    ringLat={(d: any) => d.lat}
                    ringLng={(d: any) => d.lng}
                    ringColor={() => '#A78BFA'}
                    ringMaxRadius={6}
                    ringPropagationSpeed={3}
                    ringRepeatPeriod={800}
                    onGlobeReady={handleGlobeReady}
                />
            </div>

            {/* --- HUD OVERLAYS --- */}

            {/* Top Info HUD */}
            <div className="absolute top-6 left-10 z-40 flex items-start gap-6 pointer-events-none">
                <div className="pointer-events-auto bg-black/60 border border-white/10 backdrop-blur-xl px-6 py-3 rounded-xl border-l-4 border-l-violet-500 shadow-2xl">
                    <div className="flex items-center gap-4 mb-1">
                        <Radio className="h-5 w-5 text-violet-500 animate-pulse" />
                        <span className="text-xl font-black text-white tracking-[0.1em] uppercase">Tactical_Map_v4</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest">Global Watchtower | Root Alpha</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
                    </div>
                </div>

                <div className="pointer-events-auto hidden xl:grid grid-cols-3 gap-4">
                    {[
                        { label: "Active Nodes", val: "1,248", trend: "+12%" },
                        { label: "Intercepts/sec", val: "14.2k", trend: "Normal" },
                        { label: "Threat Latency", val: "42ms", trend: "Optimal" }
                    ].map(st => (
                        <div key={st.label} className="bg-black/40 border border-white/5 backdrop-blur-md px-4 py-2 rounded-lg">
                            <div className="text-[8px] uppercase text-white/40 tracking-widest mb-1">{st.label}</div>
                            <div className="text-sm font-black text-white font-mono">{st.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Left Radar Panel */}
            <div className="absolute top-32 left-10 w-80 z-40 pointer-events-none flex flex-col gap-6">
                <div className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="bg-gradient-to-r from-violet-600/10 to-transparent p-4 border-b border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-violet-500" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Attack Trends</span>
                            </div>
                            <Badge variant="outline" className="text-[8px] border-violet-500/30 text-violet-500 bg-violet-500/5">REAL_TIME</Badge>
                        </div>
                        <div className="h-32 w-full">
                            <ReactECharts option={getChartOption()} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-white/40 uppercase tracking-widest">Inbound</span>
                            <span className="text-lg font-black text-white font-mono tracking-tighter">8.4<span className="text-[10px] text-violet-500 ml-1">GB/S</span></span>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="h-12 w-12">
                                <ReactECharts option={getPieOption()} style={{ height: '100%', width: '100%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Threat Distribution (ECharts-Pro style) */}
                <div className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Threat Vectoring</span>
                    </div>
                    <div className="space-y-4">
                        {ATTACK_TYPES.map(type => (
                            <div key={type.name} className="group cursor-help">
                                <div className="flex justify-between items-center mb-1.5 px-1">
                                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide group-hover:text-white transition-colors">{type.name}</span>
                                    <span className="text-[10px] font-mono text-white/40">{type.percentage}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${type.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full rounded-full" 
                                        style={{ backgroundColor: type.color }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Live intercept Panel */}
            <div className="absolute top-32 right-10 w-80 z-40 pointer-events-none flex flex-col h-[calc(100vh-16rem)] max-h-[700px]">
                <div className="flex-1 pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
                    
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Terminal className="h-4 w-4 text-violet-500" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.15em]">Live_Intercepts</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[7px] font-black text-red-500 animate-pulse">RAW_DATA</div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {docket.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="p-4 hover:bg-white/[0.03] transition-colors relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border",
                                                item.severity === 'critical' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                                item.severity === 'high' ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                                                "bg-violet-500/10 border-violet-500/30 text-violet-500"
                                            )}>
                                                {item.severity === 'critical' ? 'Alert' : item.severity}
                                            </span>
                                            <span className="text-[8px] font-mono text-white/20">{item.timestamp}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[11px] font-black text-white italic tracking-wide">{item.type}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[9px] font-mono text-violet-400/70">{item.ip}</div>
                                                <div className="text-[8px] font-bold text-white/30 uppercase">{item.country}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Marquee */}
            <div className="absolute bottom-10 left-10 right-10 z-40 pointer-events-none">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl h-14 flex items-center px-6 gap-8 overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-3 shrink-0">
                        <Signal className="h-4 w-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">SOC_Node_MA_HQ: ACTIVE</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex-1 overflow-hidden relative">
                        <div className="whitespace-nowrap animate-marquee flex items-center gap-12">
                            {[
                                "BOUCLIER_v4.2.0-STABLE INITIALIZED",
                                "SATELLITE DOWNLINK OPTIMIZED",
                                "NEW ADVERSARY SIGNATURE DETECTED: [VOLT_TYPHOON]",
                                "ENCRYPTION LAYER 7 ACTIVE",
                                "DEEP PACKET INSPECTION IN PROGRESS...",
                                "CASABLANCA HQ NODE REPORTING STATUS: OPTIMAL"
                            ].map((txt, i) => (
                                <span key={i} className="text-[10px] font-mono text-violet-400 uppercase tracking-widest flex items-center gap-3">
                                    <div className="w-1 h-1 bg-violet-500 rounded-full" />
                                    {txt}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Corner Borders */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-violet-500/30 rounded-tl-3xl pointer-events-none opacity-50" />
            <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-violet-500/30 rounded-tr-3xl pointer-events-none opacity-50" />
            <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-violet-500/30 rounded-bl-3xl pointer-events-none opacity-50" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-violet-500/30 rounded-br-3xl pointer-events-none opacity-50" />

        </div>
    );
}


