'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity, AlertTriangle, Shield, Globe, Wifi, Database, Lock,
    Radio, Zap, Eye, Server, TrendingUp, TrendingDown, Clock,
    Download, RefreshCw, Filter, Search, MapPin, Terminal,
    Network, FileText, Bell, CheckCircle, XCircle, Minus,
    BarChart3, PieChart, Circle, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
interface ThreatEvent {
    id: string;
    timestamp: string;
    sourceIp: string;
    destIp: string;
    geo: string;
    service: string;
    eventType: string;
    severity: 'CRITIQUE' | 'ÉLEVÉ' | 'MOYEN' | 'NOUVEAU';
    status: 'Actif' | 'Résolu' | 'En cours';
}

interface TrafficMetric {
    label: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    risk: 'low' | 'medium' | 'high';
}

const severityStyles = {
    CRITIQUE: 'text-red-500 bg-red-500/10 border-red-500/30',
    ÉLEVÉ: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    MOYEN: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    NOUVEAU: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
};

const statusStyles = {
    'Actif': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Résolu': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'En cours': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
};

export default function ThreatMonitorPage() {
    const [isLive, setIsLive] = useState(true);
    const [latency, setLatency] = useState(12);
    const [timeRange, setTimeRange] = useState('5m');
    const [totalEvents, setTotalEvents] = useState(116);
    const [criticalNodes, setCriticalNodes] = useState(27);
    const [events, setEvents] = useState<ThreatEvent[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState('Toutes Sévérités');
    const [selectedStatus, setSelectedStatus] = useState('Tous Statuts');

    // Stats
    const [stats, setStats] = useState({
        totalEvents: 0,
        criticalAlerts: 0,
        blockedAttacks: 0,
        activeThreats: 0,
        mttr: '--',
        mttd: '--',
        uptime: '--',
        coverage: '24/7'
    });

    // Traffic Metrics
    const protocolMetrics: TrafficMetric[] = [
        { label: 'SSH', value: 0, unit: 'req', trend: 'stable', risk: 'low' },
        { label: 'HTTP/S', value: 0, unit: 'req', trend: 'stable', risk: 'low' },
        { label: 'SMTP', value: 0, unit: 'req', trend: 'stable', risk: 'low' },
        { label: 'FTP', value: 0, unit: 'req', trend: 'stable', risk: 'low' },
        { label: 'DNS', value: 0, unit: 'req', trend: 'stable', risk: 'low' },
    ];

    const threatMetrics: TrafficMetric[] = [
        { label: 'Web Portal', value: 0, unit: '/s', trend: 'stable', risk: 'low' },
        { label: 'Data Harvest', value: 0, unit: '/s', trend: 'stable', risk: 'low' },
        { label: 'Phishing', value: 0, unit: '/s', trend: 'stable', risk: 'low' },
        { label: 'C2 Server', value: 0, unit: '/s', trend: 'stable', risk: 'low' },
        { label: 'Exfiltration', value: 0, unit: '/s', trend: 'stable', risk: 'low' },
    ];

    // Severity distribution (for donut chart)
    const severityDistribution = {
        critique: 0,
        élevé: 0,
        moyen: 0,
        nouveau: 0
    };

    // Simulate real-time updates
    useEffect(() => {
        if (autoRefresh && isLive) {
            const interval = setInterval(() => {
                setLatency(Math.floor(Math.random() * 10) + 8);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, isLive]);

    return (
        <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-in fade-in duration-700 overflow-x-hidden">
            {/* Header */}
            <header className="space-y-6">
                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <Globe className="h-6 w-6 text-purple-400 animate-pulse" />
                                </div>
                                {isLive && (
                                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-pulse border-2 border-background" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                                    Live Threat <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Sphere</span>
                                </h1>
                                <p className="text-xs text-slate-500 font-bold tracking-wide mt-1">Global Signal Interception</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Latency Indicator */}
                        <div className="px-6 py-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency</p>
                                    <p className="text-lg font-black text-white font-mono">{latency}ms</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                    {isLive ? 'LIVE STREAM :: ACTIVE' : 'PAUSED'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Info Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 hover:scale-[1.02] transition-transform">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Threat Intelligence</p>
                        <p className="text-xs text-slate-400 font-semibold">REAL-TIME STREAM :: LIVE</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Events</p>
                        <p className="text-2xl font-black text-white font-mono">{totalEvents}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Critical Nodes</p>
                        <p className="text-2xl font-black text-orange-500 font-mono">{criticalNodes}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Operational Base</p>
                        <p className="text-sm font-black text-white">Paris SOC</p>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md w-fit">
                    {['5m', '15m', '1h', '6h'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                timeRange === range
                                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Column - Traffic Analysis */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Network Volatility */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Volatility</h3>
                            <Activity className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[9px] text-slate-500 font-bold">Traffic Flow Analysis</span>
                                    <span className="text-[9px] text-slate-500 font-mono">LIVE</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-slate-600 font-bold">Total Flux</span>
                                <div className="flex items-center gap-1">
                                    <ArrowUp className="h-3 w-3 text-emerald-400" />
                                    <span className="text-sm font-black text-emerald-400">+12.4%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protocol Metrics */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-source Monitoring</h3>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[8px] text-slate-500 font-black uppercase">LIVE</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {protocolMetrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-white/5 hover:border-purple-500/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            metric.risk === 'low' ? 'bg-slate-600' : metric.risk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                        )} />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide group-hover:text-white transition-colors">
                                            {metric.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white font-mono">{metric.value} <span className="text-[10px] text-slate-600">{metric.unit}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Types */}
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Data Flow</h3>
                        <div className="space-y-3">
                            {threatMetrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-white/5 hover:border-red-500/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-3.5 w-3.5 text-slate-600 group-hover:text-red-400 transition-colors" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide group-hover:text-white transition-colors">
                                            {metric.label}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-white font-mono">{metric.value} <span className="text-[10px] text-slate-600">{metric.unit}</span></span>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">{metric.risk}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Column - Stats & Analytics */}
                <div className="xl:col-span-6 space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Événements Total</p>
                            <p className="text-3xl font-black text-white font-mono mb-1">{stats.totalEvents}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-emerald-400 font-bold">+0%</span>
                            </div>
                        </div>
                        <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Alertes Critiques</p>
                            <p className="text-3xl font-black text-red-400 font-mono mb-1">{stats.criticalAlerts}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600 font-bold">+0%</span>
                            </div>
                        </div>
                        <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Attaques Bloquées</p>
                            <p className="text-3xl font-black text-orange-400 font-mono mb-1">{stats.blockedAttacks}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600 font-bold">+0%</span>
                            </div>
                        </div>
                        <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Menaces Actives</p>
                            <p className="text-3xl font-black text-yellow-400 font-mono mb-1">{stats.activeThreats}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600 font-bold">+0%</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">MTTR</p>
                            <p className="text-2xl font-black text-white font-mono mb-1">{stats.mttr}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase">Temps résolution</p>
                        </div>
                        <div className="glass-card p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">MTTD</p>
                            <p className="text-2xl font-black text-white font-mono mb-1">{stats.mttd}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase">Temps détection</p>
                        </div>
                        <div className="glass-card p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Uptime</p>
                            <p className="text-2xl font-black text-white font-mono mb-1">{stats.uptime}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase">Disponibilité</p>
                        </div>
                        <div className="glass-card p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Surveill.</p>
                            <p className="text-2xl font-black text-emerald-400 font-mono mb-1">{stats.coverage}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase">Couverture</p>
                        </div>
                    </div>

                    {/* Severity Distribution Chart */}
                    <div className="glass-card p-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Répartition par Sévérité</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                <div className="h-20 w-20 mx-auto rounded-full bg-red-500/10 border-4 border-red-500/30 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-black text-red-400 font-mono">{severityDistribution.critique}</span>
                                </div>
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Critique</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                <div className="h-20 w-20 mx-auto rounded-full bg-orange-500/10 border-4 border-orange-500/30 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-black text-orange-400 font-mono">{severityDistribution.élevé}</span>
                                </div>
                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Élevé</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                <div className="h-20 w-20 mx-auto rounded-full bg-yellow-500/10 border-4 border-yellow-500/30 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-black text-yellow-400 font-mono">{severityDistribution.moyen}</span>
                                </div>
                                <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Moyen</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                                <div className="h-20 w-20 mx-auto rounded-full bg-cyan-500/10 border-4 border-cyan-500/30 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-black text-cyan-400 font-mono">{severityDistribution.nouveau}</span>
                                </div>
                                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Nouveau</p>
                            </div>
                        </div>
                    </div>

                    {/* Live Traffic Logs */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Live Traffic Logs</h3>
                                <p className="text-[9px] text-slate-500 font-bold mt-1">FULL LOGS</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-600" />
                                <span className="text-[9px] text-slate-600 font-black uppercase">No signals archived</span>
                            </div>
                        </div>
                        <div className="h-32 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-center">
                            <div className="text-center opacity-30">
                                <Terminal className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Awaiting Signal Stream</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Internal Traffic */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Internal Traffic Monitor */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Traffic Monitor</h3>
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-[8px] text-slate-500 font-black uppercase">LIVE</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Requests</span>
                                    <span className="text-sm font-black text-white font-mono">0</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Minus className="h-3 w-3 text-slate-600" />
                                    <span className="text-[10px] text-slate-600 font-bold">+0% vs last period</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="h-4 w-4 text-slate-600" />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Health</span>
                                </div>
                                <p className="text-xs text-slate-600 font-bold">N/A</p>
                                <p className="text-[10px] text-slate-700 mt-2">No internal traffic data yet.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Network className="h-4 w-4 text-slate-600" />
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Connections</span>
                                </div>
                                <p className="text-2xl font-black text-white font-mono">0</p>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Auto-refresh enabled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detection Database */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detection Database</h3>
                            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">ALL RECORDS</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Historique des Événements</p>
                                <p className="text-xs text-slate-600 font-bold">Real-time Security Events • 0 au total</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                                    <p className="text-[8px] text-red-400 font-black uppercase mb-1">Critique:</p>
                                    <p className="text-lg font-black text-red-400 font-mono">0</p>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-center">
                                    <p className="text-[8px] text-orange-400 font-black uppercase mb-1">Élevé:</p>
                                    <p className="text-lg font-black text-orange-400 font-mono">0</p>
                                </div>
                                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-center">
                                    <p className="text-[8px] text-cyan-400 font-black uppercase mb-1">Nouveau:</p>
                                    <p className="text-lg font-black text-cyan-400 font-mono">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Logs Table */}
            <div className="glass-card p-2">
                <div className="p-6 border-b border-white/5 bg-slate-950/20">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Historique des Événements</h2>
                            <p className="text-[10px] text-slate-500 font-bold">Real-time Security Events • 0 au total</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Time filters */}
                            <div className="flex gap-1 bg-slate-900/40 p-1 rounded-lg">
                                {['15m', '1h', '6h', '24h', '7d', '30d'].map((t) => (
                                    <button
                                        key={t}
                                        className="px-3 py-1.5 text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-wider rounded transition-colors hover:bg-white/5"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                                <input
                                    type="text"
                                    placeholder="Rechercher IP, Service, Type..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-white placeholder:text-slate-700 uppercase tracking-wide focus:outline-none focus:border-purple-500/30 w-64"
                                />
                            </div>

                            {/* Filters */}
                            <select
                                value={selectedSeverity}
                                onChange={(e) => setSelectedSeverity(e.target.value)}
                                className="px-4 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wide focus:outline-none focus:border-purple-500/30"
                            >
                                <option>Toutes Sévérités</option>
                                <option>CRITIQUE</option>
                                <option>ÉLEVÉ</option>
                                <option>MOYEN</option>
                                <option>NOUVEAU</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wide focus:outline-none focus:border-purple-500/30"
                            >
                                <option>Tous Statuts</option>
                                <option>Actif</option>
                                <option>Résolu</option>
                                <option>En cours</option>
                            </select>

                            <button className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-[10px] font-black text-purple-400 uppercase tracking-wider hover:bg-purple-500/20 transition-colors flex items-center gap-2">
                                <Download className="h-3.5 w-3.5" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40 border-b border-white/5">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Heure</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">IP Source</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">IP Dest</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Geo</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Service</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Type d'Événement</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Sévérité</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={10} className="py-32 text-center">
                                    <div className="flex flex-col items-center opacity-20">
                                        <FileText className="h-16 w-16 mb-4 text-slate-600" />
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Affichage 0 sur 0 événements</p>
                                        <p className="text-[9px] text-slate-700 font-bold mt-2">Auto-refresh actif</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
