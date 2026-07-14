"use client";

import { useState, useEffect } from "react";
import { Search, Activity } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SocHuntingPage() {
    const [hunts, setHunts] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/soc-expert/summary").then((d: any) => {
            const alerts = d.latest_alerts || [];
            setHunts(alerts.slice(0, 20));
        }).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Search className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Threat Hunting</h1></div>
            <p className="text-xs text-slate-500">Proactive threat hunting across network telemetry and endpoint data.</p>
            <div className="grid gap-3">
                {hunts.map((h, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white">{h.title || h.rule_name || h.name || `Detection #${i + 1}`}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${h.severity === "Critical" || h.severity === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{h.severity || "info"}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{h.description || h.message || h.summary || h.rule_description || ""}</p>
                        <p className="text-[10px] text-slate-600 mt-1">MITRE: {h.mitre_id || h.mitre || "N/A"} | {h.time || h.timestamp || ""}</p>
                    </div>
                ))}
                {hunts.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No threat hunting results. Configure detection rules to get started.</p>}
            </div>
        </div>
    );
}
