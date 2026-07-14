"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Shield } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SocAnalysisPage() {
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            apiClient("/api/threat-analysis/stats/summary").catch(() => null),
            apiClient("/api/soc-expert/summary").catch(() => null),
        ]).then(([threat, expert]) => setSummary({ ...((threat as any) || {}), ...((expert as any) || {}) }));
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><BarChart3 className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Threat Analysis</h1></div>
            {summary && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ label: "Total Events", value: summary.total_events || summary.events_analyzed || 0, icon: Activity, color: "text-blue-400" },
                  { label: "Threats Blocked", value: summary.threats_blocked || summary.blocked || 0, icon: Shield, color: "text-emerald-400" },
                  { label: "Avg Risk Score", value: summary.avg_risk_score || summary.risk_score || "N/A", icon: TrendingUp, color: "text-amber-400" },
                  { label: "Active Campaigns", value: summary.active_campaigns || summary.campaigns || 0, icon: Activity, color: "text-red-400" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>}
            {!summary && <p className="text-xs text-slate-500 text-center py-8">Loading analysis data...</p>}
        </div>
    );
}
