"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Clock, Bell } from "lucide-react";
import { apiClient } from '@/lib/api-client';

export default function SocAlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        apiClient('/alerts')
            .then(d => setAlerts(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Bell className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">SOC Alerts</h1></div>
            <div className="grid gap-3">
                {(alerts.length > 0 ? alerts : []).slice(0, 20).map((alert, i) => (
                    <motion.div key={alert.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-4 h-4 ${alert.severity === "critical" ? "text-red-500" : alert.severity === "high" ? "text-orange-500" : "text-yellow-500"}`} />
                            <span className="text-sm font-bold text-white">{alert.title || alert.name || alert.rule_id || `Alert #${i + 1}`}</span>
                            <span className="text-[10px] text-slate-500 ml-auto">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{alert.description || alert.message || alert.summary || ""}</p>
                    </motion.div>
                ))}
                {alerts.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No alerts to display</p>}
            </div>
        </div>
    );
}
