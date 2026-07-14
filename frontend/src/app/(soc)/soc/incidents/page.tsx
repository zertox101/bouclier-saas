"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Clock, Filter } from "lucide-react";
import { apiClient } from '@/lib/api-client';

export default function SocIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);

    useEffect(() => {
        apiClient('/api/incidents/')
            .then(d => setIncidents(d || []))
            .catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><Shield className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Incidents</h1></div>
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider">New Incident</button>
            </div>
            <div className="grid gap-3">
                {incidents.map((inc, i) => (
                    <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-amber-500/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${inc.severity === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : inc.severity === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : inc.severity === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>{inc.severity}</span>
                                    <span className="text-sm font-bold text-white">{inc.title}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${inc.status === "open" ? "bg-red-500/10 text-red-400 border-red-500/20" : inc.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{inc.status}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{inc.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(inc.created_at || inc.detected_at).toLocaleDateString()}</span>
                                    <span>Assigned: {inc.assigned_to || "Unassigned"}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {incidents.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No incidents found</p>}
            </div>
        </div>
    );
}
