"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Globe, Shield, ShieldAlert, AlertCircle, 
    Zap, Terminal, Info, ChevronRight, X, Eye, Lock, Unlock,
    Fingerprint, Cpu, Radio, Database, Compass, Layers, Server, 
    Target, Search, Filter, History, Table, ZoomIn, ZoomOut, Maximize,
    FileText, ShieldCheck, Bug, RadioTower, Settings,
    Microscope, Navigation, Crosshair, BarChart3, Wifi, AlertTriangle,
    ShieldOff, Ban, LocateFixed, Trash2, Download, FileJson, Share2,
    Sliders, Satellite, HardDrive, Wind, Power
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function ThreatMapProClient() {
    const router = useRouter();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    
    const [config, setConfig] = useState({
        radarSensitivity: 85,
        satelliteLink: true,
        neuralSync: true,
        vizMode: 'Arcs' as 'Arcs' | 'Heatmap' | 'Clusters'
    });
    const [totalEvents, setTotalEvents] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

    const strategicNodes = [
        { city: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503, country_code: 'JP' },
        { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, country_code: 'GB' },
        { city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060, country_code: 'US' },
        { city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173, country_code: 'RU' },
        { city: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074, country_code: 'CN' }
    ];

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadMap = async () => {
            try {
                const res = await fetch('/world.json');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const geoJson = await res.json();
                echarts.registerMap('world', geoJson);
                setMapLoaded(true);
            } catch (err) {
                console.error("Map Load Error", err);
            }
        };
        loadMap();

        let pollTimer: any = null;
        let eventIdCounter = 0;

        const fetchData = async () => {
            try {
                const pointsData = await apiClient<{points?: any[], total?: number, total_attacks?: number, critical?: number, high?: number, source?: string}>('/map/points?limit=100');
                
                if (pointsData && pointsData.points && pointsData.points.length > 0) {
                    const mapData = pointsData.points.map((p: any) => ({
                        id: `map-${eventIdCounter++}-${Date.now()}`,
                        source: {
                            ip: p.source_ip || 'Unknown',
                            country: p.country || 'Unknown',
                            lat: p.lat,
                            lng: p.lng,
                            org: 'External Vector'
                        },
                        target: { lat: 48.8566, lng: 2.3522, name: 'SOC-HQ-PARIS' },
                        details: {
                            timestamp: new Date().toLocaleTimeString(),
                            method: p.attack_type || 'Suspicious Traffic',
                            severity: p.severity === 'critical' || p.severity === 'Critique' ? 'Critical' : p.severity === 'high' || p.severity === 'Élevé' ? 'High' : 'Medium',
                            threat_level: p.severity === 'critical' || p.severity === 'Critique' ? 'Critical' : p.severity === 'high' || p.severity === 'Élevé' ? 'High' : 'Medium'
                        }
                    }));
                    setTotalEvents(prev => Math.max(prev, pointsData.total_attacks || pointsData.total || mapData.length));
                    setEvents(mapData.slice(0, 50));
                    setConnectionStatus('connected');
                } else {
                    throw new Error('empty points');
                }
            } catch (e) {
                console.warn("[ThreatMap] API unavailable, no events:", e);
                setConnectionStatus('disconnected');
            }
        };

        fetchData();
        pollTimer = setInterval(fetchData, 5000);

        // Connect to SSE for real-time updates
        let sse: EventSource | null = null;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
            sse = new EventSource(`${baseUrl}/map/stream`);
            sse.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    const newEvent = {
                        id: `sse-${eventIdCounter++}-${Date.now()}`,
                        source: {
                            ip: data.src_ip || data.source_ip || 'Unknown',
                            country: data.src_country || data.country || 'Unknown',
                            lat: data.src_lat || data.lat || 0,
                            lng: data.src_lon || data.lng || 0,
                            org: data.org || 'External'
                        },
                        target: { lat: 48.8566, lng: 2.3522, name: 'SOC-HQ-PARIS' },
                        details: {
                            timestamp: new Date().toLocaleTimeString(),
                            method: data.rule_id || data.event_type || data.service || data.attack_type || 'Alert',
                            severity: data.severity === 'critical' || data.severity === 'Critique' ? 'Critical' : data.severity === 'high' || data.severity === 'Élevé' ? 'High' : 'Medium',
                            threat_level: data.severity === 'critical' || data.severity === 'Critique' ? 'Critical' : data.severity === 'high' || data.severity === 'Élevé' ? 'High' : 'Medium'
                        }
                    };
                    setEvents(prev => [newEvent, ...prev].slice(0, 50));
                    setTotalEvents(prev => prev + 1);
                    setConnectionStatus('connected');
                } catch (e) {
                    // SSE data might be keep-alive
                }
            };
            sse.onerror = () => {
                setConnectionStatus('disconnected');
            };
            sse.onopen = () => {
                setConnectionStatus('connected');
            };
        } catch (e) {
            console.warn("[ThreatMap] SSE not available");
        }

        return () => {
            if (pollTimer) clearInterval(pollTimer);
            if (sse) sse.close();
        };
    }, []);

    const handleAction = (msg: string) => {
        window.dispatchEvent(new CustomEvent('notify', { 
           detail: { message: msg, type: 'info' } 
        }));
    };

    const fetchAnalysis = async (eventId: string) => {
        setLoadingAnalysis(true);
        try {
            const data = await apiClient(`/api/threat-analysis/${eventId}`);
            setAnalysis(data);
        } catch (e) {
            console.error("Failed to fetch analysis:", e);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const deployCountermeasure = async (action: string, target: string) => {
        if (!selectedEvent) return;
        
        setIsDeploying(true);
        try {
            const data = await apiClient('/api/threat-analysis/countermeasures/deploy', {
                method: 'POST',
                body: JSON.stringify({
                    event_id: selectedEvent.id,
                    action: action,
                    target: target,
                    reason: `Manual deployment from Threat Map Pro`
                })
            });
            handleAction(`✓ ${data.message}`);
        } catch (e) {
            handleAction(`✗ Error: ${e}`);
        } finally {
            setIsDeploying(false);
        }
    };

    const handleEventClick = (ev: any) => {
        setSelectedEvent(ev);
        fetchAnalysis(ev.id);
    };

    const mapOptions = useMemo(() => {
        if (!mapLoaded) return {};
        
        return {
            backgroundColor: 'transparent',
            geo: {
                map: 'world',
                roam: true,
                zoom: zoomLevel,
                silent: true,
                itemStyle: {
                    areaColor: '#080C14',
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            },
            series: [
                {
                    type: 'lines',
                    coordinateSystem: 'geo',
                    zlevel: 1,
                    effect: { show: true, period: 4, trailLength: 0.4, color: '#3b82f6', symbolSize: 2 },
                    lineStyle: { color: '#3b82f6', width: 0.5, opacity: 0.1, curveness: 0.3 },
                    data: events.map(e => ({ coords: [[e.source.lng, e.source.lat], [e.target.lng, e.target.lat]] }))
                },
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: { brushType: 'stroke', scale: 3 },
                    symbolSize: 8,
                    data: events.map(e => ({ value: [e.source.lng, e.source.lat], itemStyle: { color: e.details.threat_level === 'Critical' ? '#ef4444' : '#3b82f6' } }))
                }
            ]
        };
    }, [events, zoomLevel, mapLoaded]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] text-slate-200 overflow-hidden font-sans">
            
            <header className="absolute top-0 left-0 right-0 h-24 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-10 z-[110]">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            <Globe className="w-6 h-6 text-blue-500 animate-spin-slow" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">World_Threat_Matrix</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">● System_Live</span>
                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clearance: Level_5_Senior</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-10 border-x border-white/5 px-10">
                        <HeaderMetric label="Data_Feed" value={connectionStatus === 'connected' ? 'LIVE' : 'DEMO'} color={connectionStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'} />
                        <HeaderMetric label="Events" value={totalEvents.toLocaleString()} color="text-blue-400" />
                        <HeaderMetric label="Neural_Sync" value="99%" color="text-blue-400" />
                    </div>
                    
                    <button onClick={() => setShowConfig(!showConfig)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                        <Settings className={cn("w-5 h-5 transition-transform duration-500", showConfig ? "rotate-90 text-blue-400" : "text-slate-500")} />
                    </button>

                    <button 
                        onClick={() => router.push('/overview')}
                        className="flex items-center gap-3 px-6 py-3 bg-red-600/10 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all group"
                    >
                        <Power className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        EXIT_COMMAND_CENTER
                    </button>
                </div>
            </header>

            <main className="relative w-full h-full pt-24">
                <div className="absolute inset-0 z-0">
                    {mapLoaded && (
                        <ReactECharts 
                            echarts={echarts} 
                            option={mapOptions} 
                            notMerge={true}
                            style={{ height: '100%', width: '100%' }} 
                        />
                    )}
                </div>

                <aside className="absolute left-8 top-32 w-80 space-y-4 z-10">
                    <div className="bg-[#080C14]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-4xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                           <Activity className="w-4 h-4 text-blue-500" /> Live_Interception
                        </h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {events.map((ev) => (
                                <div key={ev.id} onClick={() => handleEventClick(ev)} className={cn("p-4 rounded-2xl border transition-all cursor-pointer group", selectedEvent?.id === ev.id ? "bg-blue-600/10 border-blue-500/40" : "bg-white/[0.02] border-white/[0.05] hover:bg-white/5")}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono font-black text-white">{ev.source.ip}</span>
                                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase", ev.details.threat_level === 'Critical' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500")}>{ev.details.threat_level}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{ev.source.city}, {ev.source.country_code}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <AnimatePresence>
                    {showConfig && (
                        <motion.div 
                            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
                            className="absolute right-8 top-32 w-96 bg-[#080C14]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-4xl z-50"
                        >
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <Sliders className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Matrix_Configuration</h3>
                                </div>
                                <button onClick={() => setShowConfig(false)} className="text-slate-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Radar Sensitivity</span>
                                        <span className="text-[10px] font-mono text-blue-400">{config.radarSensitivity}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" value={config.radarSensitivity}
                                        onChange={(e) => setConfig({...config, radarSensitivity: parseInt(e.target.value)})}
                                        className="w-full accent-blue-500"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tactical Flux Sources</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ConfigToggle label="Sat_Link" active={config.satelliteLink} onClick={() => setConfig({...config, satelliteLink: !config.satelliteLink})} icon={Satellite} />
                                        <ConfigToggle label="Neural_Net" active={config.neuralSync} onClick={() => setConfig({...config, neuralSync: !config.neuralSync})} icon={Cpu} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Visualization Mode</p>
                                    <div className="flex gap-2">
                                        {['Arcs', 'Heatmap', 'Clusters'].map(mode => (
                                            <button 
                                                key={mode} onClick={() => setConfig({...config, vizMode: mode as any})}
                                                className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all", config.vizMode === mode ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10")}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={() => { setShowConfig(false); handleAction('SYTEM_CONFIG_UPDATED'); }} className="w-full py-5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all">
                                    Apply_Global_Changes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedEvent && analysis && (
                        <motion.div 
                            initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
                            className="absolute left-8 bottom-32 w-[500px] max-h-[600px] bg-[#080C14]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-4xl z-50 overflow-hidden"
                        >
                            <div className="p-8 overflow-y-auto max-h-[600px] custom-scrollbar">
                                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-red-500" />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Threat_Analysis</h3>
                                    </div>
                                    <button onClick={() => { setSelectedEvent(null); setAnalysis(null); }} className="text-slate-600 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {loadingAnalysis ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Severity & Confidence */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Severity</p>
                                                <p className={cn("text-lg font-black", 
                                                    analysis.severity === 'Critical' ? 'text-red-500' : 
                                                    analysis.severity === 'High' ? 'text-orange-500' : 
                                                    'text-yellow-500'
                                                )}>{analysis.severity}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Confidence</p>
                                                <p className="text-lg font-black text-blue-400">{(analysis.confidence * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        {/* Source Info */}
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Source</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">IP Address</span>
                                                    <span className="text-[9px] font-mono text-white">{analysis.source_ip}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Location</span>
                                                    <span className="text-[9px] text-white">{analysis.source_city}, {analysis.source_country}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Organization</span>
                                                    <span className="text-[9px] text-white">{analysis.source_org}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attack Details */}
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Attack Details</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Type</span>
                                                    <span className="text-[9px] text-white">{analysis.attack_type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Vector</span>
                                                    <span className="text-[9px] text-white">{analysis.attack_vector}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Stage</span>
                                                    <span className="text-[9px] text-white">{analysis.attack_stage}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-slate-400">Risk Score</span>
                                                    <span className="text-[9px] font-black text-red-500">{analysis.risk_score}/100</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* MITRE ATT&CK */}
                                        {analysis.mitre_tactics && analysis.mitre_tactics.length > 0 && (
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">MITRE ATT&CK</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.mitre_tactics.map((tactic: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded-lg border border-purple-500/30">
                                                            {tactic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Threat Intel */}
                                        {(analysis.threat_actor || analysis.malware_family) && (
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Threat Intelligence</p>
                                                <div className="space-y-2">
                                                    {analysis.threat_actor && (
                                                        <div className="flex justify-between">
                                                            <span className="text-[9px] text-slate-400">Threat Actor</span>
                                                            <span className="text-[9px] text-red-400 font-bold">{analysis.threat_actor}</span>
                                                        </div>
                                                    )}
                                                    {analysis.malware_family && (
                                                        <div className="flex justify-between">
                                                            <span className="text-[9px] text-slate-400">Malware</span>
                                                            <span className="text-[9px] text-orange-400 font-bold">{analysis.malware_family}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Recommendations</p>
                                            <div className="space-y-2">
                                                {analysis.recommendations.slice(0, 4).map((rec: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <ChevronRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-[9px] text-slate-300">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Countermeasures */}
                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Deploy Countermeasures</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => deployCountermeasure('block_ip', analysis.source_ip)}
                                                    disabled={isDeploying}
                                                    className="p-3 bg-red-600/10 border border-red-500/30 rounded-xl text-[9px] font-black text-red-400 uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {isDeploying ? 'Deploying...' : 'Block IP'}
                                                </button>
                                                <button 
                                                    onClick={() => deployCountermeasure('isolate_host', analysis.target_ip)}
                                                    disabled={isDeploying}
                                                    className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl text-[9px] font-black text-orange-400 uppercase hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    Isolate Host
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 5))} className="p-4 bg-black/80 border border-white/10 rounded-2xl text-white hover:bg-blue-600/20 transition-all"><ZoomIn className="w-5 h-5" /></button>
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))} className="p-4 bg-black/80 border border-white/10 rounded-2xl text-white hover:bg-blue-600/20 transition-all"><ZoomOut className="w-5 h-5" /></button>
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 h-24 border-t border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-10 z-[110]">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total_Intercepts</span>
                        <span className="text-2xl font-black text-white font-mono">{totalEvents.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-12">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Data_Source</span>
                        <span className={cn("text-2xl font-black font-mono", connectionStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500')}>{connectionStatus === 'connected' ? 'LIVE_FEED' : 'DEMO_MODE'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                        <Wind className="w-4 h-4 text-slate-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signal_Drift: -0.04%</span>
                    </div>
                    <button 
                        onClick={() => selectedEvent && analysis ? deployCountermeasure('block_ip', analysis.source_ip) : handleAction('Select an event first')}
                        disabled={!selectedEvent || isDeploying}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeploying ? 'DEPLOYING...' : 'DEPLOY_COUNTER_MEASURES'}
                    </button>
                </div>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}

function HeaderMetric({ label, value, color }: any) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
            <span className={cn("text-sm font-black font-mono", color)}>{value}</span>
        </div>
    );
}

function ConfigToggle({ label, active, onClick, icon: Icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                active ? "bg-blue-600/10 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/5 text-slate-600"
            )}
        >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

