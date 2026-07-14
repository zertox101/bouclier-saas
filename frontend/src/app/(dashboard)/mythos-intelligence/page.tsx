"use client";

import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Book, 
    Zap, 
    Activity, 
    ChevronRight, 
    FileText, 
    Search,
    Brain,
    Lock,
    Globe,
    AlertCircle,
    ArrowLeft,
    Target,
    Server,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface MythosDoc {
    id: string;
    title: string;
    category: string;
}

interface DocContent {
    id: string;
    title: string;
    content_md: string;
}

interface MythosAnalysis {
    id: string;
    target: string;
    scan_id: string | null;
    status: string;
    current_phase: number;
    phases: any[];
    findings: any[];
    logs: any[];
    summary: any;
    created_at: string;
    completed_at: string | null;
}

const KILL_CHAIN_PHASES = [
    { phase: 1, name: "RECONNAISSANCE", icon: "search", color: "cyan", desc: "Identify exposed services, banners, and software versions" },
    { phase: 2, name: "SCAN & ENUMERATION", icon: "scan", color: "blue", desc: "Map open ports to known CVEs and misconfigurations" },
    { phase: 3, name: "GAIN ACCESS", icon: "zap", color: "red", desc: "Exploit vulnerabilities with precise payloads" },
    { phase: 4, name: "MAINTAIN ACCESS", icon: "refresh-cw", color: "orange", desc: "Establish persistence via backdoors and implants" },
    { phase: 5, name: "COVER TRACKS", icon: "eye-off", color: "purple", desc: "Clean logs and evade detection" },
];

export default function MythosIntelligencePage() {
    const [docs, setDocs] = useState<MythosDoc[]>([]);
    const [stacks, setStacks] = useState<MythosDoc[]>([]);
    const [analyses, setAnalyses] = useState<MythosAnalysis[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null);
    const [selectedAnalysis, setSelectedAnalysis] = useState<MythosAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [tab, setTab] = useState<"docs" | "stacks" | "analyses">("docs");
    const [targetUrl, setTargetUrl] = useState("");
    
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [d, s, a] = await Promise.all([
                apiClient('/mythos/intel'),
                apiClient('/mythos/stacks'),
                apiClient('/mythos/analyses').catch(() => [])
            ]);
            setDocs(d);
            setStacks(s);
            setAnalyses(a);
        } catch (e) {
            console.error("Failed to load Mythos data", e);
        }
        setIsLoading(false);
    };

    const fetchContent = async (id: string, cat: string) => {
        setIsLoading(true);
        try {
            const content = await apiClient(`/mythos/content/${cat}/${id}`);
            setSelectedDoc(content);
            setSelectedAnalysis(null);
        } catch (e) {
            console.error("Failed to load content", e);
        }
        setIsLoading(false);
    };

    const fetchAnalysis = async (id: string) => {
        setIsLoading(true);
        try {
            const analysis = await apiClient(`/mythos/analyses/${id}`);
            setSelectedAnalysis(analysis);
            setSelectedDoc(null);
        } catch (e) {
            console.error("Failed to load analysis", e);
        }
        setIsLoading(false);
    };

    const getFilteredList = () => {
        if (tab === "docs") return docs.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
        if (tab === "stacks") return stacks.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return analyses.filter(a => a.target.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const sevColor = (s: string) => {
        const map: Record<string, string> = { critical: "text-red-400 bg-red-500/10", high: "text-orange-400 bg-orange-500/10", medium: "text-yellow-400 bg-yellow-500/10", low: "text-blue-400 bg-blue-500/10" };
        return map[s] || "text-slate-400 bg-slate-500/10";
    };

    const phaseColor = (p: number) => {
        const map: Record<string, string> = { 1: "text-cyan-400", 2: "text-blue-400", 3: "text-red-400", 4: "text-orange-400", 5: "text-purple-400" };
        return map[p] || "text-slate-400";
    };

    return (
        <div className="p-10 space-y-10 flex-1 overflow-y-auto bg-[#020203] relative min-h-screen font-sans">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-fixed opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-purple-900/10 pointer-events-none" />
            
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="w-8 h-8 text-emerald-500 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Mythos Strategic Intelligence</h1>
                        <p className="text-[11px] font-mono text-emerald-400/70 uppercase tracking-[0.4em] mt-2">Post-Mythos Defense Framework // Level 10 Clearance</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-2 rounded-3xl backdrop-blur-xl">
                    <div className="flex bg-white/5 rounded-2xl p-1">
                        <button 
                            onClick={() => { setTab("docs"); setSelectedDoc(null); setSelectedAnalysis(null); }}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tab === "docs" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Intelligence
                        </button>
                        <button 
                            onClick={() => { setTab("stacks"); setSelectedDoc(null); setSelectedAnalysis(null); }}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tab === "stacks" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Hardening
                        </button>
                        <button 
                            onClick={() => { setTab("analyses"); setSelectedDoc(null); setSelectedAnalysis(null); }}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tab === "analyses" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Analyses
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search Intelligence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-[11px] font-mono text-white focus:outline-none w-64 italic"
                        />
                    </div>
                </div>
            </header>

            {/* ── Active Offensive Deployment Panel ── */}
            <div className="relative z-10 bg-black/60 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.1)] mb-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap className="w-24 h-24 text-red-500" />
                </div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/20">
                            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Mythos Active Deployment</h2>
                            <p className="text-[10px] text-red-400 font-mono tracking-widest mt-1">INITIATE ADVANCED PERSISTENT THREAT SIMULATION</p>
                        </div>
                    </div>
                    <div className="flex w-full lg:w-auto items-center gap-3 bg-[#0a0a0f] p-2 rounded-2xl border border-white/10">
                        <input 
                            type="text"
                            placeholder="TARGET IP OR DOMAIN"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            className="bg-transparent border-none outline-none text-white font-mono text-xs px-4 py-2 w-64 placeholder:text-slate-600 uppercase"
                        />
                        <button 
                            onClick={() => {
                                if(targetUrl) {
                                    window.location.href = `/ai-pentester?target=${encodeURIComponent(targetUrl)}&mode=mythos`;
                                }
                            }}
                            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Zap className="w-3 h-3" />
                            Deploy
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedDoc && !selectedAnalysis ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
                    >
                        {tab === "analyses" ? (
                            analyses.length === 0 ? (
                                <div className="col-span-full text-center py-16 text-slate-500">
                                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-sm">No Mythos analyses yet</p>
                                    <p className="text-[10px] mt-1">Run a network scan and click "Analyze with Mythos"</p>
                                </div>
                            ) : (
                                getFilteredList().map((item: any, i: number) => (
                                    <motion.div 
                                        key={item.id || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => fetchAnalysis(item.id)}
                                        className="group p-8 bg-[#0a0a0f] border border-white/5 rounded-[40px] hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Target className="w-16 h-16" />
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-cyan-500/10 text-cyan-500"}`}>
                                                {item.status === "completed" ? <Shield className="w-5 h-5" /> : <Activity className="w-5 h-5 animate-pulse" />}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">{item.status}</span>
                                                <span className="text-[8px] font-mono text-slate-500">{new Date(item.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors mb-2">{item.target}</h3>
                                        {item.summary && (
                                            <div className="flex gap-2 mb-4">
                                                <span className="text-[10px] font-mono text-slate-300">{item.summary.total_findings} findings</span>
                                                <span className="text-[10px] font-mono text-slate-500">|</span>
                                                <span className="text-[10px] font-mono text-slate-300">Risk: {item.summary.risk_score}</span>
                                            </div>
                                        )}
                                        {item.phases && item.phases.length > 0 && (
                                            <div className="flex gap-1.5 pt-4 border-t border-white/5">
                                                {item.phases.map((p: any) => (
                                                    <span key={p.phase} className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 ${p.findings_count > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                                                        P{p.phase}: {p.findings_count}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                                            <span className="text-[9px] font-mono text-slate-500 uppercase">ID: {item.id}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))
                            )
                        ) : (
                            getFilteredList().map((doc: any, i: number) => (
                                <motion.div 
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => fetchContent(doc.id, tab)}
                                    className="group p-8 bg-[#0a0a0f] border border-white/5 rounded-[40px] hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        {tab === "docs" ? <Brain className="w-16 h-16" /> : <Lock className="w-16 h-16" />}
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            {tab === "docs" ? <FileText className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{doc.category}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors mb-4">{doc.title}</h3>
                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase">Clearance: Level 10</span>
                                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                ) : selectedAnalysis ? (
                    <motion.div 
                        key="analysis-detail"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 max-w-5xl mx-auto"
                    >
                        <button 
                            onClick={() => setSelectedAnalysis(null)}
                            className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all" />
                            Back to Analyses
                        </button>

                        <div className="bg-[#0a0a0f] border border-white/5 rounded-[50px] overflow-hidden shadow-2xl mb-8">
                            <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl ${selectedAnalysis.status === "completed" ? "bg-emerald-600/10 border border-emerald-500/20" : "bg-cyan-600/10 border border-cyan-500/20"}`}>
                                        {selectedAnalysis.status === "completed" ? <Shield className="w-8 h-8 text-emerald-500" /> : <Activity className="w-8 h-8 text-cyan-500 animate-pulse" />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedAnalysis.target}</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-slate-400">
                                                <Clock className="w-3 h-3" /> {new Date(selectedAnalysis.created_at).toLocaleString()}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedAnalysis.status === "completed" ? "text-emerald-400" : "text-cyan-400"}`}>
                                                {selectedAnalysis.status}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[10px] font-mono text-slate-500">{selectedAnalysis.id}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedAnalysis.summary && (
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-white/5 rounded-2xl p-4 text-center">
                                            <div className="text-2xl font-black text-white">{selectedAnalysis.summary.total_findings}</div>
                                            <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Total Findings</div>
                                        </div>
                                        {Object.entries(selectedAnalysis.summary.by_severity || {}).map(([sev, count]: any) => (
                                            <div key={sev} className="bg-white/5 rounded-2xl p-4 text-center">
                                                <div className={`text-2xl font-black ${sevColor(sev).split(" ")[0]}`}>{count}</div>
                                                <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">{sev}</div>
                                            </div>
                                        ))}
                                        <div className="bg-white/5 rounded-2xl p-4 text-center">
                                            <div className="text-2xl font-black text-emerald-400">{selectedAnalysis.summary.risk_score}</div>
                                            <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Risk Score</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kill Chain Phases */}
                        {selectedAnalysis.phases && selectedAnalysis.phases.length > 0 && (
                            <div className="grid grid-cols-5 gap-3 mb-8">
                                {KILL_CHAIN_PHASES.map((kp) => {
                                    const phaseData = selectedAnalysis.phases.find((p: any) => p.phase === kp.phase);
                                    return (
                                        <div key={kp.phase} className={`bg-[#0a0a0f] border border-white/5 rounded-2xl p-4 text-center ${phaseData?.findings_count ? "hover:border-emerald-500/30" : "opacity-40"}`}>
                                            <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${phaseColor(kp.phase)}`}>{kp.name.split(" ")[0]}</div>
                                            <div className="text-2xl font-black text-white">{phaseData?.findings_count || 0}</div>
                                            <div className="text-[8px] font-mono text-slate-500 mt-1">findings</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Findings List */}
                        {selectedAnalysis.findings && selectedAnalysis.findings.length > 0 && (
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-[50px] overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-emerald-500" />
                                        Findings ({selectedAnalysis.findings.length})
                                    </h3>
                                </div>
                                <div className="p-8 space-y-4">
                                    {selectedAnalysis.findings.map((f: any, i: number) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:border-emerald-500/20 transition-all">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${phaseColor(f.phase)}`}>{f.phase_name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${sevColor(f.severity)}`}>{f.severity}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-500">{f.cwe || ""}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-2">{f.name}</h4>
                                            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{f.description}</p>
                                            {f.exploit_poc && (
                                                <div className="bg-black/40 rounded-xl p-3 mb-2">
                                                    <span className="text-[8px] font-black text-red-400 uppercase tracking-widest block mb-1">PoC</span>
                                                    <code className="text-[10px] font-mono text-red-300/80 break-all">{f.exploit_poc}</code>
                                                </div>
                                            )}
                                            {f.remediation && (
                                                <div className="bg-emerald-500/5 rounded-xl p-3">
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Remediation</span>
                                                    <code className="text-[10px] font-mono text-emerald-300/80">{f.remediation}</code>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Logs */}
                        {selectedAnalysis.logs && selectedAnalysis.logs.length > 0 && (
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-[50px] overflow-hidden shadow-2xl mt-6">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight italic">Execution Logs</h3>
                                </div>
                                <div className="p-6 font-mono text-[10px] leading-relaxed max-h-[300px] overflow-y-auto">
                                    {selectedAnalysis.logs.map((log: any, i: number) => (
                                        <div key={i} className={`mb-0.5 ${log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-yellow-400" : log.level === "SUCCESS" ? "text-emerald-400" : "text-slate-500"}`}>
                                            [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}] {log.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10 max-w-5xl mx-auto"
                    >
                        <button 
                            onClick={() => setSelectedDoc(null)}
                            className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-all" />
                            Back to Intelligence Briefs
                        </button>

                        <div className="bg-[#0a0a0f] border border-white/5 rounded-[50px] overflow-hidden shadow-2xl">
                            <div className="p-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[30px] bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl">
                                        {category === "docs" ? <Brain className="w-10 h-10 text-emerald-500" /> : <Lock className="w-10 h-10 text-emerald-500" />}
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedDoc.title}</h2>
                                        <div className="flex items-center gap-6 mt-4">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" /> Priority One Guidance
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Global Response Initiative
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-16 prose prose-invert max-w-none prose-emerald prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-p:text-slate-400 prose-p:leading-relaxed prose-code:text-emerald-400 prose-code:bg-emerald-500/5 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-[20px] custom-scrollbar">
                                <ReactMarkdown>{selectedDoc.content_md}</ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
