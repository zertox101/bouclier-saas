"use client"

import { GlassCard } from "@/components/ui/GlassCard"
import { Shield, Lock, Eye, Zap, Database, Server } from "lucide-react"

export default function SecurityPage() {
    return (
        <div className="min-h-screen py-32 container mx-auto px-6">
            <div className="noise-bg" />

            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase">HARDENED <span className="text-violet-500">INFRA.</span></h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] italic">Built for Zero-Trust environments. Audited by the community.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { icon: Lock, title: "Data Isolation", desc: "Every organization operates in a distinct cryptographic enclave. Your data never touches shared buffers." },
                        { icon: Shield, title: "SOC-2 Ready", desc: "Native support for compliance mapping. Every dashboard action is cryptographically signed." },
                        { icon: Database, title: "Self-Hosted Control", desc: "Deploy via Docker/K8s on your own metal. Data never leaves your perimeter unless authorized." },
                        { icon: Zap, title: "Real-time Auditing", desc: "Live audit trail of every analyst action, tool run, and credential access attempt." },
                    ].map((item, i) => (
                        <GlassCard key={i} className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-500 shadow-xl">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest italic">{item.desc}</p>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard className="p-10 border-emerald-500/20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        Status: SECURE - ALL SYSTEMS OPERATIONAL
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Bouclier undergoes continuous security validation. Report vulnerabilities via our <span className="text-white underline cursor-pointer">Security Disclosure Program</span>.
                    </p>
                </GlassCard>
            </div>
        </div>
    )
}
