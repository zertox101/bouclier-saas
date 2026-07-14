"use client";

import RedHoundPro from "@/components/red/RedHoundPro";
import { motion } from "framer-motion";
import { Bug, Shield, Activity, Zap } from "lucide-react";

export default function RedHoundPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#050505] border border-white/[0.05] p-8 rounded-3xl"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                            <Bug className="w-8 h-8 text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight uppercase">RedHound Pro</h1>
                                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.3)]">Standalone Engine</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                                Enterprise-grade offensive security scanner powered by the Bouclier Payload Engine. 
                                Real-time vulnerability detection, AI-driven verification, and CVE correlation in a unified standalone environment.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Backend Active</span>
                            </div>
                            <div className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">Local Engine: Port 5000</div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Component */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <RedHoundPro />
                </motion.div>

                {/* Footer / Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#050505] border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-widest">Real-time Sync</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Socket.io connection established</div>
                        </div>
                    </div>
                    <div className="bg-[#050505] border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-all">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Shield className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-widest">AI Verification</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Automated false-positive filtering</div>
                        </div>
                    </div>
                    <div className="bg-[#050505] border border-white/[0.05] p-6 rounded-2xl flex items-center gap-4 group hover:border-purple-500/30 transition-all">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Bug className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white uppercase tracking-widest">Payload Engine</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">17+ Vulnerability classes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
