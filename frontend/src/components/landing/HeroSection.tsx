'use client';

import { ArrowRight, Shield, Terminal, Zap, Radar, Lock, Scan, Eye, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingDiagram } from './LandingDiagram';

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-56 md:pb-40 overflow-hidden">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-40" />

            {/* Animated Scanning Lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[rgb(var(--neon-1))] to-transparent animate-scan opacity-30" />
                <div className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-[rgb(var(--neon-2))] to-transparent animate-scan opacity-20" style={{ left: '30%', animationDelay: '1s' }} />
            </div>

            {/* Ambient Atmosphere - Cyber Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] bg-gradient-to-b from-[rgb(var(--neon-1))]/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[rgb(var(--neon-1))]/15 rounded-full blur-[200px] pointer-events-none animate-pulse" />
            <div className="absolute top-[20%] right-0 w-[600px] h-[400px] bg-[rgb(var(--neon-2))]/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[rgb(var(--neon-3))]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                {/* Tactical Status Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-[rgb(var(--bg-2))]/60 border border-[rgb(var(--neon-1))]/20 backdrop-blur-2xl mb-16 shadow-cyber-glow"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[rgb(var(--neon-1))] animate-pulse shadow-[0_0_12px_rgba(0,255,170,0.8)]" />
                        <span className="text-[9px] font-black text-[rgb(var(--text-2))] uppercase tracking-[0.3em]">
                            Systems Status: <span className="text-[rgb(var(--neon-1))]">Operational</span>
                        </span>
                    </div>
                    <div className="h-4 w-px bg-[rgb(var(--neon-1))]/20" />
                    <span className="text-[9px] font-black text-[rgb(var(--neon-2))] uppercase tracking-[0.2em] flex items-center gap-1">
                        <Radar className="w-3 h-3" />
                        v2.5.0 CyberDetect
                    </span>
                </motion.div>

                {/* Refined Headline Hierarchy */}
                <div className="max-w-7xl mx-auto space-y-10 mb-20 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        {/* Glow behind text */}
                        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                            <div className="w-[600px] h-[200px] bg-[rgb(var(--neon-1))]/20 blur-[80px] rounded-full" />
                        </div>

                        <h1 className="relative text-[clamp(3rem,8vw,10rem)] font-bold leading-[0.9] tracking-tighter">
                            <span className="text-white">THE </span>
                            <span className="bg-gradient-to-r from-[rgb(var(--neon-1))] via-[rgb(var(--neon-2))] to-[rgb(var(--neon-1))] bg-clip-text text-transparent italic">
                                FUTURE
                            </span>
                            <span className="text-white"> OF</span>
                            <br />
                            <span className="text-white">CYBER</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">DEFENSE</span>
                            <span className="text-[rgb(var(--neon-1))]">.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-lg md:text-xl text-[rgb(var(--text-2))] max-w-3xl mx-auto leading-relaxed"
                    >
                        Intelligence-driven security operations for the modern enterprise.
                        <span className="text-[rgb(var(--neon-1))]"> Autonomous threat detection</span>, real-time response pipelines, and
                        sovereign data governance for the global digital frontier.
                    </motion.p>
                </div>

                {/* Tactical Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 mb-32"
                >
                    <Link href="/dashboard">
                        <button className="btn-cyber h-16 px-12 group">
                            <span className="flex items-center gap-3">
                                <Scan className="w-5 h-5" />
                                Launch Operations Hub
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>
                    <Link href="/docs">
                        <button className="btn-cyber-outline h-16 px-12 group">
                            <span className="flex items-center gap-3">
                                <Terminal className="w-4 h-4" />
                                View Documentation
                            </span>
                        </button>
                    </Link>
                </motion.div>

                {/* Central Intelligence Diagram */}
                <div className="relative max-w-6xl mx-auto">
                    <div className="absolute -inset-20 bg-[rgb(var(--neon-1))]/10 rounded-full blur-[140px] pointer-events-none opacity-40 animate-pulse" />
                    <div className="cyber-card border-[rgb(var(--neon-1))]/20">
                        <LandingDiagram />
                    </div>
                </div>

                {/* Tactical Features Grid */}
                <div className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {[
                        {
                            icon: Shield,
                            title: 'Threat Detection',
                            desc: 'AI-powered threat intelligence with real-time behavioral analysis and zero-day vulnerability scanning.',
                            tag: 'DETECT'
                        },
                        {
                            icon: Activity,
                            title: 'Live Monitoring',
                            desc: 'Sub-millisecond telemetry streams and autonomous response protocols for immediate threat mitigation.',
                            tag: 'MONITOR'
                        },
                        {
                            icon: Lock,
                            title: 'Secure Response',
                            desc: 'Automated incident response with containment, eradication, and recovery orchestration.',
                            tag: 'RESPOND'
                        },
                    ].map((feat, i) => (
                        <motion.div
                            key={feat.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.8 }}
                            className="premium-card p-10 text-left group relative overflow-hidden"
                        >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--neon-1))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon */}
                            <div className="relative h-16 w-16 rounded-2xl bg-[rgb(var(--neon-1))]/10 border border-[rgb(var(--neon-1))]/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <feat.icon className="h-8 w-8 text-[rgb(var(--neon-1))] group-hover:drop-shadow-[0_0_12px_rgba(0,255,170,0.8)]" />
                                <div className="absolute inset-0 bg-[rgb(var(--neon-1))]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Tag */}
                            <div className="section-label mb-6">
                                0x0{i + 1} // {feat.tag}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-white group-hover:text-[rgb(var(--neon-1))] transition-colors">
                                {feat.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[rgb(var(--text-2))] leading-relaxed text-sm">
                                {feat.desc}
                            </p>

                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgb(var(--neon-1))]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
