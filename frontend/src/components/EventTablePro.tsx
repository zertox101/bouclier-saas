"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Download,
    RefreshCw,
    Filter,
    ChevronDown,
    AlertTriangle,
    Clock,
    Globe,
    Server,
    Eye,
    ExternalLink,
    Copy,
    CheckCircle
} from "lucide-react";

interface EventRow {
    id: string;
    timestamp: string;
    time: string;
    srcIp: string;
    dstIp: string;
    country: string;
    countryFlag: string;
    service: string;
    port: number;
    protocol: string;
    eventType: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    status: "New" | "Investigating" | "Resolved" | "False Positive";
    details: string;
    ioc?: string;
}

interface EventTableProProps {
    events?: EventRow[];
    onEventClick?: (event: EventRow) => void;
    onRefresh?: () => void;
    autoRefresh?: boolean;
}


const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    Critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40" },
    High: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40" },
    Medium: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/40" },
    Low: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/40" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
    New: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
    Investigating: { bg: "bg-purple-500/15", text: "text-purple-400" },
    Resolved: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    "False Positive": { bg: "bg-slate-500/15", text: "text-slate-400" },
};

const timeRanges = ["15m", "1h", "6h", "24h", "7d", "30d"];
const severities = ["All", "Critical", "High", "Medium", "Low"];
const statuses = ["All", "New", "Investigating", "Resolved", "False Positive"];

export default function EventTablePro({
    events,
    onEventClick,
    onRefresh,
    autoRefresh = true,
}: EventTableProProps) {
    const [mounted, setMounted] = useState(false);
    const [eventData, setEventData] = useState<EventRow[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeRange, setTimeRange] = useState("24h");
    const [severityFilter, setSeverityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Initialize events on client-side only to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        setEventData(events || []);
    }, [events]);

    // Filter events
    const filteredEvents = useMemo(() => {
        return eventData.filter(event => {
            const matchesSearch = searchQuery === "" ||
                event.srcIp.includes(searchQuery) ||
                event.dstIp.includes(searchQuery) ||
                event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.country.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSeverity = severityFilter === "All" || event.severity === severityFilter;
            const matchesStatus = statusFilter === "All" || event.status === statusFilter;

            return matchesSearch && matchesSeverity && matchesStatus;
        });
    }, [eventData, searchQuery, severityFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: eventData.length,
        critical: eventData.filter(e => e.severity === "Critical").length,
        high: eventData.filter(e => e.severity === "High").length,
        medium: eventData.filter(e => e.severity === "Medium").length,
        low: eventData.filter(e => e.severity === "Low").length,
        new: eventData.filter(e => e.status === "New").length,
    }), [eventData]);


    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
        onRefresh?.();
    };

    const handleExport = () => {
        const csv = [
            ["ID", "Timestamp", "Src IP", "Dst IP", "Country", "Service", "Port", "Event Type", "Severity", "Status", "Details"].join(","),
            ...filteredEvents.map(e => [
                e.id, e.timestamp, e.srcIp, e.dstIp, e.country, e.service, e.port, e.eventType, e.severity, e.status, `"${e.details}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `soc_events_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyIp = (ip: string, id: string) => {
        navigator.clipboard.writeText(ip);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section className="relative overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-950 shadow-xl">
            {/* Header */}
            <div className="border-b border-slate-800/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-md shadow-red-500/20">
                            <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Historique des Événements</h3>
                            <p className="text-[10px] text-slate-500">Real-time Security Events • {stats.total} au total</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-slate-400">Critique:</span>
                            <span className="font-bold text-red-400">{stats.critical}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            <span className="text-slate-400">Élevé:</span>
                            <span className="font-bold text-orange-400">{stats.high}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-slate-400">Nouveau:</span>
                            <span className="font-bold text-cyan-400">{stats.new}</span>
                        </span>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher IP, Service, Type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-0.5">
                        {timeRanges.map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2 py-1 text-[10px] rounded transition ${timeRange === range
                                    ? "bg-cyan-500/20 text-cyan-400"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Severity Filter */}
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-2 py-1.5 text-[10px] text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                    >
                        {severities.map(sev => (
                            <option key={sev} value={sev}>{sev === "All" ? "Toutes Sévérités" : sev}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-2 py-1.5 text-[10px] text-slate-300 focus:border-cyan-500/50 focus:outline-none"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status === "All" ? "Tous Statuts" : status}</option>
                        ))}
                    </select>

                    {/* Actions */}
                    <button
                        onClick={handleRefresh}
                        className={`rounded-lg border border-slate-700/50 bg-slate-800/50 p-1.5 text-slate-400 hover:text-cyan-400 transition ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-[10px] text-cyan-400 hover:bg-cyan-500/20 transition"
                    >
                        <Download className="h-3 w-3" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-800/50 text-[9px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
                        <tr>
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">
                                <Clock className="inline h-3 w-3 mr-1" />
                                Heure
                            </th>
                            <th className="px-3 py-2">IP Source</th>
                            <th className="px-3 py-2">IP Dest</th>
                            <th className="px-3 py-2">
                                <Globe className="inline h-3 w-3 mr-1" />
                                Geo
                            </th>
                            <th className="px-3 py-2">
                                <Server className="inline h-3 w-3 mr-1" />
                                Service
                            </th>
                            <th className="px-3 py-2">Type d'Événement</th>
                            <th className="px-3 py-2">Sévérité</th>
                            <th className="px-3 py-2">Statut</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!mounted ? (
                            <tr>
                                <td colSpan={10} className="px-3 py-8 text-center text-slate-500 text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Chargement des événements...
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {filteredEvents.slice(0, 15).map((event, idx) => {
                                    const sevKey = event.severity ? (event.severity.charAt(0).toUpperCase() + event.severity.slice(1).toLowerCase()) : "Low";
                                    const statKey = event.status ? (event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase()) : "New";

                                    const sevColors = severityColors[sevKey] || severityColors.Low;
                                    const statColors = statusColors[statKey] || statusColors.New;

                                    return (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className={`border-t border-slate-800/30 transition cursor-pointer ${event.severity === "Critical" ? "bg-red-500/5 hover:bg-red-500/10" :
                                                event.status === "New" ? "bg-cyan-500/5 hover:bg-cyan-500/10" :
                                                    "hover:bg-slate-800/30"
                                                }`}
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                onEventClick?.(event);
                                            }}
                                        >
                                            <td className="px-3 py-2 font-mono text-slate-500">{event.id}</td>
                                            <td className="px-3 py-2 font-mono text-slate-400">{event.time}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-mono text-cyan-400">{event.srcIp}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleCopyIp(event.srcIp, event.id + '-src'); }}
                                                        className="opacity-0 group-hover:opacity-100 hover:text-cyan-300"
                                                    >
                                                        {copiedId === event.id + '-src' ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-slate-400">{event.dstIp}</td>
                                            <td className="px-3 py-2">
                                                <span title={event.country}>{event.countryFlag} {event.country}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-slate-300">{event.service}</span>
                                                <span className="text-slate-600 ml-1">:{event.port}</span>
                                            </td>
                                            <td className="px-3 py-2 text-slate-300 max-w-[200px] truncate">{event.eventType}</td>
                                            <td className="px-3 py-2">
                                                <span className={`rounded border px-1.5 py-0.5 text-[9px] font-medium ${sevColors.bg} ${sevColors.text} ${sevColors.border}`}>
                                                    {event.severity}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`rounded px-1.5 py-0.5 text-[9px] ${statColors.bg} ${statColors.text}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button className="text-slate-500 hover:text-cyan-400 transition">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800/50 px-3 py-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Affichage {Math.min(filteredEvents.length, 15)} sur {filteredEvents.length} événements</span>
                <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    {autoRefresh ? "Auto-refresh actif" : "Actualisation manuelle"}
                </span>
            </div>
        </section>
    );
}
