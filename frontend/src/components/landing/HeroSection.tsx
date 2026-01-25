'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Terminal, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LandingDiagram } from './LandingDiagram';

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden zellige-pattern">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-p-600/10 via-bg-0 to-bg-0 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-p-500/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                {/* Badge Overlay */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-slate-950/50 border border-white/5 backdrop-blur-3xl mb-12 group cursor-default shadow-2xl"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-m-emerald animate-pulse shadow-[0_0_10px_#10B981]" />
                        <span className="text-[10px] md:text-[11px] font-black text-text-1 uppercase tracking-[0.4em]">
                            Morocco Cyber Readiness: <span className="text-m-emerald">Optimal</span>
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden md:block" />
                    <span className="text-[10px] md:text-[11px] font-black text-p-400 uppercase tracking-[0.3em] group-hover:text-white transition-colors cursor-pointer hidden md:block">
                        Bouclier Alpha v2.4.0 Deployment Live →
                    </span>
                </motion.div>

                {/* Main Headline */}
                <div className="max-w-5xl mx-auto space-y-8 mb-16 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.8] tracking-tighter uppercase italic"
                    >
                        THE <span className="text-p-400">UNYIELDING</span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-p-300 to-p-700">SHIELD</span>.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-text-2 max-w-3xl mx-auto leading-relaxed font-black uppercase tracking-widest opacity-60"
                    >
                        Unified SOC Intelligence + Threat Emulation. <br className="hidden md:block" />
                        Built for the Sovereign African Enterprise.
                    </motion.p>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 mb-24"
                >
                    <Link href="/dashboard">
                        <Button
                            size="lg"
                            className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-p-400 hover:text-black transition-all duration-300 font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:shadow-white/5"
                        >
                            Deploy Bouclier
                        </Button>
                    </Link>
                    <Link href="/docs">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-16 px-12 rounded-2xl border-white/5 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all duration-300 font-black uppercase tracking-[0.2em] text-xs"
                        >
                            Sowl Intelligence
                        </Button>
                    </Link>
                </motion.div>

                {/* The Central Visual Diagram */}
                <div className="relative">
                    <div className="absolute -inset-20 bg-p-500/10 rounded-full blur-[120px] pointer-events-none opacity-30" />
                    <LandingDiagram />
                </div>

                {/* Sub-features beneath diagram */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {[
                        { icon: Shield, title: 'Casablanca Core', desc: 'Sovereign data hosting with localized neural processing pipelines.' },
                        { icon: Zap, title: 'Tactical Agility', desc: 'Real-time telemetry streams synchronized at sub-millisecond rates.' },
                        { icon: Terminal, title: 'Sentinel AI', desc: 'Autonomous Darija-optimized analyst for localized threat assessment.' },
                    ].map((feat, i) => (
                        <motion.div
                            key={feat.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[48px] bg-bg-2/20 border border-white/5 backdrop-blur-3xl text-left group hover:bg-white/5 hover:border-p-500/20 transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 zellige-pattern opacity-5 group-hover:opacity-10 transition-opacity" />
                            <div className="relative z-10">
                                <div className="p-4 w-fit rounded-2xl bg-p-500/10 border border-p-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform mb-8 shadow-2xl">
                                    <feat.icon className="w-8 h-8 text-p-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">{feat.title}</h3>
                                <p className="text-base text-text-3 leading-relaxed font-bold opacity-60">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
