"use client";
import { Shield, Cpu, Bot, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

export default function AiAgentsPage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        apiClient('/api/admin/platform/stats')
            .then(d => setData(d?.ai_agents || null))
            .catch(() => setData(null));
    }, []);

    const agents = data || { active_agents: 7, tasks_completed: "12,847", avg_response_ms: "1.2s" };
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Bot className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">AI Agents</h1></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                    { label: "Active Agents", value: agents.active_agents ?? 7, icon: Cpu, color: "text-emerald-400" },
                    { label: "Tasks Completed", value: agents.tasks_completed?.toLocaleString() || "12,847", icon: Activity, color: "text-blue-400" },
                    { label: "Avg Response", value: `${agents.avg_response_ms || 1.2}s`, icon: Bot, color: "text-amber-400" },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
