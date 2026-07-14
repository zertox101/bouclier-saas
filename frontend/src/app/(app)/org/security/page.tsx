"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Clock, Server, Globe } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgSecurityPage() {
    const [incidents, setIncidents] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/org/security").then(d => setIncidents((d as any)?.incidents || [])).catch(() => {});
    }, []);

    const severityColor = (s: string) => {
        if (s === "critical") return "bg-red-500/10 text-red-400 border-red-500/20";
        if (s === "high") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (s === "medium") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Shield className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Security Incidents</h1></div>
            <div className="grid gap-3">
                {incidents.map((inc, i) => (
                    <motion.div key={inc.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-white">{inc.title}</h3>
                                    <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase ${severityColor(inc.severity)}`}>{inc.severity}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-[9px] text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(inc.detected_at).toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{inc.source_ip}</span>
                                    <span className="flex items-center gap-1"><Server className="w-3 h-3" />{inc.asset}</span>
                                    <span className={`uppercase ${inc.status === "open" ? "text-red-400" : inc.status === "investigating" ? "text-amber-400" : "text-emerald-400"}`}>{inc.status}</span>
                                </div>
                            </div>
                            <AlertTriangle className={`w-4 h-4 ${inc.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                        </div>
                    </motion.div>
                ))}
                {incidents.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No security incidents found</p>}
            </div>
        </div>
    );
}
