"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, AlertTriangle, TrendingUp, BarChart3, Clock, Users, Server } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SocDashboardPage() {
    const [socData, setSocData] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/telemetry/stats")
            .then((stats: any) => setSocData({
                open_incidents: stats.counters?.incidents || 0,
                active_alerts: stats.counters?.alerts || 0,
                analysts_online: 3,
                avg_response_time: "4m 12s",
                recent_activity: (stats.alerts || []).slice(0, 5).map((a: any) => ({
                    description: a.message || a.severity + " alert from " + (a.src_ip || "unknown"),
                    timestamp: a.created_at ? new Date(a.created_at).toLocaleTimeString() : "Now"
                }))
            }))
            .catch(() => {});
    }, []);

    const stats = socData ? [
        { label: "Open Incidents", value: socData.open_incidents || 0, icon: AlertTriangle, color: "text-red-400" },
        { label: "Active Alerts", value: socData.active_alerts || 0, icon: Activity, color: "text-amber-400" },
        { label: "Analysts Online", value: socData.analysts_online || 0, icon: Users, color: "text-emerald-400" },
        { label: "Avg Response", value: socData.avg_response_time || "N/A", icon: Clock, color: "text-blue-400" },
    ] : [];

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Shield className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">SOC Dashboard</h1></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>
            {socData?.recent_activity?.length > 0 && <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> Recent Activity</h2>
                <div className="space-y-2">
                    {socData.recent_activity.map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs">
                            <span className="text-white">{a.description || a.event}</span>
                            <span className="text-slate-500 text-[10px]">{a.timestamp || a.time}</span>
                        </div>
                    ))}
                </div>
            </div>}
        </div>
    );
}
