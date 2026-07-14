"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Database, Network, Cpu, Activity, 
    Layers, Crosshair, ShieldAlert, BookOpen, 
    RefreshCcw, Infinity as InfinityIcon, BrainCircuit, Globe,
    ChevronRight, Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface NodeStat {
    label: string;
    value: string;
    trend: string;
}

export default function FoundryAnalyticsClient() {
    const [activeNode, setActiveNode] = useState<string>('ontology');
    const [nodesCount, setNodesCount] = useState(0);

    useEffect(() => {
        apiClient("/api/telemetry/stats").then((d: any) => {
            setNodesCount(d.counters?.events || 88834);
        }).catch(() => setNodesCount(88834));
        const interval = setInterval(() => {
            setNodesCount(prev => prev + Math.floor(Math.random() * 5) + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const dataSources = [
        { id: 'src-1', name: "Local Traffic (PSUtil)", icon: Network, status: "Active", count: Math.floor(nodesCount * 0.6) },
        { id: 'src-2', name: "Red Team Ops Logs", icon: Crosshair, status: "Active", count: Math.floor(nodesCount * 0.15) },
        { id: 'src-3', name: "Sysmon / WinEvent", icon: Layers, status: "Active", count: Math.floor(nodesCount * 0.1) },
    ];

    const showDetails = (nodeId: string) => {
        setActiveNode(nodeId);
    };

    return (
        <div className="flex flex-col h-screen -m-4 bg-[#030406] overflow-hidden text-slate-300 font-sans selection:bg-blue-500/30">
            
            {/* ── HEADER ── */}
            <div className="h-14 border-b border-white/[0.08] bg-[#05080E] flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-[#0A121A] border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="font-mono text-sm font-bold text-white tracking-widest uppercase">Foundry Core</h1>
                        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#64748B]">Data Integration & Ontology</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Ontology Nodes</span>
                        <motion.span 
                            key={nodesCount}
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="font-mono text-sm font-bold text-emerald-400"
                        >
                            {(145920 + nodesCount).toLocaleString()}
                        </motion.span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A121A] border border-blue-500/30 rounded-sm">
                        <InfinityIcon className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-300 tracking-wider">
                            Virtuous Cycle: Active
                        </span>
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* ── LEFT: PIPELINE VISUALIZATION (70%) ── */}
                <div className="flex-1 relative bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] flex items-center justify-center border-r border-white/[0.08] p-12">
                     
                     {/* Background Grid Pattern */}
                     <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                     <div className="w-full max-w-5xl h-[600px] relative">
                         
                         {/* Connecting Lines (SVG) */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                             {/* Source to Ontology */}
                             <motion.path d="M 250 150 C 400 150, 400 300, 500 300" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="2" fill="none" />
                             <motion.path d="M 250 300 C 400 300, 400 300, 500 300" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" fill="none" />
                             <motion.path d="M 250 450 C 400 450, 400 300, 500 300" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="2" fill="none" />
                             
                             {/* Ontology to AI Model */}
                             <motion.path d="M 700 300 C 780 300, 780 200, 850 200" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" fill="none" />
                             
                             {/* AI to App (Threat Map) */}
                             <motion.path d="M 700 300 C 780 300, 780 400, 850 400" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" fill="none" />

                             {/* Feedback Loop (The Flywheel) */}
                             <motion.path 
                                d="M 950 450 C 950 580, 150 580, 150 400 C 150 350, 200 300, 250 300" 
                                stroke="rgba(245, 158, 11, 0.6)" strokeWidth="2" strokeDasharray="5,5" fill="none" 
                                animate={{ strokeDashoffset: [0, -100] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                             />
                         </svg>

                         {/* SOURCES COLUMN */}
                         <div className="absolute left-0 top-0 bottom-0 w-[250px] flex flex-col justify-between py-12 z-10">
                             {dataSources.map((src, idx) => (
                                 <motion.div 
                                    key={src.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => showDetails(`source-${src.id}`)}
                                    className={cn(
                                        "p-4 border bg-[#0A121A]/80 backdrop-blur cursor-pointer relative group",
                                        activeNode === `source-${src.id}` ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-[#1e293b]"
                                    )}
                                 >
                                     <div className="flex justify-between items-start mb-2">
                                         <src.icon className="w-5 h-5 text-blue-400" />
                                         <span className={cn(
                                             "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-black border",
                                             src.status === 'Active' ? "text-emerald-400 border-emerald-500/30" : "text-slate-500 border-slate-700"
                                         )}>
                                            {src.status}
                                         </span>
                                     </div>
                                     <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">{src.name}</div>
                                     <div className="text-[10px] text-slate-500 mt-2 font-mono">Row Count: {src.count.toLocaleString()}</div>
                                 </motion.div>
                             ))}
                         </div>

                         {/* CENTER: ONTOLOGY CORE */}
                         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                             <motion.div 
                                onClick={() => showDetails('ontology')}
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                    "w-48 h-48 rounded-full border border-[#1e293b] flex items-center justify-center bg-[#05080E]/90 backdrop-blur cursor-pointer relative group",
                                    activeNode === 'ontology' ? "border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : ""
                                )}
                             >
                                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-2 rounded-full border border-dashed border-emerald-500/30" />
                                 <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-6 rounded-full border border-solid border-blue-500/10" />
                                 
                                 <div className="text-center">
                                     <Database className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                     <div className="font-mono text-[11px] font-bold text-white uppercase tracking-widest">Master<br/>Ontology</div>
                                 </div>
                             </motion.div>
                         </div>

                         {/* RIGHT COLUMN: MODELS & APPS */}
                         <div className="absolute right-0 top-0 bottom-0 w-[250px] flex flex-col justify-between py-24 z-10">
                             
                             <motion.div 
                                onClick={() => showDetails('model')}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                    "p-4 border bg-[#0A121A]/80 backdrop-blur cursor-pointer relative",
                                    activeNode === 'model' ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "border-[#1e293b]"
                                )}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <BrainCircuit className="w-5 h-5 text-purple-400" />
                                     <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-black border border-purple-500/30 text-purple-400">Training</span>
                                 </div>
                                 <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">Sentinel ML Model</div>
                                 <div className="text-[10px] text-slate-500 mt-2 font-mono">Learning from Ontology</div>
                             </motion.div>

                             <motion.div 
                                onClick={() => showDetails('app')}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                    "p-4 border bg-[#0A121A]/80 backdrop-blur cursor-pointer relative",
                                    activeNode === 'app' ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-[#1e293b]"
                                )}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <Globe className="w-5 h-5 text-emerald-400" />
                                     <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-black border border-emerald-500/30 text-emerald-400">Deployed</span>
                                 </div>
                                 <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">Gotham Threat Map</div>
                                 <div className="text-[10px] text-slate-500 mt-2 font-mono">Real-world Application</div>
                             </motion.div>
                         </div>

                     </div>

                     {/* The Vertuous Loop Title */}
                     <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                          <div className="flex items-center justify-center gap-2 text-amber-500 opacity-80 mb-1">
                              <RefreshCcw className="w-4 h-4" />
                              <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">The Proprietary Data Flywheel</span>
                          </div>
                          <div className="text-[10px] text-slate-500 w-96 font-mono leading-relaxed">
                              Application outputs and user decisions continuously train the AI, compounding Bouclier's competitive advantage.
                          </div>
                     </div>
                </div>

                {/* ── RIGHT: DETAIL PANEL (30%) ── */}
                <div className="w-[400px] shrink-0 bg-[#05080E] border-l border-white/[0.08] flex flex-col font-mono">
                    <div className="p-4 border-b border-[#1e293b] bg-[#091019] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Workflow className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Node Inspector</span>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeNode}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeNode === 'ontology' && (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                                <Database className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Master Ontology</h2>
                                                <div className="text-[10px] text-slate-400 mt-1">Foundry Object Model</div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 border-l-2 border-[#1e293b] pl-3">
                                            The central nervous system of your Operations. It maps disparate, complex data (PCAPs, Logs, Scans) into a unified semantic graph architecture, instantly ready for AI consumption.
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b]">
                                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Object Nodes</div>
                                                <div className="text-xl font-bold text-emerald-400">{(145920 + nodesCount).toLocaleString()}</div>
                                            </div>
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b]">
                                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Edge Relationships</div>
                                                <div className="text-lg font-bold text-white">{(832440 + nodesCount * 3).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeNode.startsWith('source') && (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                                <Network className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Raw Ingestion</h2>
                                                <div className="text-[10px] text-slate-400 mt-1">Data Pipeline Connection</div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 border-l-2 border-[#1e293b] pl-3">
                                            Raw network telemetry and cybersecurity logs captured natively. This proprietary ingestion means the AI trains on your exact real-world scenario, preventing model commoditization.
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b]">
                                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Ingest Rate</div>
                                                <div className="text-xl font-bold text-blue-400">920 <span className="text-sm text-slate-500">events/min</span></div>
                                            </div>
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b]">
                                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Integration</div>
                                                <div className="text-sm font-bold text-white">Native PSUtil Binding</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeNode === 'model' && (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                                <BrainCircuit className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Sentinel Core AI</h2>
                                                <div className="text-[10px] text-slate-400 mt-1">Decision Engine</div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 border-l-2 border-[#1e293b] pl-3">
                                            Algorithms transform the unified Ontology DB into predictive insights. As generic AI commoditizes, our proprietary tuning on top of your local network structure ensures an unmatched competitive edge.
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b]">
                                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Model Status</div>
                                                <div className="text-xl font-bold text-purple-400">Retraining Active</div>
                                                <div className="text-[9px] text-slate-500 mt-1">Weights updated via Flywheel</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeNode === 'app' && (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Operational Application</h2>
                                                <div className="text-[10px] text-slate-400 mt-1">Gotham Pro UI</div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 border-l-2 border-[#1e293b] pl-3">
                                            Frontline decisions (Approve/Reject) taken in the Gotham UI instantly write back to the Ontology, directly training the AI for the next encounter. The cycle is complete.
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            <div className="p-3 bg-white/[0.02] border border-[#1e293b] flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Decisions Logged</div>
                                                    <div className="text-xl font-bold text-amber-400">84</div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-600" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
}
