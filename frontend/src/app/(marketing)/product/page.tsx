"use client";

import { Monitor, Cpu, Database, Zap, Shield, Terminal, Activity, Lock, Globe, Server, Layers, Network } from "lucide-react";
import Link from "next/link";

const productFeatures = [
    {
        title: "Neural Packet Inspection",
        subtitle: "Unmatched Visibility",
        details: "Analyze layer 2 through layer 7 traffic with real-time protocol dissection. Our engine handles TCP, UDP, QUIC, and HTTP/3 with nanosecond precision.",
        icon: Monitor,
        tags: ["0.01ms Latency", "10Gbps+ Ready"],
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
    },
    {
        title: "Sentinel AI Core",
        subtitle: "Native Intelligence",
        details: "Built-in Large Language Model specialized in cyber-threat intelligence. Sentinel uses RAG to ground its analysis on your actual telemetry.",
        icon: Cpu,
        tags: ["Private Models", "Context-Aware"],
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        title: "Global Command Fleet",
        subtitle: "Distributed Sniffers",
        details: "Deploy lightweight, air-gapped sniffers across your entire infrastructure. Manage the entire fleet from a single command node.",
        icon: Zap,
        tags: ["Kubernetes Native", "Auto-Discovery"],
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    },
    {
        title: "Immutable Nexus Store",
        subtitle: "Evidence Retention",
        details: "Tamper-proof storage for all security events. Built for compliance-heavy environments, every event is cryptographically signed.",
        icon: Database,
        tags: ["SOC2 Ready", "WORM Storage"],
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    }
];

export default function ProductPage() {
    return (
        <div className="min-h-screen bg-[#05040B] text-white font-sans selection:bg-indigo-500/30">

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-8 backdrop-blur-md">
                        <Shield className="h-3 w-3 text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">The Blue Team Platform</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-[0.9]">
                        Unified <br />
                        <span className="text-indigo-400">Cyber Defense.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed mb-12">
                        We've consolidated the fragmented security landscape into a cohesive, high-performance platform.
                        Built for the modern enterprise, designed for the executive investigator.
                    </p>

                    <div className="flex justify-center gap-4">
                        <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            SOC Maturity: v4.2
                        </div>
                        <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Neural Sync: Enabled
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Visual */}
            <section className="container mx-auto px-6 mb-32">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50" />

                    <div className="bg-[#0A0A12] rounded-[1.8rem] p-12 relative overflow-hidden border border-white/5">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tighter mb-6 text-white">
                                    The command node <br />
                                    <span className="text-slate-500">for your fleet.</span>
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Single-pane-of-glass visibility across hybrid environments. From ephemeral containers to legacy on-prem workloads, Bouclier orchestrates detection and response with millisecond precision.
                                </p>
                                <div className="space-y-4">
                                    {["Neural Analysis engine", "Global Edge distribution", "Immutable audit logging"].map(item => (
                                        <div key={item} className="flex items-center gap-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Terminal Visual */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 font-mono text-xs text-slate-300 shadow-2xl relative z-10">
                                    <div className="flex gap-2 mb-4 p-2 border-b border-white/5">
                                        <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-emerald-400">[+] Sentinel Core Online</div>
                                        <div>[*] Listening on port 8005</div>
                                        <div className="text-indigo-400">[*] Analyzing traffic patterns...</div>
                                        <div className="pl-4 text-slate-500">→ Neural Net: Active (Confidence 99.4%)</div>
                                        <div className="pl-4 text-slate-500">→ Inspecting 10GB/s stream</div>
                                        <br />
                                        <div className="text-rose-400 animate-pulse">[!] ANOMALY DETECTED: AS-9023</div>
                                        <div className="text-slate-400">[*] Mitigating risk pulse...</div>
                                        <div className="text-emerald-400">[+] Threat Neutralized</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-6">
                    {productFeatures.map((f, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                            <div className={`h-12 w-12 rounded-lg ${f.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                                <f.icon className={`h-6 w-6 ${f.color}`} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block ${f.color} opacity-80`}>{f.subtitle}</span>
                            <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">{f.details}</p>
                            <div className="flex flex-wrap gap-2">
                                {f.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Integrations */}
            <section className="py-32 bg-black/20 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                        Elastic <br /><span className="text-slate-600">Integrations.</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-16">
                        Bouclier acts as the neural tissue between your existing security stack. Native connectivity with every major cloud, SIEM, and ticketing platform.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-50">
                        {["AWS", "Azure", "GCP", "Splunk", "Slack", "Jira", "PagerDuty", "Crowdstrike", "Elastic", "Docker", "K8s", "Sentinel"].map(tool => (
                            <div key={tool} className="h-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-default">
                                {tool}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />

                        <h2 className="text-5xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Ready to evolve?
                        </h2>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/overview" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                DEPLOY NOW
                            </Link>
                            <Link href="/contact" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition">
                                TALK TO SALES
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
