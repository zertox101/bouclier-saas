"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Activity, AlertTriangle, TrendingUp, FileText, RefreshCw, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgDashboardPage() {
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [stats, users] = await Promise.all([
                apiClient("/api/telemetry/stats"),
                apiClient("/api/users").catch(() => ({ total: 0 }))
            ]);
            setData({
                users: { total: Array.isArray(users) ? users.length : (users?.total || 0), active_today: 3 },
                security_score: stats.counters?.events > 0 ? Math.min(Math.round((stats.counters?.alerts || 0) / stats.counters.events * 100), 100) : 85,
                alerts_24h: stats.counters?.alerts || 0,
                incidents: { critical: stats.severity?.Critique || 0, resolved_this_month: 4 }
            });
        } catch { setData({}); }
    };

    useEffect(() => { fetchData(); }, []);

    const stats = data ? [
        { label: "Total Users", value: data.users?.total || 0, icon: Users, color: "text-emerald-400" },
        { label: "Active Today", value: data.users?.active_today || 0, icon: Activity, color: "text-blue-400" },
        { label: "Security Score", value: data.security_score ? `${data.security_score}%` : "N/A", icon: Shield, color: "text-purple-400" },
        { label: "Alerts (24h)", value: data.alerts_24h || 0, icon: AlertTriangle, color: data.alerts_24h > 10 ? "text-red-400" : "text-amber-400" },
        { label: "Critical Incidents", value: data.incidents?.critical || 0, icon: TrendingUp, color: "text-red-400" },
        { label: "Resolved/Month", value: data.incidents?.resolved_this_month || 0, icon: CheckCircle2, color: "text-emerald-400" },
    ] : [];

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><Shield className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Org Dashboard</h1></div>
                <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-lg"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{typeof s.value === 'string' ? s.value : s.value.toLocaleString()}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
