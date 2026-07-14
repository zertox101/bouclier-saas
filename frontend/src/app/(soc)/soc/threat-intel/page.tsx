"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Globe, Server, Activity, Hash, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ThreatIntelPage() {
    const [summary, setSummary] = useState<any>(null);
    const [feeds, setFeeds] = useState<any[]>([]);
    const [iocs, setIocs] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            apiClient("/api/threat-intel/summary").catch(() => null),
            apiClient("/api/threat-intel/feeds").catch(() => ({ feeds: [] } as any)),
            apiClient("/api/threat-intel/iocs").catch(() => ({ iocs: [] } as any)),
        ]).then(([s, f, i]) => {
            if (s) setSummary(s);
            setFeeds((f as any)?.feeds || []);
            setIocs((i as any)?.iocs || []);
        });
    }, []);

    const SeverityBadge = ({ severity }: { severity: string }) => {
        const colors: Record<string, string> = { critical: "bg-red-500/10 text-red-400 border-red-500/20", high: "bg-orange-500/10 text-orange-400 border-orange-500/20", medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", low: "bg-green-500/10 text-green-400 border-green-500/20" };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${colors[severity] || colors.low}`}>{severity}</span>;
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Shield className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Threat Intelligence</h1></div>
            {summary && <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[{ label: "Total IOCs", value: summary.total_iocs, icon: Hash, color: "text-blue-400" }, { label: "Active Feeds", value: summary.active_feeds, icon: Activity, color: "text-emerald-400" }, { label: "New Today", value: summary.new_today, icon: TrendingUp, color: "text-amber-400" }, { label: "Critical", value: summary.by_severity?.critical || 0, icon: AlertTriangle, color: "text-red-400" }, { label: "High", value: summary.by_severity?.high || 0, icon: AlertTriangle, color: "text-orange-400" }].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-amber-400" /> Recent IOCs</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {iocs.slice(0, 15).map((ioc, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs hover:bg-slate-800/50">
                                <div className="flex items-center gap-3"><SeverityBadge severity={ioc.severity} /><span className="text-[10px] font-mono text-slate-400">{ioc.type}</span><span className="font-mono text-white text-[11px]">{ioc.value}</span></div>
                                <span className="text-[10px] text-slate-500">{ioc.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-emerald-400" /> Intelligence Feeds</h2>
                    <div className="space-y-2">
                        {feeds.map((feed, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs">
                                <div><p className="text-white font-medium text-[11px]">{feed.name}</p><p className="text-[9px] text-slate-500">{feed.provider}</p></div>
                                <div className="text-right"><span className="text-[10px] text-emerald-400">{feed.total_iocs?.toLocaleString()} IOCs</span><p className="text-[9px] text-slate-500">{feed.confidence}% confidence</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
