"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert, Target, Fingerprint, Terminal,
    Database, Activity, ArrowRight, Shield, Radio, Cpu 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FEATURES = [
    {
        icon: ShieldAlert,
        label: "AUTONOMOUS DEFENSE",
        title: "SELF-HEALING ARCHITECTURE",
        desc: "> SYSTEM IMPLEMENTS AI-DRIVEN RESPONSE PROTOCOLS. ISOLATES THREATS IN SUB-MILLISECOND CYCLES WITHOUT HUMAN INTERVENTION.",
    },
    {
        icon: Target,
        label: "ADVERSARY EMULATION",
        title: "CONTINUOUS VALIDATION",
        desc: "> EXECUTING REAL-WORLD APT SIMULATION LOOPS. STRESS-TESTING DEFENSES TO IDENTIFY VISIBILITY GAPS.",
    },
    {
        icon: Fingerprint,
        label: "FORENSIC INTEGRITY",
        title: "EVIDENCE VAULT",
        desc: "> WORM-STORAGE BACKED METADATA ARCHIVING. CRYPTOGRAPHIC DATA CHAINS FOR REGULATORY COMPLIANCE.",
    }
];

const STATS = [
    { val: "LVL 10", label: "OP MATURITY" },
    { val: "2.5M+", label: "THREATS KILLED" },
    { val: "< 1ms", label: "LATENCY" },
    { val: "100%", label: "AUDIT SECURE" }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SectionLabel = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-500 font-bold">[{text}]</span>
        <div className="h-px w-24 bg-amber-500/30" />
    </div>
);

const TerminalLine = ({ text, delay = 0, status = "OK" }: { text: string, delay?: number, status?: string }) => (
    <motion.div 
        initial={{ opacity: 0, x: -10 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        transition={{ delay, duration: 0.2 }}
        className="flex gap-4 text-xs font-mono text-zinc-500"
    >
        <span className={status === "OK" ? "text-amber-500" : "text-red-500"}>[{status}]</span>
        <span>{text}</span>
    </motion.div>
);

export default function ModernLanding() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="relative bg-[#050505] min-h-screen text-zinc-300 font-mono selection:bg-amber-500/30 selection:text-amber-500 overflow-x-hidden">
            
            {/* NOISE & SCANLINES */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

            {/* 🟢 HERO SECTION */}
            <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-12 pt-20 border-b border-amber-500/20">
                <div className="max-w-7xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    <div>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-amber-500/30 bg-amber-500/5 text-amber-500 text-[10px] tracking-[0.2em] font-bold"
                        >
                            <Terminal className="w-3 h-3" />
                            ROOT ACCESS GRANTED :: V10
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-8 text-amber-500">
                            BOUCLIER <br />
                            <span className="text-zinc-100">SAAS_</span>
                        </h1>

                        <p className="text-sm md:text-base text-zinc-400 max-w-lg mb-12 leading-relaxed border-l-2 border-amber-500/40 pl-4">
                            Beyond conventional protection. Secure your enterprise with the world's first integrated decision engine unifying offensive simulation, tactical response, and governance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dashboard">
                                <button className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-black font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors flex items-center justify-center gap-3">
                                    <Terminal className="w-4 h-4" />
                                    Init System
                                </button>
                            </Link>
                            <Link href="/docs">
                                <button className="w-full sm:w-auto px-8 py-4 border border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-amber-500 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 bg-zinc-950">
                                    Read Docs
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* HERO TERMINAL VISUAL */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="hidden lg:block border border-zinc-800 bg-[#0a0a0a] shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                    >
                        <div className="h-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 justify-between">
                            <span className="text-[10px] text-zinc-500">root@bouclier:~#</span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-zinc-700" />
                                <div className="w-2 h-2 bg-zinc-700" />
                                <div className="w-2 h-2 bg-amber-500" />
                            </div>
                        </div>
                        <div className="p-6 space-y-2 h-[400px] overflow-hidden relative">
                            <TerminalLine text="Booting Sentinel Core OS..." delay={0.4} />
                            <TerminalLine text="Loading Quantum-Safe Engine..." delay={0.5} />
                            <TerminalLine text="Connecting to Proxy Gateway..." delay={0.6} status="WAIT" />
                            <TerminalLine text="Proxy Gateway verified on 127.0.0.1" delay={0.8} />
                            <TerminalLine text="Mounting Encrypted Evidence Vault..." delay={0.9} />
                            
                            <div className="mt-8 p-4 border border-amber-500/20 bg-amber-500/5">
                                <div className="text-amber-500 text-xs mb-2">TARGET LOCK ACQUIRED</div>
                                <div className="text-zinc-500 text-[10px]">
                                    {`   _     _ _ _\n  | |   (_) | |        \n  | |__  _| | |__  ___ \n  | '_ \\| | | '_ \\/ __|\n  | |_) | | | |_) \\__ \\\n  |_.__/|_|_|_.__/|___/`}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* 📊 KPI STRIP */}
            <section className="border-b border-zinc-900 bg-[#080808]">
                <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-wrap">
                    {STATS.map((s, i) => (
                        <div key={s.label} className="w-1/2 md:w-1/4 p-8 border-r border-b md:border-b-0 border-zinc-900 last:border-r-0">
                            <div className="text-3xl md:text-5xl font-black text-amber-500 tracking-tighter mb-2">{s.val}</div>
                            <div className="text-[10px] text-zinc-500 tracking-[0.2em]">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🛡️ ARCHITECTURE SECTION */}
            <section className="relative py-32 px-4 md:px-12 border-b border-zinc-900">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    <div className="lg:col-span-5">
                        <SectionLabel text="SYSTEM.ARCHITECTURE" />
                        <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-8 text-zinc-200">
                            UNIFIED <br/> TACTICAL <br/> <span className="text-amber-500">INTEL.</span>
                        </h2>
                        <p className="text-zinc-400 mb-8 border-l border-zinc-800 pl-4 text-sm leading-relaxed">
                            Empower your SOC with Level 10 maturity. We provide the tools to not just defend, but to validate, govern, and outmaneuver any modern adversary profile in real-time.
                        </p>
                        
                        <div className="space-y-2">
                            {["APT_EMULATION_MODULE", "AI_DECISION_ENGINE", "WORM_AUDIT_LOGS"].map(item => (
                                <div key={item} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 text-xs">
                                    <div className="w-1.5 h-1.5 bg-amber-500" />
                                    <span className="text-zinc-300 tracking-widest">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FEATURES.map((f, i) => (
                            <div key={f.title} className={cn("p-6 border border-zinc-800 bg-[#0a0a0a] hover:border-amber-500/40 transition-colors group", i === 0 && "sm:col-span-2")}>
                                <div className="flex justify-between items-start mb-6">
                                    <f.icon className="w-6 h-6 text-amber-500" />
                                    <span className="text-[10px] text-zinc-600">[0x0{i+1}]</span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-200 uppercase mb-4 tracking-wider">{f.title}</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed font-mono">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* 🚀 DEPLOYMENT CTA */}
            <section className="py-40 text-center px-4 border-b border-zinc-900 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05),transparent_50%)]">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-zinc-100">
                        READY TO <span className="text-amber-500 border-b-4 border-amber-500">DEFEND</span>_
                    </h2>
                    <p className="text-zinc-400 text-sm mb-12">
                        Stop reacting and start orchestrating. Join the Level 10 ecosystem today and transform your security from a cost center to a strategic bunker.
                    </p>
                    <Link href="/register">
                        <button className="px-12 py-5 bg-amber-500 text-black font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-3 mx-auto">
                            EXECUTE DEPLOYMENT
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </section>

            {/* 🏴 FOOTER */}
            <footer className="py-12 bg-[#020202] border-t border-amber-500/10 px-4 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-amber-500" />
                        <span className="font-bold tracking-widest text-zinc-300">BOUCLIER <span className="text-zinc-600">OS</span></span>
                    </div>
                    <div className="flex gap-6 text-[10px] text-zinc-600 tracking-widest uppercase">
                        <a href="#" className="hover:text-amber-500">Capabilities</a>
                        <a href="#" className="hover:text-amber-500">Docs</a>
                        <a href="#" className="hover:text-amber-500">Status</a>
                    </div>
                    <div className="text-[10px] text-zinc-700">
                        © 2026 BOUCLIER // END OF FILE.
                    </div>
                </div>
            </footer>
        </div>
    );
}
