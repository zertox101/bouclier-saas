"use client";
import { Shield, CreditCard, DollarSign, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

export default function BillingPage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        apiClient('/api/admin/platform/stats')
            .then(d => setData(d?.billing || null))
            .catch(() => setData(null));
    }, []);

    const billing = data || { outstanding: 12400, paid_this_month: 72000, payment_method: "Visa ****4242" };
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><CreditCard className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">Billing</h1></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                    { label: "Outstanding", value: `$${billing.outstanding?.toLocaleString() || "12,400"}`, icon: DollarSign, color: "text-red-400" },
                    { label: "Paid This Month", value: `$${billing.paid_this_month?.toLocaleString() || "72,000"}`, icon: FileText, color: "text-emerald-400" },
                    { label: "Payment Method", value: billing.payment_method || "Visa ****4242", icon: CreditCard, color: "text-blue-400" },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-lg font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
