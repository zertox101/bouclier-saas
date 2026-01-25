'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Search, Layout, Database } from 'lucide-react';

const FEATURES = [
    {
        icon: Shield,
        title: 'Unified SOC',
        desc: 'One dashboard to rule them all. Consolidate your security stack into a single interface.'
    },
    {
        icon: Database,
        title: 'Asset Discovery',
        desc: 'Automatic identification and risk assessment of all network assets in real-time.'
    },
    {
        icon: Zap,
        title: 'Instant Triage',
        desc: 'AI-assisted alert priorization and automated classification of incoming signals.'
    }
];

export function StartWithUs() {
    return (
        <section className="py-32 bg-bg-0 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="max-w-3xl mx-auto mb-20 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter"
                    >
                        Start with us. <br />
                        <span className="text-p-400">Scale with confidence.</span>
                    </motion.h2>
                    <p className="text-text-3 font-medium text-lg">
                        Bouclier helps you evolve your security posture at every step of your journey.
                    </p>
                </div>

                {/* The Central Interactive-looking Section */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Top Selectors - purely visual to match the Traefik look */}
                    <div className="flex justify-center gap-4 mb-12">
                        <div className="px-6 py-3 rounded-2xl bg-bg-2 border border-white/5 text-xs font-black text-text-3 uppercase tracking-widest flex items-center gap-2">
                            Deployment Type <Layout className="w-3 h-3" />
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-bg-2 border border-white/5 text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            Cloud Native <Database className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Diagram/Text */}
                        <div className="text-left space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white uppercase">Advanced Asset Intelligence</h3>
                                <p className="text-text-2 leading-relaxed">
                                    Our engine continuously maps your digital surface, identifying vulnerabilities before they become liabilities.
                                    Integrate with your existing CI/CD pipelines for automated security guardrails.
                                </p>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    'Real-time network map visualization',
                                    'Automated vulnerability scoring (CVSS v3.1)',
                                    'Integration with Nuclei and OWASP ZAP',
                                    'Secure multi-tenant architecture'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-text-3 font-bold uppercase tracking-wider">
                                        <div className="h-1.5 w-1.5 rounded-full bg-p-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <button className="px-8 py-4 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-p-400 hover:text-white transition-all">
                                Learn More About Assets
                            </button>
                        </div>

                        {/* Right: Technical Diagram Card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-p-500/20 rounded-[48px] blur-3xl group-hover:bg-p-500/30 transition-all pointer-events-none" />
                            <div className="relative bg-bg-2/50 backdrop-blur-2xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                                {/* Technical UI Simulation */}
                                <div className="w-full h-full border border-white/5 rounded-3xl bg-slate-950/40 p-6 flex flex-col gap-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-danger/50" />
                                            <div className="w-2 h-2 rounded-full bg-warning/50" />
                                            <div className="w-2 h-2 rounded-full bg-success/50" />
                                        </div>
                                        <div className="text-[10px] text-text-3 font-mono">BOUCLIER_ANALYSIS_VIEW</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="h-24 rounded-2xl bg-bg-2/80 border border-white/5 p-4 flex flex-col justify-between">
                                                <div className="h-1 w-8 bg-p-500/40 rounded-full" />
                                                <div className="h-2 w-full bg-white/5 rounded-full" />
                                                <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex-1 rounded-2xl bg-p-500/10 border border-p-500/20 p-6 flex items-center justify-center relative overflow-hidden group/inner">
                                        <div className="absolute inset-0 bg-gradient-to-br from-p-500/10 to-transparent" />
                                        <Shield className="w-20 h-20 text-p-400 animate-float" />

                                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                            <span className="text-[8px] font-black text-success uppercase tracking-widest">Active Scan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Grid Below */}
                <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">
                    {FEATURES.map((feat, i) => (
                        <div key={i} className="text-left p-10 rounded-[40px] bg-bg-2/30 border border-white/5 hover:border-p-500/20 transition-all group">
                            <div className="mb-6 h-12 w-12 rounded-2xl bg-p-500/10 border border-p-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <feat.icon className="w-6 h-6 text-p-400" />
                            </div>
                            <h4 className="text-lg font-black text-white uppercase tracking-wider mb-4">{feat.title}</h4>
                            <p className="text-sm text-text-2 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
