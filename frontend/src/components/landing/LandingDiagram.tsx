'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Globe, Database, Server } from 'lucide-react';

export function LandingDiagram() {
    return (
        <div className="relative w-full max-w-5xl mx-auto h-[500px] mt-16 perspective-1000">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-p-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full h-full flex items-center justify-center">

                {/* Left Side: Incoming Threats */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-8">
                    {[Globe, Zap, Database].map((Icon, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2, duration: 1 }}
                            className="flex items-center gap-4 bg-bg-2/30 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-xl"
                        >
                            <div className="p-2 rounded-lg bg-p-500/10 border border-p-500/20">
                                <Icon className="w-6 h-6 text-p-400" />
                            </div>
                            <div className="hidden md:block">
                                <div className="text-xs font-black text-text-3 uppercase tracking-widest whitespace-nowrap">Input Feed</div>
                                <div className="text-[10px] text-text-2 uppercase">Encrypted Signal</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Side: Infrastructure */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-8">
                    {[Server, Lock, Shield].map((Icon, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2, duration: 1 }}
                            className="flex items-center gap-4 bg-bg-2/30 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-xl text-right"
                        >
                            <div className="hidden md:block">
                                <div className="text-xs font-black text-text-3 uppercase tracking-widest whitespace-nowrap">Protected Node</div>
                                <div className="text-[10px] text-success uppercase">Secured v2.4</div>
                            </div>
                            <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                                <Icon className="w-6 h-6 text-success" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Central Core: The Shield */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-64 h-64 md:w-80 md:h-80"
                >
                    {/* Pulsing Outer Ring */}
                    <div className="absolute inset-0 rounded-full border border-p-500/20 animate-pulse-slow" />
                    <div className="absolute -inset-4 rounded-full border border-p-500/10 animate-pulse-slow" style={{ animationDelay: '1s' }} />

                    {/* Rotating Rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-4 rounded-full border-t border-l border-p-500/30 border-r-transparent border-b-transparent"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-8 rounded-full border-b border-r border-info/30 border-l-transparent border-t-transparent"
                    />

                    {/* Central Shield Card */}
                    <div className="absolute inset-12 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-p-500/20 to-info/20 backdrop-blur-2xl rounded-[40px] border border-white/10 flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
                            {/* Glow inner */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-p-400 to-transparent opacity-50" />

                            <div className="relative">
                                <div className="absolute -inset-4 bg-p-500/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
                                <Shield className="w-16 h-16 md:w-20 md:h-20 text-white relative z-10 animate-float" />
                            </div>

                            <div className="mt-6 text-center">
                                <div className="text-sm font-black text-white uppercase tracking-[0.2em]">Bouclier Core</div>
                                <div className="text-[10px] text-p-400 font-bold uppercase tracking-widest mt-1">Intelligence v4.2</div>
                            </div>

                            {/* Connecting Arcs (Visual only static for now, or animated with SVG) */}
                        </div>
                    </div>
                </motion.div>

                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" fill="none">
                    {/* Left to Core */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.2 }}
                        transition={{ duration: 2, delay: 1 }}
                        d="M 120 180 L 250 250 M 120 250 L 250 250 M 120 320 L 250 250"
                        stroke="url(#gradient-p)"
                        strokeWidth="2"
                    />
                    {/* Core to Right */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.2 }}
                        transition={{ duration: 2, delay: 1.5 }}
                        d="M 550 250 L 680 180 M 550 250 L 680 250 M 550 250 L 680 320"
                        stroke="url(#gradient-g)"
                        strokeWidth="2"
                    />
                    <defs>
                        <linearGradient id="gradient-p" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--p-500)" />
                            <stop offset="100%" stopColor="var(--p-400)" />
                        </linearGradient>
                        <linearGradient id="gradient-g" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--p-400)" />
                            <stop offset="100%" stopColor="var(--success)" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
