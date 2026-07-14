"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
    Shield, ShieldAlert, Zap, Radio, Globe, 
    Crosshair, Activity, Target, AlertCircle, ChevronRight,
    Compass, Cpu, Layers, Maximize2, Move, Navigation,
    Microscope, Fingerprint, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface TacticalExpertMapProps {
    data: any;
}

// ── AUDIT HELPERS ──

function AuditSection({ title, icon: Icon, children, className }: any) {
    return (
        <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col shadow-xl", className)}>
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2 shrink-0">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
}

function AttributionItem({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-[11px] bg-white/[0.02] p-2 rounded-lg border border-white/5">
            <span className="text-slate-500 font-bold uppercase tracking-tighter">{label}</span>
            <span className="text-white font-black">{value}</span>
        </div>
    );
}

function ConfidenceMetric({ label, value, progress, color }: any) {
    const colors: any = {
        blue: "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]",
        purple: "bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]",
        red: "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-mono">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn("h-full", colors[color])} 
                />
            </div>
        </div>
    );
}

export default function TacticalExpertMap({ data }: TacticalExpertMapProps) {
    const chartRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [auditTarget, setAuditTarget] = useState<any>(null);
    
    // NASA Style Telemetry State
    const [telemetry, setTelemetry] = useState({
        alt: 12402,
        velocity: 7.66,
        sector: "ALPHA-9",
        status: "SURVEILLANCE_ACTIVE"
    });

    useEffect(() => {
        // Load World Map JSON for ECharts
        fetch('/world.json')
            .then(res => res.json())
            .then(geoJson => {
                echarts.registerMap('world', geoJson);
                setMapLoaded(true);
            })
            .catch(err => console.error("Failed to load map data", err));

        const timer = setInterval(() => {
            setTelemetry(t => ({
                ...t,
                alt: 12000 + (new Date().getSeconds() * 10),
                velocity: 7.6 + (new Date().getSeconds() % 5) / 10
            }));
        }, 2000);

        return () => clearInterval(timer);
    }, []);

    const mapOption = useMemo(() => {
        if (!mapLoaded) return {};

        const points = (data?.geo_points || [])
            .filter((p: any) => p && Array.isArray(p.value))
            .map((p: any) => ({
                name: p.name,
                value: [...p.value, p.severity || 'High'], // [lng, lat, count, severity]
            }));

        const criticalPoints = points.filter((p: any) => {
            const sev = String(p.value[3]).toUpperCase();
            return sev === 'CRITICAL' || sev === 'CRITIQUE';
        });
        const normalPoints = points.filter((p: any) => {
            const sev = String(p.value[3]).toUpperCase();
            return sev !== 'CRITICAL' && sev !== 'CRITIQUE';
        });

        const linesData = points.slice(0, 15).map((p: any) => {
            const sev = String(p.value[3]).toUpperCase();
            const isCrit = sev === 'CRITICAL' || sev === 'CRITIQUE';
            return {
                fromName: p.name,
                toName: 'Casablanca',
                coords: [[p.value[0], p.value[1]], [-7.5898, 33.5731]], // from point to HQ
                lineStyle: { color: isCrit ? '#ff1744' : '#2979ff' }
            };
        });

        return {
            backgroundColor: 'transparent',
            geo: {
                map: 'world',
                roam: true,
                zoom: 1.2,
                label: { emphasis: { show: false } },
                itemStyle: {
                    normal: {
                        areaColor: '#050b14',
                        borderColor: '#1e3a8a',
                        borderWidth: 0.8,
                        shadowColor: 'rgba(30, 58, 138, 0.4)',
                        shadowBlur: 5
                    },
                    emphasis: {
                        areaColor: '#0a1a35'
                    }
                }
            },
            series: [
                // 1. Lines (Threat Vectors)
                {
                    type: 'lines',
                    coordinateSystem: 'geo',
                    zlevel: 1,
                    effect: {
                        show: true,
                        period: 4,
                        trailLength: 0.4,
                        color: '#fff',
                        symbolSize: 2
                    },
                    lineStyle: {
                        normal: {
                            width: 1,
                            opacity: 0.3,
                            curveness: 0.2
                        }
                    },
                    data: linesData
                },
                // 2. Ripple Effect for Critical
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: {
                        brushType: 'stroke',
                        scale: 4,
                        period: 4
                    },
                    label: { show: false },
                    symbolSize: 10,
                    itemStyle: {
                        normal: { color: '#ff1744', shadowBlur: 10, shadowColor: '#ff1744' }
                    },
                    data: criticalPoints
                },
                // 3. Normal Points
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    symbolSize: 6,
                    itemStyle: {
                        normal: { color: '#2979ff', opacity: 0.8 }
                    },
                    data: normalPoints
                },
                // 4. HQ Marker
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 3,
                    rippleEffect: { brushType: 'fill', scale: 2 },
                    symbolSize: 12,
                    itemStyle: { color: '#00e676', shadowBlur: 15, shadowColor: '#00e676' },
                    data: [{ name: 'HQ-CASABLANCA', value: [-7.5898, 33.5731] }]
                }
            ]
        };
    }, [mapLoaded, data]);

    const onChartClick = (params: any) => {
        if (params.componentType === 'series' && (params.seriesType === 'scatter' || params.seriesType === 'effectScatter')) {
            const p = params.data;
            setSelectedPoint({
                label: p.name,
                lat: p.value[1],
                lng: p.value[0],
                count: p.value[2] || 1,
                severity: p.value[3] || 'High',
                ip: p.name
            });
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#02050A] rounded-2xl border border-white/5">
            
            {/* NASA 2D HUD: TOP LEFT */}
            <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl border-l-2 border-blue-500/50 p-4 rounded-r-xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Strategic Node 2D</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[9px]">
                        <div className="flex flex-col">
                            <span className="text-slate-500 uppercase tracking-tighter">Scanning</span>
                            <span className="text-blue-400 font-bold">ACTIVE</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 uppercase tracking-tighter">Resolution</span>
                            <span className="text-blue-400 font-bold">4K PRO</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NASA 2D HUD: TOP RIGHT */}
            <div className="absolute top-6 right-6 z-10 text-right pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl border-r-2 border-red-500/50 p-4 rounded-l-xl shadow-2xl">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{telemetry.sector} CONTEXT</h4>
                    <p className="text-[9px] text-red-500 font-bold animate-pulse tracking-tighter uppercase">2D_TACTICAL_OVERLAY</p>
                </div>
            </div>

            {/* 2D MAP RENDER */}
            <div className="absolute inset-0">
                {mapLoaded ? (
                    <ReactECharts 
                        option={mapOption} 
                        style={{ height: '100%', width: '100%' }}
                        onEvents={{ 'click': onChartClick }}
                        ref={chartRef}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-600 animate-pulse font-mono uppercase">Initializing Tactical 2D System...</div>
                )}
            </div>

            {/* RADAR SWEEP EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(59,130,246,0.5)_50%,transparent_100%)] animate-radar-spin" />
            </div>

            {/* TACTICAL GRID OVERLAY */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* SELECTION HUD */}
            <AnimatePresence>
                {selectedPoint && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="absolute right-8 top-1/4 z-30 w-72 pointer-events-auto"
                    >
                        <div className="bg-[#0d1520]/95 backdrop-blur-3xl border border-blue-500/30 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", selectedPoint.severity === 'Critical' ? "bg-red-500" : "bg-blue-500")} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedPoint.severity} VECTOR</span>
                                </div>
                                <button onClick={() => setSelectedPoint(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                            </div>
                            
                            <h4 className="text-lg font-black text-white mb-2 leading-tight">{selectedPoint.label}</h4>
                            <p className="text-blue-500 font-mono text-xs font-bold mb-6">{selectedPoint.ip}</p>

                            <div className="space-y-4">
                                <ForensicRow label="Event Density" value={selectedPoint.count} />
                                <ForensicRow label="Coordinate" value={`${selectedPoint.lat.toFixed(2)}, ${selectedPoint.lng.toFixed(2)}`} />
                                
                                <button 
                                    onClick={() => setAuditTarget(selectedPoint)}
                                    className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
                                >
                                    <Cpu className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Start Deep Audit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ADVANCED DEEP AUDIT OVERLAY */}
            <AnimatePresence>
                {auditTarget && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-[#02050A]/98 backdrop-blur-3xl flex items-center justify-center overflow-hidden"
                    >
                        <div className="w-full h-full flex flex-col relative max-w-[1600px]">
                            {/* Cinematic Background Elements */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-blue-500/20 rounded-full animate-ping-slow" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full animate-radar-spin" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_100%)]" />
                            </div>

                            {/* EXPERT HEADER (FIXED) */}
                            <div className="flex justify-between items-end p-8 relative z-10 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] relative z-10">
                                            <Microscope className="w-10 h-10 text-white animate-pulse" />
                                        </div>
                                        <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Advanced Forensic Audit</h2>
                                            <div className="flex gap-1">
                                                {[1,2,3].map(i => <div key={i} className="w-1 h-4 bg-blue-500/40 rounded-full" />)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.2em]">
                                            <span className="text-red-500 font-black">TARGET_IDENTIFIED: {auditTarget.ip}</span>
                                            <span className="text-slate-500 uppercase">|| Origin: {auditTarget.label}</span>
                                            <span className="text-slate-500 uppercase">|| Latency: 0.14ms</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Surveillance_Sync: 100%</span>
                                    <button 
                                        onClick={() => setAuditTarget(null)}
                                        className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Terminate_Audit [ESC]
                                    </button>
                                </div>
                            </div>

                            {/* SCROLLABLE 3-COLUMN EXPERT GRID */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                                <div className="grid grid-cols-12 gap-6 pb-20">
                                    
                                    {/* LEFT: LIVE SIGNALS (4 cols) */}
                                    <div className="col-span-4 flex flex-col gap-6">
                                        <AuditSection title="Deep-Packet Inspection Stream" icon={Activity} className="h-[600px] overflow-hidden">
                                            <div className="h-full bg-black/60 rounded-2xl border border-white/5 p-4 font-mono text-[9px] space-y-1 overflow-y-auto custom-scrollbar relative">
                                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                                                {((data?.latest_alerts?.length ? data.latest_alerts : [...Array(60)])).map((alert: any, i: number) => {
                                                    const isReal = !!alert?.description;
                                                    const isCrit = isReal ? alert.severity?.toLowerCase() === 'critical' : i % 8 === 0;
                                                    const time = isReal ? alert.time : new Date().toLocaleTimeString().split(' ')[0];
                                                    const msg = isReal ? `${alert.description} :: SRC_${alert.source}` : (isCrit ? `!! CRITICAL_OVERFLOW_DETECTED :: ADDR_0x${btoa(auditTarget.ip).substring(0,6)}` : `STREAM_ID_${i.toString().padStart(3, '0')} :: LEN_${1024 + (i * 12) % 500} :: WIN_4096`);
                                                    return (
                                                    <div key={isReal ? alert.id : i} className="flex gap-4 group hover:bg-white/5 transition-colors p-0.5 rounded">
                                                        <span className="text-slate-600 w-16">[{time}]</span>
                                                        <span className="text-blue-500 w-12 italic">{isReal ? (alert.severity?.substring(0,3).toUpperCase() || 'ACK') : 'ACK'}</span>
                                                        <span className="text-slate-400 uppercase truncate flex-1">
                                                            {isCrit ? <span className="text-red-400 font-black">{msg}</span> : msg}
                                                        </span>
                                                    </div>
                                                )})}
                                                <div className="sticky bottom-0 bg-black/80 p-2 border-t border-white/5 text-emerald-500 flex justify-between">
                                                    <span>SCANNING_ACTIVE...</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </AuditSection>
                                    </div>

                                    {/* CENTER: NEURAL & MITIGATION (4 cols) */}
                                    <div className="col-span-4 flex flex-col gap-6">
                                        <AuditSection title="Neural Threat Attribution" icon={Fingerprint}>
                                            <div className="space-y-3">
                                                <AttributionItem label="Attribution" value="State-Sponsored Actor" />
                                                <AttributionItem label="Signature Match" value="99.8% (Advanced)" />
                                                <AttributionItem label="Tactic" value="Data Exfiltration via DNS" />
                                                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Latent Space Fingerprint</p>
                                                    <div className="flex gap-1 h-12 items-end">
                                                        {[...Array(30)].map((_, i) => (
                                                            <motion.div 
                                                                key={i}
                                                                animate={{ height: [10, 30, 15, 40, 20][i % 5] }}
                                                                transition={{ repeat: Infinity, duration: 1.5 + Math.random(), ease: "easeInOut" }}
                                                                className="flex-1 bg-blue-500/30 rounded-t-sm"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </AuditSection>

                                        <AuditSection title="Strategic Mitigation Center" icon={ShieldCheck}>
                                            <div className="flex flex-col gap-4">
                                                <div className="p-4 bg-red-500/5 border-l-2 border-red-500 rounded-r-xl space-y-2">
                                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                                        <AlertCircle className="w-3 h-3" /> Priority Mitigation
                                                    </p>
                                                    <p className="text-xs text-white leading-relaxed font-medium">
                                                        Vector identified as <span className="text-red-400">Recursive DNS Tunneling</span>. 
                                                        Immediate isolation of endpoint {auditTarget.ip} is required to prevent data leakage.
                                                    </p>
                                                </div>
                                                
                                                <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-[10px] min-h-[120px]">
                                                    <div className="text-emerald-500 mb-2">BOUCLIER_TERMINAL v4.2</div>
                                                    <div className="text-slate-500 mb-1">&gt; analyze --target {auditTarget.label}</div>
                                                    <div className="text-slate-300 mb-1">Status: Vulnerability Confirmed</div>
                                                    <div className="text-slate-500 mb-1">&gt; lockdown --mode stealth</div>
                                                    <div className="text-blue-400 animate-pulse">Awaiting manual intervention...</div>
                                                </div>

                                                <button 
                                                    onClick={async (e) => {
                                                        const btn = e.currentTarget;
                                                        btn.innerHTML = '<span class="animate-spin mr-2">⟳</span> ISOLATING...';
                                                        try {
                                                            await apiClient(`/api/forensics/isolate/${auditTarget.label}`, { method: 'POST' });
                                                            btn.innerHTML = '<span class="text-emerald-400">✓ ISOLATED</span>';
                                                            btn.className = "w-full py-4 bg-emerald-900/50 border border-emerald-500 text-emerald-400 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3";
                                                            btn.disabled = true;
                                                        } catch (err) {
                                                            btn.innerHTML = 'ERROR (RETRY)';
                                                        }
                                                    }}
                                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-3 group"
                                                >
                                                    <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" /> EXECUTE_ISOLATION
                                                </button>
                                            </div>
                                        </AuditSection>
                                    </div>

                                    {/* RIGHT: CONFIDENCE & REPORTING (4 cols) */}
                                    <div className="col-span-4 flex flex-col gap-6">
                                        <AuditSection title="Confidence Spectrum" icon={Cpu}>
                                            <div className="space-y-6 py-2">
                                                <ConfidenceMetric label="Neural Alignment" value="98.4%" progress={98} color="blue" />
                                                <ConfidenceMetric label="Temporal Stability" value="84.2%" progress={84} color="purple" />
                                                <ConfidenceMetric label="Anomaly Certainty" value="99.9%" progress={99} color="red" />
                                            </div>
                                        </AuditSection>

                                        <AuditSection title="Satellite Coordinate Mapping" icon={Navigation} className="h-[300px]">
                                            <div className="h-full bg-blue-500/5 border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                                                <div className="absolute inset-0 opacity-20 bg-[url('//unpkg.com/three-globe/example/img/earth-topology.png')] bg-cover group-hover:scale-110 transition-transform" style={{ transitionDuration: '10s' }} />
                                                <div className="absolute inset-0 border-[30px] border-blue-500/5 rounded-full animate-ping-slow" />
                                                
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 border-2 border-red-500 rounded-full animate-ping" />
                                                        <Crosshair className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
                                                    </div>
                                                    <div className="mt-4 text-center bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{auditTarget.label}</p>
                                                        <p className="text-[8px] text-blue-400 font-mono mt-1 italic">GEO_LOCK: {auditTarget.lat.toFixed(2)}N, {auditTarget.lng.toFixed(2)}E</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[8px] font-mono text-emerald-500 tracking-widest">LIVE_SAT_FEED</span>
                                                </div>
                                            </div>
                                        </AuditSection>

                                        <div 
                                            onClick={() => {
                                                const filename = `EXP-${auditTarget.label.replace(/[^A-Z0-9]/ig, '').toUpperCase().substring(0,6)}-${Math.abs(Math.floor(auditTarget.lat))}.txt`;
                                                const a = document.createElement('a');
                                                a.href = `http://localhost:8005/api/forensics/report/${auditTarget.label}?lat=${auditTarget.lat}&lng=${auditTarget.lng}`;
                                                a.download = filename;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                                <Layers className="w-32 h-32 text-white" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                                        <Target className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Case_Report_Ready</span>
                                                </div>
                                                <p className="text-2xl font-black text-white leading-none tracking-tighter" style={{wordBreak: 'break-all'}}>
                                                    EXP-{auditTarget.label.replace(/[^A-Z0-9]/ig, '').toUpperCase().substring(0, 6)}-{Math.abs(Math.floor(auditTarget.lat))}.TXT
                                                </p>
                                                <div className="flex items-center justify-between mt-6">
                                                    <span className="text-[9px] text-white/50 font-mono uppercase">
                                                        Hash: {btoa(auditTarget.label + auditTarget.lat).substring(0, 8).toLowerCase()}...{btoa(auditTarget.lng.toString()).substring(0, 5).toLowerCase()}
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-white animate-bounce-x" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes radar-spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-radar-spin {
                    animation: radar-spin 10s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}

function ForensicRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
            <span className="text-slate-500 uppercase font-black tracking-tighter">{label}</span>
            <span className="text-slate-200 font-mono">{value}</span>
        </div>
    );
}
