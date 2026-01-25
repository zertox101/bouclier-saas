import { ArrowRight, Check, Monitor, Cpu, Database, Zap, Shield, Globe, Terminal, Activity, Lock, Eye } from "lucide-react";
import Link from "next/link";

const productFeatures = [
    {
        title: "Neural Packet Inspection",
        subtitle: "Unmatched Visibility",
        details: "Analyze layer 2 through layer 7 traffic with real-time protocol dissection. Our engine handles TCP, UDP, QUIC, and HTTP/3 with nanosecond precision, providing a Wireshark-grade experience directly in your browser.",
        icon: Monitor,
        tags: ["0.01ms Latency", "10Gbps+ Ready", "Multi-protocol"],
        accent: "text-cyan-400",
        bg: "bg-cyan-500/5"
    },
    {
        title: "Sentinel AI Core",
        subtitle: "Native Intelligence",
        details: "Built-in Large Language Model specialized in cyber-threat intelligence. Unlike generic AI, Sentinel uses RAG to ground its analysis on your actual telemetry, providing prioritized remediation steps.",
        icon: Cpu,
        tags: ["Private Models", "Context-Aware", "Zero-Hallucination"],
        accent: "text-purple-400",
        bg: "bg-purple-500/5"
    },
    {
        title: "Global Command Fleet",
        subtitle: "Distributed Sniffers",
        details: "Deploy lightweight, air-gapped sniffers across your entire infrastructure. Manage the entire fleet from a single command node with centralized updates and millisecond sync.",
        icon: Zap,
        tags: ["Kubernetes Native", "Low Overhead", "Auto-Discovery"],
        accent: "text-amber-400",
        bg: "bg-amber-500/5"
    },
    {
        title: "Immutable Nexus store",
        subtitle: "Evidence Retention",
        details: "Tamper-proof storage for all security events. Built for compliance-heavy environments, every event is cryptographiclly signed and indexed for sub-second retrieval.",
        icon: Database,
        tags: ["SOC2 Ready", "WORM Storage", "Instant Search"],
        accent: "text-blue-400",
        bg: "bg-blue-500/5"
    }
];

export default function ProductPage() {
    return (
        <div className="bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="pt-56 pb-32 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[800px] w-full bg-gradient-to-b from-slate-50 to-transparent opacity-60" />
                <div className="absolute top-48 left-1/4 w-96 h-96 bg-nokod-purple/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute top-48 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -z-10" />

                <div className="container mx-auto px-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 mb-10 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Shield className="h-3 w-3 text-nokod-black" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">The Blue Team Platform</span>
                    </div>
                    <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-tighter text-nokod-black md:text-8xl lg:text-9xl leading-[0.85] mb-12">
                        Unified <br />
                        <span className="text-slate-400">Cyber Defense.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-500 md:text-xl font-medium leading-relaxed">
                        We've consolidated the fragmented security landscape into a cohesive, high-performance platform. Built for the modern enterprise, designed for the executive investigator.
                    </p>

                    <div className="mt-16 flex justify-center gap-4">
                        <div className="px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">SOC Maturity: v4.2</div>
                        <div className="px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Sync: Enabled</div>
                    </div>
                </div>
            </section>

            {/* Platform Visual Card */}
            <div className="container mx-auto px-6 -mt-10 mb-40">
                <div className="bg-slate-900 rounded-[3.5rem] p-4 shadow-3xl shadow-slate-200 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-nokod-purple/10 to-transparent opacity-50" />
                    <div className="bg-slate-950 rounded-[3rem] p-12 lg:p-24 border border-white/5 relative overflow-hidden">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 leading-none">The command <br />node for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">your fleet.</span></h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                                    Single-pane-of-glass visibility across hybrid environments. From ephemeral containers to legacy on-prem workloads, Bouclier orchestrates detection and response with millisecond precision.
                                </p>
                                <div className="space-y-4">
                                    {["Neural Analysis engine", "Global Edge distribution", "Immutable audit logging"].map(item => (
                                        <div key={item} className="flex items-center gap-4">
                                            <div className="h-2 w-2 rounded-full bg-cyan-400" />
                                            <span className="text-sm font-black text-white uppercase tracking-widest">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full" />
                                <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/10 p-8 rotate-2 hover:rotate-0 transition-transform duration-700">
                                    <div className="aspect-video bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                        <Terminal className="text-white/10 w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        <div className="text-cyan-400 font-mono text-[10px] uppercase font-black tracking-widest p-4">
                                            [+] Sentinel Core Online <br />
                                            [*] Listening on port 8005 <br />
                                            [*] Analyzing traffic patterns... <br />
                                            [!] Signal Detected: AS-9023 <br />
                                            [+] Mitigating risk pulse...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <section className="container mx-auto px-6 py-40">
                <div className="grid lg:grid-cols-2 gap-8">
                    {productFeatures.map((f) => (
                        <div key={f.title} className="p-12 lg:p-20 rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-all group">
                            <div className={`h-20 w-20 rounded-3xl ${f.bg} mb-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                <f.icon className={`h-10 w-10 ${f.accent}`} />
                            </div>
                            <div>
                                <span className={`text-xs font-black uppercase tracking-[0.3em] mb-4 block ${f.accent}`}>{f.subtitle}</span>
                                <h3 className="text-4xl font-black text-nokod-black mb-8 tracking-tighter leading-none">{f.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-12 text-lg">{f.details}</p>

                                <div className="flex flex-wrap gap-3">
                                    {f.tags.map(tag => (
                                        <span key={tag} className="px-5 py-2 rounded-2xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Ecosystem - Dark Integration */}
            <section className="py-48 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-none">Elastic <br /><span className="text-slate-500">Integrations.</span></h2>
                        <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed">
                            Bouclier acts as the neural tissue between your existing security stack. Native connectivity with every major cloud, SIEM, and ticketing platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {["AWS", "Azure", "GCP", "Splunk", "Slack", "Jira", "PagerDuty", "SentinelOne", "Crowdstrike", "Elastic", "Docker", "Kubernetes"].map(tool => (
                            <div key={tool} className="h-24 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group hover:bg-white/10 transition-all">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{tool}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40">
                <div className="container mx-auto px-6">
                    <div className="bg-slate-900 rounded-[5rem] p-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-nokod-purple/20 blur-[150px] rounded-full" />
                        <div className="bg-slate-950 rounded-[4.9rem] py-32 px-12 text-center text-white border border-white/5">
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 leading-[0.85]">Evolve your <br /><span className="text-slate-500">perimeter now.</span></h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                <Link
                                    href="/overview"
                                    className="h-20 px-16 flex items-center justify-center rounded-3xl bg-white text-nokod-black text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-white/5 uppercase tracking-widest"
                                >
                                    Deploy Now
                                </Link>
                                <Link
                                    href="/contact"
                                    className="h-20 px-16 flex items-center justify-center rounded-3xl bg-white/5 text-white border border-white/10 text-lg font-black hover:bg-white/10 transition-all uppercase tracking-widest"
                                >
                                    Contact OPS
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
