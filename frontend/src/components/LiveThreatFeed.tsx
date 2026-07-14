"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    AlertTriangle,
    Activity,
    Globe,
    Zap,
    TrendingUp,
    MapPin,
    Clock
} from "lucide-react";
import { format } from "date-fns";

interface ThreatEvent {
    id: string;
    timestamp: string;
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    sourceCountry: string;
    sourceIp: string;
    targetIp: string;
    attackType: string;
}

interface LiveThreatFeedProps {
    maxEvents?: number;
}

export default function LiveThreatFeed({ maxEvents = 20 }: LiveThreatFeedProps) {
    const [events, setEvents] = useState<ThreatEvent[]>([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

    // Connect to SSE stream
    useEffect(() => {
        const es = new EventSource(`${apiUrl}/api/telemetry/stream`);

        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);

                const newEvent: ThreatEvent = {
                    id: data.id || Date.now().toString(),
                    timestamp: data.timestamp || new Date().toISOString(),
                    type: data.type || "unknown",
                    severity: (data.severity?.toLowerCase() || "low") as any,
                    sourceCountry: data.data?.country || "Unknown",
                    sourceIp: data.data?.src_ip || "unknown",
                    targetIp: data.data?.dst_ip || "localhost",
                    attackType: data.data?.service || data.type || "Generic"
                };

                setEvents(prev => {
                    const next = [newEvent, ...prev];
                    return next.slice(0, maxEvents);
                });
            } catch (err) {
                console.error("Error parsing event:", err);
            }
        };

        es.onerror = () => {
            console.error("SSE connection error");
        };

        return () => es.close();
    }, [apiUrl, maxEvents]);

    // Statistics
    const stats = useMemo(() => {
        const total = events.length;
        const critical = events.filter(e => e.severity === "critical").length;
        const high = events.filter(e => e.severity === "high").length;
        const countries = new Set(events.map(e => e.sourceCountry)).size;

        // Attack type distribution
        const typeCount: Record<string, number> = {};
        events.forEach(e => {
            typeCount[e.attackType] = (typeCount[e.attackType] || 0) + 1;
        });

        const topTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Country distribution
        const countryCount: Record<string, number> = {};
        events.forEach(e => {
            countryCount[e.sourceCountry] = (countryCount[e.sourceCountry] || 0) + 1;
        });

        const topCountries = Object.entries(countryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return { total, critical, high, countries, topTypes, topCountries };
    }, [events]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            default: return "text-green-500 bg-green-500/10 border-green-500/20";
        }
    };

    return (
        <div className="h-full flex flex-col bg-bg-1/40 backdrop-blur-sm border border-border-1 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-bg-2/60 backdrop-blur-xl border-b border-border-1 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-text-1">
                                Live Threat Feed
                            </h3>
                            <p className="text-[10px] text-text-3 font-mono flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                REAL-TIME MONITORING
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-text-1 font-mono">{stats.total}</div>
                        <div className="text-[9px] text-text-3 uppercase tracking-widest">Events</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border-1">
                <div className="bg-bg-2/30 rounded-2xl p-4 border border-border-1">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-[9px] text-text-3 uppercase tracking-widest">Critical</span>
                    </div>
                    <div className="text-2xl font-black text-red-500 font-mono">{stats.critical}</div>
                </div>
                <div className="bg-bg-2/30 rounded-2xl p-4 border border-border-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-[9px] text-text-3 uppercase tracking-widest">High</span>
                    </div>
                    <div className="text-2xl font-black text-orange-500 font-mono">{stats.high}</div>
                </div>
                <div className="bg-bg-2/30 rounded-2xl p-4 border border-border-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-cyan-500" />
                        <span className="text-[9px] text-text-3 uppercase tracking-widest">Countries</span>
                    </div>
                    <div className="text-2xl font-black text-cyan-500 font-mono">{stats.countries}</div>
                </div>
            </div>

            {/* Top Attack Types */}
            <div className="px-6 py-4 border-b border-border-1">
                <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-3">
                    Top Attack Types
                </h4>
                <div className="space-y-2">
                    {stats.topTypes.map(([type, count], idx) => (
                        <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-black text-white">
                                    {idx + 1}
                                </div>
                                <span className="text-xs text-text-2 font-medium truncate max-w-[120px]">
                                    {type}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-text-1 font-mono">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Countries */}
            <div className="px-6 py-4 border-b border-border-1">
                <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-3">
                    Top Source Countries
                </h4>
                <div className="space-y-2">
                    {stats.topCountries.map(([country, count], idx) => (
                        <div key={country} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-cyan-500" />
                                <span className="text-xs text-text-2 font-medium truncate max-w-[120px]">
                                    {country}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-text-1 font-mono">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-3 sticky top-0 bg-bg-1/80 backdrop-blur-sm py-2">
                    Recent Events
                </h4>
                <AnimatePresence mode="popLayout">
                    {events.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-bg-2/30 rounded-xl p-3 border border-border-1 hover:border-cyan-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${getSeverityColor(event.severity)}`}>
                                        {event.severity}
                                    </div>
                                    <span className="text-[10px] text-text-3 font-mono flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(event.timestamp), "HH:mm:ss")}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-text-1 mb-1">{event.attackType}</div>
                            <div className="flex items-center gap-2 text-[10px] text-text-3">
                                <span className="font-mono">{event.sourceIp}</span>
                                <span>→</span>
                                <span className="font-mono">{event.targetIp}</span>
                            </div>
                            <div className="text-[10px] text-cyan-500 mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.sourceCountry}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30">
                        <Shield className="h-12 w-12 text-text-3 mb-3" />
                        <span className="text-xs text-text-3 uppercase tracking-widest">
                            Waiting for threats...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
