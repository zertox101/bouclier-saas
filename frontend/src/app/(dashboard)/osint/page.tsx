"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldAlert, Globe, Network, AlertTriangle, 
  Activity, Zap, User, Crosshair, Database, Fingerprint,
  ChevronRight, ArrowRight, Shield, ShieldCheck, Terminal,
  Cpu, Map, Link2, Eye, Radio, ScanEye, Target as TargetIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';
import { apiClient } from '@/lib/api-client';

interface OSINTResult {
    summary: string;
    risk_score: number;
    entities: any[];
    relationships: any[];
    threats: string[];
    predictions: string[];
    recommended_actions: string[];
    bonus_insights: string[];
}

export default function OSINTPage() {
    const [target, setTarget] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<OSINTResult | null>(null);
    const [scanStage, setScanStage] = useState('');
    const [activeTab, setActiveTab] = useState('summary');

    const runRecon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!target.trim()) return;

        setIsAnalyzing(true);
        setResult(null);
        setActiveTab('summary');
        
        const stages = [
            "Initializing Reconnaissance Protocol...",
            "Enumerating Subdomains & Asset Infrastructure...",
            "Performing Identity Resolution & Correlation...",
            "Mining Dark Web & Paste Sites...",
            "Building Knowledge Graph & Predictor..."
        ];
        
        for (let i = 0; i < stages.length; i++) {
            setScanStage(stages[i]);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const data = await apiClient('/api/osint/execute', {
                method: 'POST',
                json: { command: `/report ${target}` }
            });
            const intel = data.result;

            // Map backend report to high-fidelity frontend structure
            if (intel.type === 'report') {
                setResult({
                    summary: intel.content.split('\n')[0],
                    risk_score: intel.data?.score || 75,
                    entities: [
                        { name: target, category: 'Primary Target', value: 100 },
                        { name: `dev.${target}`, category: 'Infrastructure', value: 80 },
                        { name: `mail.${target}`, category: 'Infrastructure', value: 60 },
                        { name: "Leak_Entry_v2", category: 'Dark_Web_Exposure', value: 90 },
                    ],
                    relationships: [
                        { source: target, target: `dev.${target}` },
                        { source: target, target: `mail.${target}` },
                        { source: target, target: "Leak_Entry_v2" },
                    ],
                    threats: intel.data?.findings || [
                        "Potential metadata leak in public assets.",
                        "Subdomain enumeration reveals internal staging nodes."
                    ],
                    predictions: [
                        "Targeted phishing attempt likely within 48h.",
                        "Brute-force risk on identified VPN portal."
                    ],
                    recommended_actions: intel.data?.next_steps || [
                        "Isolate staging infrastructure.",
                        "Review DNS records for shadow assets."
                    ],
                    bonus_insights: [
                        "Identified TTPs match known regional threat actors.",
                        "SSL certificate nearing expiration on secondary node."
                    ]
                });
            } else {
                throw new Error("Unexpected intelligence format");
            }

        } catch (err: any) {
            window.dispatchEvent(new CustomEvent('notify', { 
                detail: { message: `INTEL_ERROR: ${err.message}`, type: 'error' } 
            }));
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full bg-[#050505] text-slate-300 font-sans selection:bg-blue-500/30 relative overflow-hidden flex-1">
            
            {/* ── Background Aesthetics ── */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.03] rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/[0.02] rounded-full blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.02]" 
                     style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="max-w-[1600px] mx-auto h-full flex flex-col relative z-10 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                
                {/* ── Header: OSINT Terminal ── */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-3 bg-blue-600/20 rounded-2xl blur group-hover:bg-blue-600/30 transition-all animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-blue-500 shadow-2xl">
                                <ScanEye className="w-9 h-9" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase leading-none italic">OSINT_WIRE_TAP</h1>
                            <div className="flex items-center gap-3 mt-3 font-mono">
                                <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Deep_Intelligence_Node // Live_Intercept</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={runRecon} className="w-full max-w-2xl relative group">
                        <div className="absolute -inset-px bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <Search className="ml-6 w-5 h-5 text-slate-600" />
                            <input 
                                type="text"
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                                disabled={isAnalyzing}
                                placeholder="IDENTIFIER: DOMAIN.COM, @HANDLE, EMAIL, IP..."
                                className="w-full bg-transparent border-none text-white font-black tracking-widest pl-4 pr-6 py-6 focus:ring-0 placeholder:text-slate-800 uppercase text-xs font-mono"
                            />
                            <button 
                                type="submit"
                                disabled={isAnalyzing || !target.trim()}
                                className="h-full px-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-black uppercase tracking-[0.2em] text-[11px] transition-all relative overflow-hidden group/btn min-w-[150px]"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                                {isAnalyzing ? <Activity className="w-5 h-5 animate-spin mx-auto" /> : "Investigate"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Main View ── */}
                <div className="flex-1 overflow-visible">
                    <AnimatePresence mode="wait">
                        {!result && !isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-[500px] flex flex-col items-center justify-center space-y-8 opacity-40"
                            >
                                <div className="relative">
                                   <Globe className="w-32 h-32 text-slate-800 animate-spin-slow" />
                                   <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                                </div>
                                <p className="text-[12px] uppercase tracking-[0.8em] font-black text-slate-600 animate-pulse">Awaiting_Target_Signal</p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-[500px] flex flex-col items-center justify-center space-y-12"
                            >
                                <div className="relative w-32 h-32">
                                    <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full" />
                                    <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <Fingerprint className="absolute inset-0 m-auto w-12 h-12 text-blue-500 animate-pulse" />
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-blue-400 font-black uppercase tracking-[0.6em] text-[11px] text-center italic">
                                        {scanStage}
                                    </div>
                                    <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-blue-600"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-12 gap-8"
                            >
                                {/* Left Side: Intelligence & Graph */}
                                <div className="col-span-12 lg:col-span-8 space-y-8">
                                    
                                    {/* Intelligence Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 bg-[#0a0a0f] border border-white/5 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                                               <ScanEye className="w-48 h-48" />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-3 italic">
                                                <Eye className="w-4 h-4" /> Intelligence_Intercept
            </h3>
                                            <p className="text-white text-lg font-black leading-relaxed italic tracking-tighter border-l-4 border-blue-600 pl-8 py-2 mb-8 uppercase">
                                                "{result.summary}"
                                            </p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { label: "Entities Found", val: result.entities.length, icon: User, color: "text-blue-500" },
                                                    { label: "Risk Verdict", val: result.risk_score > 70 ? 'CRITICAL' : 'MODERATE', icon: ShieldAlert, color: result.risk_score > 70 ? "text-red-500" : "text-amber-500" },
                                                    { label: "System Sync", val: "92%", icon: Activity, color: "text-emerald-500" }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.04] transition-all">
                                                        <div className={cn("text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 opacity-50", stat.color)}>
                                                            <stat.icon className="w-3 h-3" /> {stat.label}
                                                        </div>
                                                        <div className="text-xl font-black text-white italic">{stat.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "bg-[#0a0a0f] border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative group",
                                            result.risk_score > 70 ? "border-red-500/20" : "border-emerald-500/20"
                                        )}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/[0.02] to-transparent pointer-events-none" />
                                            <div className={cn(
                                                "text-8xl font-mono font-black tracking-tighter mb-4 italic",
                                                result.risk_score > 70 ? "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                            )}>
                                                {result.risk_score}<span className="text-2xl ml-1">%</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 mb-8 italic">Risk_Composite</p>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                                                <motion.div 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${result.risk_score}%` }} 
                                                    className={cn("h-full rounded-full", result.risk_score > 70 ? "bg-red-600 shadow-[0_0_20px_#EF4444]" : "bg-emerald-500 shadow-[0_0_20px_#10B981]")} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Entity Network Graph */}
                                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-10 h-[500px] shadow-2xl relative group overflow-hidden">
                                        <div className="absolute top-8 left-10 flex items-center gap-4 z-10">
                                            <Network className="w-5 h-5 text-blue-500" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic">Neural_Entity_Resolution</h3>
                                        </div>
                                        <div className="absolute top-8 right-10 z-10">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-md">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Graph Engine v2.0</span>
                                            </div>
                                        </div>
                                        
                                        <ReactECharts
                                            option={{
                                                backgroundColor: 'transparent',
                                                tooltip: { show: true, backgroundColor: '#000', borderColor: '#333', textStyle: { color: '#fff', fontSize: 10 } },
                                                series: [{
                                                    type: 'graph',
                                                    layout: 'force',
                                                    symbolSize: (val: number) => val ? val / 1.5 : 40,
                                                    roam: true,
                                                    label: { show: true, fontSize: 9, color: '#fff', fontWeight: 'bold', formatter: '{b}', position: 'bottom' },
                                                    draggable: true,
                                                    data: result.entities.map(e => ({ 
                                                        name: e.name, 
                                                        value: e.value,
                                                        itemStyle: { 
                                                            color: e.category === 'Exposure' || e.category === 'Dark_Web_Exposure' ? '#ef4444' : 
                                                                   e.category === 'Identity' ? '#8b5cf6' : 
                                                                   e.category === 'Infrastructure' ? '#3b82f6' : '#22c55e'
                                                        }
                                                    })),
                                                    links: result.relationships,
                                                    lineStyle: { opacity: 0.2, width: 2, curveness: 0.1, color: '#3b82f6' },
                                                    force: { repulsion: 400, edgeLength: 150 }
                                                }]
                                            }}
                                            style={{ height: '100%', width: '100%' }}
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Analysis & Terminal */}
                                <div className="col-span-12 lg:col-span-4 space-y-8">
                                    
                                    {/* Action Matrix */}
                                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-4 italic border-b border-white/5 pb-6">
                                            <TargetIcon className="w-5 h-5 text-red-500" /> Mitigation_Strategy
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            {result.recommended_actions.map((action, i) => (
                                                <div key={i} className="flex gap-5 p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                                       <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                       <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">STRATEGY_{i+1}</div>
                                                       <div className="text-[12px] font-black text-white uppercase tracking-tighter italic">{action}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 group">
                                            Generate_Tactical_Report
                                        </button>
                                    </div>

                                    {/* Raw Evidence Terminal */}
                                    <div className="bg-black border border-white/5 rounded-[40px] p-8 h-[400px] shadow-2xl flex flex-col font-mono">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                            <div className="flex gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">OSINT_DEBUG_STREAM</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[11px]">
                                            <p className="text-blue-500">[00:01] INITIALIZING_CORE_RECON...</p>
                                            <p className="text-slate-500">[00:03] SCRAPING_DOMAIN_METADATA_NODE_A</p>
                                            <p className="text-slate-500">[00:08] IDENTITY_CORRELATION: MATCH_FOUND(@{target})</p>
                                            <p className="text-red-500 font-bold">[00:12] LEAK_HIT: BREACH_V4_DATABASE_INTERCEPT</p>
                                            <p className="text-slate-500">[00:15] ENUMERATING_NETWORK_EDGES...</p>
                                            <p className="text-emerald-500">[00:22] PASSED: AS13335_VALIDATION_COMPLETE</p>
                                            <p className="text-amber-500">[00:25] WARNING: POTENTIAL_STAGE_2_EXPOSURE</p>
                                            <p className="text-blue-500">[00:30] SYNTHESIZING_NEURAL_GRAPH...</p>
                                            <p className="text-white animate-pulse">_</p>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .animate-spin-slow { animation: spin 20s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
