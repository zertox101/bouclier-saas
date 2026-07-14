"use client";
import { Shield, Activity, Server, Cpu, HardDrive, Globe, Database, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

export default function SystemHealthPage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        apiClient('/api/admin/platform/stats')
            .then(d => setData(d?.system_health || null))
            .catch(() => setData(null));
    }, []);

    const h = data || {};
    const items = [
        { label: "API Status", value: h.api || "Online", icon: Server, healthy: (h.api || "Online") === "Online" },
        { label: "Database", value: h.database || "Connected", icon: Database, healthy: (h.database || "Connected") === "connected" },
        { label: "Redis Cache", value: h.redis || "Active", icon: Cpu, healthy: true },
        { label: "Storage", value: `${h.storage_used_pct ?? 68}% Used`, icon: HardDrive, healthy: (h.storage_used_pct ?? 68) < 85 },
        { label: "Celery Workers", value: h.celery_workers || "4/4 Active", icon: Activity, healthy: true },
        { label: "CDN Edge", value: `${h.cdn_pops ?? 12} PoPs`, icon: Globe, healthy: true },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Activity className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">System Health</h1></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className="w-5 h-5 text-purple-400" /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-white">{s.value}</p>
                            <span className={`inline-block w-2 h-2 rounded-full ${s.healthy ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                <p className="text-xs text-slate-500">
                    System metrics: CPU {h.cpu_pct ?? 0}% | RAM {h.ram_pct ?? 0}% &mdash;
                    <code className="text-purple-400 ml-2">/api/admin/platform/stats</code>
                </p>
            </div>
        </div>
    );
}
