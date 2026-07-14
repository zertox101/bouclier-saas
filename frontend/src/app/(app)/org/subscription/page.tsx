"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgSubscriptionPage() {
    const [sub, setSub] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/org/subscription").then(setSub).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><CreditCard className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Subscription</h1></div>
            {sub && (
                <div className="grid gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex items-center gap-4">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <div><p className="text-sm font-bold text-white capitalize">{sub.plan} Plan</p><p className="text-[10px] text-slate-500 capitalize">{sub.subscription_status}</p></div>
                    </div>
                    {sub.stripe_customer_id && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 flex items-center gap-4">
                            <DollarSign className="w-5 h-5 text-slate-500" />
                            <div><p className="text-sm font-bold text-white">Stripe Customer</p><p className="text-[10px] font-mono text-slate-500">{sub.stripe_customer_id}</p></div>
                        </div>
                    )}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <p className="text-[10px] text-slate-500">Manage billing via Stripe dashboard or contact support to change plans.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
