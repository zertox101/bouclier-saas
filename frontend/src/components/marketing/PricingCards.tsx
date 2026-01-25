"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Starter",
        price: "0",
        description: "Perfect for home labs and security enthusiasts.",
        features: ["Max 5 nodes", "1 hour log retention", "Standard 2D Threat Map", "Basic Community AI"],
        not: ["Network Packet Inspection", "3D Globe Visualization", "Automated Remediation", "Priority Support"],
        popular: false,
        cta: "Join Community",
    },
    {
        name: "Pro",
        price: "49",
        description: "Advanced defense for small businesses and MSSPs.",
        features: ["Unlimited nodes", "30 days log retention", "3D Globe Map + 2D", "Sentinel AI Expert", "Network Packet Inspection"],
        not: ["Dedicated Instance", "24/7 SLA Support"],
        popular: true,
        cta: "Start Free Trial",
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "Full compliance and power for large-scale SOCs.",
        features: ["Private Cloud Deployment", "Unlimited log retention", "Custom SIEM Integration", "Dedicated Security Engineer", "24/7 Phone Support", "SAML SSO"],
        not: [],
        popular: false,
        cta: "Contact Sales",
    },
];

export default function PricingCards() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl font-black tracking-tighter text-nokod-black md:text-6xl">Simple, Transparent <br /><span className="text-slate-400">Pricing.</span></h2>
                    <p className="mt-6 text-slate-500 font-medium text-lg">Scale your defense from home lab to Global SOC.</p>

                    <div className="mt-10 flex items-center justify-center gap-4">
                        <span className={cn("text-xs font-bold uppercase tracking-widest", !isAnnual ? "text-nokod-black" : "text-slate-400")}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative h-7 w-12 rounded-full bg-slate-100 transition-colors hover:bg-slate-200 shadow-inner"
                        >
                            <div className={cn("absolute top-1 h-5 w-5 rounded-full bg-nokod-black transition-all", isAnnual ? "left-6" : "left-1")} />
                        </button>
                        <span className={cn("text-xs font-bold uppercase tracking-widest", isAnnual ? "text-nokod-black" : "text-slate-400")}>Yearly <span className="text-nokod-purple">(-20%)</span></span>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={cn(
                                "relative flex flex-col rounded-5xl p-10 transition-all",
                                tier.popular
                                    ? "bg-white border-2 border-nokod-purple/50 shadow-[0_24px_48px_-12px_rgba(124,58,237,0.15)] scale-105 z-10"
                                    : "bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nokod-purple px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-2xl font-black text-nokod-black tracking-tight">{tier.name}</h3>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-5xl font-black text-nokod-black tracking-tighter">
                                    {tier.price === "Custom" ? "" : "$"}
                                    {tier.price}
                                </span>
                                {tier.price !== "Custom" && <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/mo</span>}
                            </div>
                            <p className="mt-6 text-sm font-medium text-slate-500 leading-relaxed h-12">
                                {tier.description}
                            </p>

                            <div className="mt-10 flex-1 space-y-5">
                                {tier.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-4">
                                        <div className="h-5 w-5 rounded-full bg-nokod-purple/10 flex items-center justify-center shrink-0">
                                            <Check className="h-3 w-3 text-nokod-purple" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">{feature}</span>
                                    </div>
                                ))}
                                {tier.not.map((feature) => (
                                    <div key={feature} className="flex items-center gap-4 opacity-40">
                                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <X className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-400 line-through">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={cn(
                                    "mt-12 w-full rounded-2xl py-5 text-sm font-black uppercase tracking-widest transition-all",
                                    tier.popular
                                        ? "bg-nokod-black text-white shadow-xl shadow-black/10 hover:bg-slate-800"
                                        : "bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold"
                                )}
                            >
                                {tier.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
