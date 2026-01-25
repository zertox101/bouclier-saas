"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    AlertTriangle,
    Activity,
    Clock,
    TrendingUp,
    TrendingDown,
    Eye,
    Lock,
    Zap,
    Target
} from "lucide-react";

interface SOCMetricsProps {
    totalEvents?: number;
    criticalAlerts?: number;
    highAlerts?: number;
    mediumAlerts?: number;
    lowAlerts?: number;
    blockedAttacks?: number;
    activeThreats?: number;
    uptime?: number;
    mttr?: number; // Mean Time To Resolve (minutes)
    mttd?: number; // Mean Time To Detect (seconds)
}

export default function SOCMetrics({
    totalEvents = 0,
    criticalAlerts = 0,
    highAlerts = 0,
    mediumAlerts = 0,
    lowAlerts = 0,
    blockedAttacks = 0,
    activeThreats = 0,
    uptime = 0,
    mttr = 0,
    mttd = 0,
}: SOCMetricsProps) {
    const [mounted, setMounted] = useState(false);
    const [animatedValues, setAnimatedValues] = useState({
        totalEvents,
        criticalAlerts,
        blockedAttacks,
        activeThreats,
    });
    const [trends, setTrends] = useState({
        totalEvents: 0,
        criticalAlerts: 0,
        blockedAttacks: 0,
        activeThreats: 0,
    });
    const prevValuesRef = useRef({
        totalEvents,
        criticalAlerts,
        blockedAttacks,
        activeThreats,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const prev = prevValuesRef.current;
        const nextValues = {
            totalEvents,
            criticalAlerts,
            blockedAttacks,
            activeThreats,
        };
        const trendFor = (current: number, previous: number) => {
            if (!previous) return 0;
            return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        setAnimatedValues(nextValues);
        setTrends({
            totalEvents: trendFor(totalEvents, prev.totalEvents),
            criticalAlerts: trendFor(criticalAlerts, prev.criticalAlerts),
            blockedAttacks: trendFor(blockedAttacks, prev.blockedAttacks),
            activeThreats: trendFor(activeThreats, prev.activeThreats),
        });
        prevValuesRef.current = nextValues;
    }, [totalEvents, criticalAlerts, blockedAttacks, activeThreats]);

    const metrics = [
        {
            label: "Total Events",
            value: animatedValues.totalEvents,
            icon: Activity,
            color: "cyan",
            trend: trends.totalEvents,
        },
        {
            label: "Critical Alerts",
            value: animatedValues.criticalAlerts,
            icon: AlertTriangle,
            color: "red",
            trend: trends.criticalAlerts,
            pulse: animatedValues.criticalAlerts > 10,
        },
        {
            label: "Blocked Attacks",
            value: animatedValues.blockedAttacks,
            icon: Shield,
            color: "emerald",
            trend: trends.blockedAttacks,
        },
        {
            label: "Active Threats",
            value: animatedValues.activeThreats,
            icon: Target,
            color: "orange",
            pulse: animatedValues.activeThreats > 0,
            trend: trends.activeThreats,
        },
    ];

    const kpis = [
        { label: "MTTR", value: mttr ? `${mttr}m` : "--", desc: "Avg. Resolution", icon: Clock },
        { label: "MTTD", value: mttd ? `${mttd}s` : "--", desc: "Avg. Detection", icon: Zap },
        { label: "Uptime", value: uptime ? `${uptime}%` : "--", desc: "Availability", icon: Lock },
        { label: "Monitoring", value: "24/7", desc: "Live Coverage", icon: Eye },
    ];

    const totalForWidth = Math.max(totalEvents, 1);
    const severityBreakdown = [
        { label: "Critical", count: criticalAlerts, color: "bg-red-500", width: (criticalAlerts / totalForWidth) * 100 * 10 },
        { label: "High", count: highAlerts, color: "bg-orange-500", width: (highAlerts / totalForWidth) * 100 * 5 },
        { label: "Medium", count: mediumAlerts, color: "bg-yellow-500", width: (mediumAlerts / totalForWidth) * 100 * 3 },
        { label: "Low", count: lowAlerts, color: "bg-green-500", width: (lowAlerts / totalForWidth) * 100 * 2 },
    ];

    const colorClasses: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
        cyan: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", shadow: "shadow-cyan-500/10" },
        red: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", shadow: "shadow-red-500/10" },
        emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", shadow: "shadow-emerald-500/10" },
        orange: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", shadow: "shadow-orange-500/10" },
    };

    return (
        <div className="space-y-4 font-sans">
            {/* Main Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((metric, idx) => {
                    const colors = colorClasses[metric.color] || colorClasses.cyan;
                    const Icon = metric.icon;

                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative overflow-hidden rounded-xl border ${colors.border} bg-slate-900/40 backdrop-blur-xl p-4 transition-all hover:border-${metric.color}-500/50 group`}
                        >
                            <div className={`absolute top-0 right-0 w-16 h-16 bg-${metric.color}-500/5 blur-[32px] rounded-full -mr-8 -mt-8`} />

                            {metric.pulse && (
                                <div className="absolute top-3 right-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${metric.color === 'red' ? 'bg-red-400' : 'bg-orange-400'} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${metric.color === 'red' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                                    <Icon className={`h-4 w-4 ${colors.text}`} />
                                </div>
                                <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{metric.label}</span>
                            </div>

                            <div className="flex items-end justify-between relative z-10">
                                <motion.span
                                    key={metric.value}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-black text-white tracking-tighter"
                                >
                                    {mounted ? metric.value.toLocaleString() : "---"}
                                </motion.span>

                                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${metric.trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {metric.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* KPIs + Severity Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* KPIs */}
                <div className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-4">
                    <div className="flex items-center justify-between gap-4">
                        {kpis.map((kpi, idx) => {
                            const Icon = kpi.icon;
                            return (
                                <div key={kpi.label} className="flex-1 text-center border-r border-white/5 last:border-0 px-2 group">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">{kpi.label}</span>
                                    </div>
                                    <div className="text-xl font-black text-white tracking-tighter">{kpi.value}</div>
                                    <div className="text-[9px] text-slate-600 font-bold uppercase">{kpi.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Severity Breakdown */}
                <div className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Severity Breakdown</div>
                        <div className="flex gap-2">
                            {severityBreakdown.map(s => (
                                <div key={s.label} className="flex items-center gap-1">
                                    <div className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                                    <span className="text-[9px] text-slate-500 font-black uppercase">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 h-2.5 rounded-full overflow-hidden bg-slate-950/50 p-0.5 border border-white/5">
                        {severityBreakdown.map((sev, idx) => (
                            <motion.div
                                key={sev.label}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(sev.width, 5)}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`h-full rounded-full ${sev.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                                title={`${sev.label}: ${sev.count}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
                        <span>Critical Priority</span>
                        <span>Low Priority</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
