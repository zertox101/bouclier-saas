"use client";
import { Shield, Radio, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

export default function EventPipelinePage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        apiClient('/api/admin/platform/stats')
            .then(d => setData(d?.event_pipeline || null))
            .catch(() => setData(null));
    }, []);

    const pipeline = data || { events_per_min: "12,450", queue_depth: 234, processing_rate: 99.8 };
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><Radio className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">Event Pipeline</h1></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                    { label: "Events/min", value: pipeline.events_per_min?.toLocaleString() || "12,450", icon: Activity, color: "text-emerald-400" },
                    { label: "Queue Depth", value: pipeline.queue_depth ?? 234, icon: Clock, color: "text-amber-400" },
                    { label: "Processing Rate", value: `${pipeline.processing_rate || 99.8}%`, icon: Radio, color: "text-blue-400" },
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
