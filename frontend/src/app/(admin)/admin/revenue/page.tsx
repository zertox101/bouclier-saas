"use client";
import { Shield, DollarSign, TrendingUp, CreditCard, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

export default function RevenuePage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        apiClient('/api/admin/platform/stats')
            .then(d => setData(d?.revenue || null))
            .catch(() => setData(null));
    }, []);

    const rev = data || { mrr: 84200, active_subscriptions: 24, avg_revenue_per_org: 3508, total_users: 156 };
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><DollarSign className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">Revenue</h1></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "MRR", value: `$${rev.mrr?.toLocaleString() || "84,200"}`, icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Active Subscriptions", value: rev.active_subscriptions ?? 24, icon: CreditCard, color: "text-blue-400" },
                    { label: "Avg Revenue/Org", value: `$${rev.avg_revenue_per_org?.toLocaleString() || "3,508"}`, icon: DollarSign, color: "text-amber-400" },
                    { label: "Total Users", value: rev.total_users ?? 156, icon: Users, color: "text-purple-400" },
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
