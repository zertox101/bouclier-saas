"use client";

import React from 'react';
import { KpiCard } from '@/components/ui/analytics';
import { GlassCard, SseStatusIndicator, SeverityBadge } from '@/components/ui/core';
import { useSocketSse } from '@/lib/hooks/use-socket-sse';
import { Activity, ShieldAlert, Wifi, Cpu, AlertTriangle, Play, Pause, Trash2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryEvent {
    id: string;
    timestamp: string;
    source: string;
    type: string;
    severity: string;
    message: string;
}

export default function DashboardOverview() {
    const { data: telemetry, status } = useSocketSse<TelemetryEvent[]>({
        url: 'http://localhost:8005/api/v1/telemetry/stream',
        pollingFallback: true,
    });

    const [isPaused, setIsPaused] = React.useState(false);
    const [events, setEvents] = React.useState<TelemetryEvent[]>([]);

    React.useEffect(() => {
        if (telemetry && !isPaused) {
            setEvents(prev => [...telemetry, ...prev].slice(0, 50));
        }
    }, [telemetry, isPaused]);

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6">
                <div>
                    <h1 className="text-display mb-1 text-text-1">Command Center</h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest">Global Telemetry Monitoring HUD</p>
                </div>
                <SseStatusIndicator status={status} />
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <KpiCard title="Active Ingress" value="1.4M" unit="PPS" delta={12} description="Packets per sec" />
                <KpiCard title="Threat Detections" value="124" delta={-3} description="Last 24 hours" />
                <KpiCard title="Global Health" value="98.2" unit="%" delta={0.4} description="Fleet status" />
                <KpiCard title="Blocked Attacks" value="12.8K" delta={42} description="Auto-remediated" />
                <KpiCard title="Signal Latency" value="1.2" unit="MS" delta={-15} description="Inter-node speed" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Stream */}
                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="!p-0 border-border-1 overflow-hidden">
                        <div className="p-6 border-b border-border-1 bg-bg-2/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-p-600/10 text-p-400"><Activity className="w-5 h-5" /></div>
                                <h3 className="text-lg font-bold text-text-1 tracking-tight">Live Telemetry Stream</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="p-2 rounded-lg bg-bg-0 border border-border-1 text-text-3 hover:text-white transition-colors"
                                >
                                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                </button>
                                <button className="p-2 rounded-lg bg-bg-0 border border-border-1 text-text-3 hover:text-white transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="h-[500px] overflow-y-auto custom-scrollbar p-0">
                            <div className="divide-y divide-border-1/50">
                                <AnimatePresence initial={false}>
                                    {events.map((event, idx) => (
                                        <motion.div
                                            key={event.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 hover:bg-bg-3 transition-all flex items-center gap-6 group"
                                        >
                                            <div className="text-[11px] font-mono text-text-3 opacity-40 whitespace-nowrap">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                            <div className="w-24">
                                                <SeverityBadge severity={event.severity} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-text-1 mb-0.5">{event.source}</div>
                                                <div className="text-[11px] text-text-2 tracking-tight line-clamp-1">{event.message}</div>
                                            </div>
                                            <div className="hidden group-hover:flex items-center gap-2">
                                                <button className="p-1.5 rounded hover:bg-p-600/20 text-text-3 hover:text-p-400"><Copy className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {events.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-text-3 opacity-30 py-40">
                                        <Activity className="w-12 h-12 mb-4 animate-pulse" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Awaiting Signal Ingestion...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Diagnostics */}
                <div className="lg:col-span-4 space-y-8">
                    <GlassCard className="border-border-1">
                        <h3 className="text-sm font-black text-text-3 uppercase tracking-widest mb-6 border-b border-border-1 pb-4">Latest Alerts</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-3 rounded-xl bg-bg-1/50 border border-border-1 hover:border-p-600/30 transition-all cursor-pointer">
                                    <div className="p-2 rounded-lg bg-danger/10 text-danger h-fit"><ShieldAlert className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-text-1 mb-1">Unauthorized Access Attempt</div>
                                        <p className="text-[10px] text-text-3 leading-tight mb-2">Source IP 192.168.1.104 attempted SSH bypass on sensitive node.</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-danger uppercase">Critical</span>
                                            <span className="text-[8px] font-medium text-text-3 opacity-50">2m ago</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 text-[10px] font-black text-p-400 uppercase tracking-widest hover:text-white transition-colors">
                                View All Priority Alerts
                            </button>
                        </div>
                    </GlassCard>

                    <GlassCard className="border-border-1">
                        <h3 className="text-sm font-black text-text-3 uppercase tracking-widest mb-6 border-b border-border-1 pb-4">Fleet Health</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-text-2 uppercase tracking-widest">CPU LOAD (G-NODE-01)</span>
                                    <span className="text-[10px] font-mono text-text-1">42%</span>
                                </div>
                                <div className="h-1 bg-bg-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-p-500 transition-all" style={{ width: '42%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-text-2 uppercase tracking-widest">MEM USAGE</span>
                                    <span className="text-[10px] font-mono text-text-1">8.2 / 16 GB</span>
                                </div>
                                <div className="h-1 bg-bg-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-neon-1 transition-all" style={{ width: '51%' }} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
                                    <span className="text-[10px] font-bold text-text-3 uppercase">OS OK</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-text-3 opacity-50">UPTIME: 14D 4H</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
