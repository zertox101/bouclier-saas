"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { 
    Activity, Search, Filter, History, Table, ZoomIn, ZoomOut, 
    Maximize, Brain, ShieldAlert, Users, Network, Target, 
    Zap, Terminal, Info, ChevronRight, X, Eye, Lock, Unlock,
    Fingerprint, Cpu, Radio, Database, Compass, Globe, Settings,
    BarChart3, RefreshCcw, Layers, AlertTriangle, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

// Types
interface GraphNode {
    id: string;
    name: string;
    symbolSize: number;
    category: number;
    value: number;
    risk: 'nominal' | 'medium' | 'high' | 'critical';
    itemStyle?: any;
    label?: any;
    data?: any;
}

interface GraphLink {
    source: string;
    target: string;
    lineStyle?: any;
}

export default function IntelligenceGraph() {
    const chartRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({
        nodes: [
            { id: 'soc_core', name: 'SOC_CORE_CENTRAL', symbolSize: 50, category: 0, value: 100, risk: 'nominal', itemStyle: { color: '#3B82F6', shadowBlur: 20, shadowColor: '#3B82F6' } }
        ],
        links: []
    });
    
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'logs' | 'findings'>('details');
    const [layout, setLayout] = useState<'force' | 'circular'>('force');
    const [history, setHistory] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Advanced Findings State
    const [findings, setFindings] = useState<any[]>([
        { id: 1, type: 'Pattern', title: 'Coordinated Brute Force', confidence: 0.98, severity: 'Critical', desc: 'Cluster of 4 IPs targeting Auth-Service.' },
        { id: 2, type: 'Anomaly', title: 'High Entropy Exfiltration', confidence: 0.92, severity: 'High', desc: 'Node 10.0.0.42 sending encrypted blobs to RU region.' }
    ]);

    // Search State
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [criticalOnly, setCriticalOnly] = useState(false);

    const bootstrapData = async () => {
        setIsRefreshing(true);
        try {
            const data = await apiClient('/api/soc-expert/summary');
            if (data) {
                const latest = data.latest_alerts || [];
                
                const newNodes: GraphNode[] = [
                    { id: 'soc_core', name: 'SOC_CORE_CENTRAL', symbolSize: 50, category: 0, value: 100, risk: 'nominal', itemStyle: { color: '#3B82F6', shadowBlur: 20, shadowColor: '#3B82F6' } }
                ];
                const newLinks: GraphLink[] = [];
                const ipSet = new Set(['soc_core']);

                latest.forEach((raw: any) => {
                    const srcIp = raw.src_ip || raw.src || `Node_${Math.floor(Math.random()*1000)}`;
                    if (!ipSet.has(srcIp)) {
                        const isCrit = raw.severity?.toLowerCase().includes("crit") || (raw.risk_score || 0) > 85;
                        newNodes.push({
                            id: srcIp,
                            name: srcIp,
                            symbolSize: isCrit ? 25 : 15,
                            category: isCrit ? 1 : 2,
                            value: raw.risk_score || 50,
                            risk: isCrit ? 'critical' : 'medium',
                            itemStyle: { 
                                color: isCrit ? '#EF4444' : '#60A5FA',
                                shadowBlur: 10,
                                shadowColor: isCrit ? '#EF4444' : '#60A5FA'
                            },
                            data: raw
                        });
                        newLinks.push({
                            source: srcIp,
                            target: 'soc_core',
                            lineStyle: {
                                color: isCrit ? '#EF4444' : '#3B82F6',
                                opacity: isCrit ? 0.6 : 0.2,
                                curveness: 0.2
                            }
                        });
                        ipSet.add(srcIp);
                    }
                });

                setGraphData({ nodes: newNodes, links: newLinks });
                setHistory(latest.slice(0, 50));
            }
        } catch (e) { console.error(e); }
        finally { setIsRefreshing(false); }
    };

    useEffect(() => {
        bootstrapData();
        const sse = new EventSource(`${API}/telemetry/stream?channels=events`);
        
        const handleEvent = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                const srcIp = data.src_ip || data.src || `Node_${Math.floor(Math.random()*1000)}`;
                const isCrit = data.severity?.toLowerCase().includes("crit") || (data.risk_score || 0) > 85;

                setGraphData(prev => {
                    if (prev.nodes.find(n => n.id === srcIp)) return prev;
                    
                    const newNode = {
                        id: srcIp,
                        name: srcIp,
                        symbolSize: isCrit ? 25 : 15,
                        category: isCrit ? 1 : 2,
                        value: data.risk_score || 50,
                        risk: isCrit ? 'critical' : 'medium' as any,
                        itemStyle: { 
                            color: isCrit ? '#EF4444' : '#60A5FA',
                            shadowBlur: 10,
                            shadowColor: isCrit ? '#EF4444' : '#60A5FA'
                        },
                        data: data
                    };

                    const newLink = {
                        source: srcIp,
                        target: 'soc_core',
                        lineStyle: {
                            color: isCrit ? '#EF4444' : '#3B82F6',
                            opacity: isCrit ? 0.6 : 0.2,
                            curveness: 0.2
                        }
                    };

                    return {
                        nodes: [...prev.nodes.slice(-100), newNode],
                        links: [...prev.links.slice(-100), newLink]
                    };
                });
                setHistory(prev => [data, ...prev].slice(0, 50));
            } catch (e) { console.error(e); }
        };

        sse.addEventListener("events", handleEvent);
        return () => {
            sse.removeEventListener("events", handleEvent);
            sse.close();
        };
    }, []);

    // Menu Actions
    const simulateAttackBurst = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            const burstNodes: GraphNode[] = [];
            const burstLinks: GraphLink[] = [];
            for (let i = 0; i < 5; i++) {
                const id = `BURST_${Math.floor(Math.random() * 9999)}`;
                burstNodes.push({
                    id, name: id, symbolSize: 20, category: 1, value: 95, risk: 'critical',
                    itemStyle: { color: '#EF4444', shadowBlur: 20, shadowColor: '#EF4444' }
                });
                burstLinks.push({ source: id, target: 'soc_core', lineStyle: { color: '#EF4444', opacity: 0.8, width: 2 } });
            }
            setGraphData(prev => ({
                nodes: [...prev.nodes, ...burstNodes],
                links: [...prev.links, ...burstLinks]
            }));
            setIsRefreshing(false);
        }, 1000);
    };

    const option = useMemo(() => {
        const displayNodes = criticalOnly ? graphData.nodes.filter(n => n.risk === 'critical' || n.id === 'soc_core') : graphData.nodes;
        const displayLinks = graphData.links.filter(l => displayNodes.find(n => n.id === l.source) && displayNodes.find(n => n.id === l.target));

        return {
            backgroundColor: 'transparent',
            tooltip: {
                backgroundColor: '#0D1117',
                borderColor: '#3B82F6',
                textStyle: { color: '#FFF', fontSize: 10, fontFamily: 'Inter' },
                formatter: (params: any) => {
                    if (params.dataType === 'node') {
                        return `<div class="p-2">
                            <div class="font-black text-blue-400 mb-1">${params.data.name}</div>
                            <div class="text-[9px] opacity-70 uppercase tracking-widest">Risk Index: ${params.data.value}%</div>
                            <div class="text-[9px] opacity-70 uppercase tracking-widest">Type: ${params.data.risk}</div>
                        </div>`;
                    }
                    return `Connection: ${params.data.source} → ${params.data.target}`;
                }
            },
            series: [
                {
                    type: 'graph',
                    layout: layout,
                    data: displayNodes,
                    links: displayLinks,
                    categories: [{ name: 'Command' }, { name: 'Critical Threat' }, { name: 'Anomalous Node' }],
                    roam: true,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'Inter'
                    },
                    force: { repulsion: 600, edgeLength: [60, 200], gravity: 0.1 },
                    circular: { rotateLabel: true },
                    lineStyle: { width: 1, curveness: 0.3, opacity: 0.2 },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: { width: 4, opacity: 1 },
                        label: { show: true, color: '#FFF', fontWeight: 'bold' }
                    }
                }
            ]
        };
    }, [graphData, layout, criticalOnly]);

    const onChartClick = (params: any) => {
        if (params.dataType === 'node') {
            setSelectedNode(params.data);
            setActiveTab('details');
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#02050A] text-slate-400 font-sans">
            
            {/* ── LEFT: FUNCTIONAL EXPERT TOOLBAR ── */}
            <div className="w-20 border-r border-white/5 bg-[#0D1117]/90 backdrop-blur-3xl flex flex-col items-center py-6 space-y-6 z-50 shadow-2xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4 cursor-pointer hover:bg-blue-500 transition-all active:scale-95" onClick={bootstrapData}>
                    <Brain className={cn("w-6 h-6 text-white", isRefreshing && "animate-spin")} />
                </div>
                
                {[
                    { icon: Search, label: "Neural Find", action: () => setShowSearch(!showSearch), active: showSearch },
                    { icon: Globe, label: "Circular", action: () => setLayout('circular'), active: layout === 'circular' },
                    { icon: Zap, label: "Attack Burst", action: simulateAttackBurst, active: false },
                    { icon: ShieldAlert, label: "Critical Focus", action: () => setCriticalOnly(!criticalOnly), active: criticalOnly },
                    { icon: Lightbulb, label: "Findings", action: () => { setSelectedNode(null); setActiveTab('findings'); }, active: activeTab === 'findings' },
                    { icon: History, label: "Signal History", action: () => { setSelectedNode(null); setActiveTab('logs'); }, active: activeTab === 'logs' }
                ].map((tool, i) => (
                    <button 
                        key={i} 
                        onClick={tool.action}
                        className={cn(
                            "p-3 rounded-2xl transition-all group relative border",
                            tool.active ? "bg-blue-600/20 border-blue-600/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 border-transparent hover:border-blue-500/20"
                        )}
                    >
                        <tool.icon className="w-5 h-5" />
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0D1117] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] shadow-2xl">
                            {tool.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* ── CENTER: EXPERT CANVAS ── */}
            <div className="flex-1 relative overflow-hidden">
                {/* Search Overlay */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] w-[500px]"
                        >
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="SEARCH NEURAL NODES (IP, ASSET, ZONE)..."
                                    className="w-full h-16 pl-16 pr-6 bg-[#0D1117]/95 backdrop-blur-3xl border border-blue-500/30 rounded-3xl text-white text-[12px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button onClick={() => setShowSearch(false)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-10 left-10 z-40 pointer-events-none">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[18px] font-black text-white uppercase tracking-[0.5em] drop-shadow-2xl">Neural Intelligence <span className="text-blue-500">Graph</span></h1>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 backdrop-blur-xl">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3B82F6]" /> Active Stream
                            </span>
                            <div className="w-px h-4 bg-white/10" />
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Nodes Intercepted: {graphData.nodes.length}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-full p-6">
                    <ReactECharts 
                        option={option} 
                        style={{ height: '100%', width: '100%' }}
                        onEvents={{ 'click': onChartClick }}
                        onChartReady={(instance) => { chartRef.current = instance; }}
                    />
                </div>

                {/* HUD Legend */}
                <div className="absolute bottom-10 right-10 z-40 bg-[#0D1117]/80 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl flex flex-col gap-4 shadow-2xl min-w-[240px]">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Metrics</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_15px_#EF4444]" />
                                <span className="text-[10px] font-bold text-white uppercase">Critical Alert</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{graphData.nodes.filter(n => n.risk === 'critical').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_#3B82F6]" />
                                <span className="text-[10px] font-bold text-white uppercase">Neural Assets</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{graphData.nodes.length - 1}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: INTELLIGENCE PANEL (TRIPLE MODE) ── */}
            <AnimatePresence>
                {(selectedNode || activeTab !== 'details') && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="w-[420px] border-l border-white/5 bg-[#0D1117]/98 backdrop-blur-3xl flex flex-col z-[60] shadow-[-30px_0_80px_rgba(0,0,0,0.9)]"
                    >
                        <div className="p-8 border-b border-white/5 flex flex-col gap-6 bg-black/20">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-[14px] font-black text-white uppercase tracking-widest">Intelligence Hub</h2>
                                </div>
                                <button onClick={() => { setSelectedNode(null); setActiveTab('details'); }} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            
                            <div className="flex gap-4 p-1 bg-white/5 rounded-2xl">
                                {[
                                    { id: 'details', label: 'Forensics', icon: Target },
                                    { id: 'findings', label: 'Findings', icon: Lightbulb },
                                    { id: 'logs', label: 'Activity', icon: Activity }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            {activeTab === 'details' && selectedNode ? (
                                <div className="space-y-10">
                                    <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[32px] relative overflow-hidden">
                                        <div className="absolute -right-6 -top-6 opacity-10">
                                            <Target className="w-32 h-32 text-blue-500" />
                                        </div>
                                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest block mb-3">Neural Resource</span>
                                        <h3 className="text-3xl font-black text-white truncate mb-3">{selectedNode.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {selectedNode.risk === 'critical' ? 'High Entropy Vector' : 'Active Ingress'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Risk Index</span>
                                            <span className={cn("text-3xl font-black", selectedNode.risk === 'critical' ? "text-red-500" : "text-white")}>{selectedNode.value}%</span>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Trust Level</span>
                                            <span className="text-3xl font-black text-blue-400">0.96</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[12px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Terminal className="w-5 h-5 text-blue-500" /> Attribution Details
                                        </h4>
                                        <div className="space-y-4 bg-white/[0.02] border border-white/5 p-8 rounded-[32px] font-mono text-[13px]">
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-500">Asset Zone</span>
                                                <span className="text-white">PROD_CLUSTER_01</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-500">Signal Type</span>
                                                <span className="text-blue-400">{selectedNode.data?.attackType || 'Symmetric Flow'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Origin Provider</span>
                                                <span className="text-white truncate w-40 text-right">{selectedNode.data?.sensor || 'External Network'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-col gap-4">
                                        <button className="w-full py-5 bg-red-600 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3">
                                            <ShieldAlert className="w-5 h-5" /> Deploy Active Shunt
                                        </button>
                                        <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                            <Maximize className="w-5 h-5" /> Deep Sandbox Analysis
                                        </button>
                                    </div>
                                </div>
                            ) : activeTab === 'findings' ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl mb-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Lightbulb className="w-5 h-5 text-blue-500" />
                                            <span className="text-[12px] font-black text-white uppercase tracking-widest">AI Detection Clusters</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">Neural analysis has identified the following coordinated activity patterns across the active graph.</p>
                                    </div>
                                    {findings.map(finding => (
                                        <div key={finding.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4 hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{finding.type}</span>
                                                    <h4 className="text-[14px] font-black text-white">{finding.title}</h4>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                    finding.severity === 'Critical' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                                                )}>
                                                    {finding.severity}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{finding.desc}</p>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[10px] font-bold text-white">Conf: {(finding.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                                <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Examine Nodes</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {history.map((h, i) => (
                                        <div key={i} className="p-5 bg-white/[0.01] border border-white/5 rounded-[24px] space-y-3 hover:bg-white/[0.03] transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", h.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 'bg-blue-500')} />
                                                    <span className="text-[11px] font-black text-white uppercase tracking-tighter">{h.src_ip || 'Internal Node'}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-600">{new Date().toLocaleTimeString()}</span>
                                            </div>
                                            <div className="text-[12px] text-slate-400 font-medium leading-relaxed">{h.message || h.attackType}</div>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                                <span>SIG: {h.type || 'SYSTEM'}</span>
                                                <span>•</span>
                                                <span>TTL: 64ms</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
