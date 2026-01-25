"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShieldAlert, Search, Filter, RefreshCw, MoreVertical, Eye, Bell, Shield, Terminal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const severityColors = {
    critical: "text-danger border-danger/20 bg-danger/10",
    high: "text-warning border-warning/20 bg-warning/10",
    medium: "text-info border-info/20 bg-info/10",
    low: "text-success border-success/20 bg-success/10",
} as const

type AlertRow = {
    id: string
    rule_id: string
    severity: string
    state: string
    source: string
    timestamp: string
    dedup_key?: string
}

export default function AlertsPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"
    const [alerts, setAlerts] = useState<AlertRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState({ severity: "all", state: "all", search: "" })

    const fetchAlerts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                limit: "100",
                ...(filter.severity !== "all" ? { severity: filter.severity } : {}),
                ...(filter.state !== "all" ? { status: filter.state } : {}),
            })
            const res = await fetch(`${apiBase}/alerts?${params.toString()}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setAlerts(
                Array.isArray(data)
                    ? data.map((alert: any) => ({
                        id: alert.id,
                        rule_id: alert.rule_id,
                        severity: alert.severity?.toLowerCase() || "medium",
                        state: alert.state || "new",
                        source: alert.evidence?.source || alert.user || alert.host || "unknown",
                        timestamp: new Date(alert.created_at || alert.timestamp_epoch * 1000).toISOString(),
                        dedup_key: alert.dedup_key,
                    }))
                    : []
            )
            setError(null)
        } catch (err) {
            setError("Unable to sync telemetry buffer.")
            setAlerts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
    }, [apiBase, filter.severity, filter.state])

    const filteredAlerts = alerts.filter((alert) =>
        filter.search ? alert.rule_id.toLowerCase().includes(filter.search.toLowerCase()) : true
    )

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* HUD Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Alert Command Center</span>
                    </div>
                    <h1 className="text-display mb-1 text-white">
                        Detections <span className="text-danger">Inbox</span>
                    </h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest max-w-xl">
                        Real-time anomaly detection and security incident response queue.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-2 bg-bg-2/50 backdrop-blur-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-2">
                            PRIORITY FILTER: {filter.severity.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                            <input
                                placeholder="IDENTIFY_RULE_ID..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-1/50 border border-border-1 text-[10px] font-bold text-white placeholder:text-text-3/50 focus:outline-none focus:border-danger/30 focus:ring-1 focus:ring-danger/30 transition-all uppercase tracking-widest"
                                value={filter.search}
                                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <button
                            onClick={fetchAlerts}
                            className="h-12 w-12 rounded-xl bg-bg-1/50 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-text-2 hover:bg-bg-3 transition-all group"
                        >
                            <RefreshCw className={cn("h-5 w-5 group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Viewport Filters */}
            <div className="glass-panel p-2 rounded-xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
                    <Filter className="h-3.5 w-3.5 text-text-3" />
                    <span className="text-[10px] font-black text-text-2 uppercase tracking-widest mr-2">Severity</span>
                    {["all", "critical", "high", "medium", "low"].map((sev) => (
                        <button
                            key={sev}
                            onClick={() => setFilter(prev => ({ ...prev, severity: sev }))}
                            className={cn(
                                "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all border border-transparent",
                                filter.severity === sev
                                    ? "bg-white text-black shadow-lg"
                                    : "text-text-3 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {sev}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 px-4 py-2">
                    <Bell className="h-3.5 w-3.5 text-text-3" />
                    <span className="text-[10px] font-black text-text-2 uppercase tracking-widest mr-2">State</span>
                    {["all", "new", "acknowledged", "closed"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(prev => ({ ...prev, state: st }))}
                            className={cn(
                                "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all border border-transparent",
                                filter.state === st
                                    ? "bg-white text-black shadow-lg"
                                    : "text-text-3 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {st}
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    <button
                        onClick={() => setFilter({ severity: "all", state: "all", search: "" })}
                        className="text-[9px] font-black text-text-3 hover:text-danger uppercase tracking-widest px-4 py-2 hover:bg-danger/5 rounded-lg transition-colors"
                    >
                        Reset Matrices
                    </button>
                </div>
            </div>

            {/* Detections Terminal */}
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[600px] border border-border-1 relative">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-bg-0/50" />

                <div className="p-6 border-b border-border-1 flex items-center justify-between bg-bg-3/30">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-danger" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black text-white tracking-widest uppercase">Telemetry Buffer</h2>
                            <span className="text-[9px] font-mono text-text-3">LIVE_FEED::ENCRYPTED</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-1/50 border-b border-border-1">
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Priority</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Rule Identifier</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">State</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Origin Source</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Utc_Timestamp</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1/50">
                            <AnimatePresence initial={false}>
                                {filteredAlerts.length > 0 ? (
                                    filteredAlerts.map((alert) => (
                                        <motion.tr
                                            key={alert.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group hover:bg-p-600/5 transition-all cursor-pointer"
                                        >
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-3 py-1 rounded text-[8px] font-black tracking-widest uppercase border inline-flex items-center gap-1.5 shadow-sm",
                                                    severityColors[alert.severity as keyof typeof severityColors] || severityColors.medium
                                                )}>
                                                    <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                                                    {alert.severity}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-bold text-white tracking-tight group-hover:text-p-400 transition-colors">{alert.rule_id}</div>
                                                <div className="text-[9px] font-mono text-text-3/60 mt-1">DEDUP_KEY::{alert.dedup_key?.slice(-8).toUpperCase() || "N/A"}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-bold text-text-2 uppercase tracking-widest">{alert.state}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Terminal className="h-3 w-3 text-text-3" />
                                                    <span className="text-[10px] font-bold text-text-2 font-mono">{alert.source}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-[10px] font-mono text-text-3/60 tabular-nums">
                                                    {alert.timestamp.split('T')[1].replace('Z', '')}
                                                    <span className="text-text-3/30 ml-2">UTC</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/alerts/${alert.id}`}>
                                                        <button className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-p-400 hover:bg-p-600/20 transition-all">
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                    </Link>
                                                    <button className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-p-400 hover:bg-p-600/20 transition-all">
                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-20">
                                                <Shield className="h-16 w-16 mb-6 text-text-3" />
                                                <p className="text-xs font-black uppercase tracking-[0.3em] text-text-2">Buffer is currently empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {error && (
                    <div className="p-4 bg-danger/10 border-t border-danger/20 text-[10px] font-black text-danger text-center tracking-widest uppercase flex items-center justify-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    )
}
