"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Shield, Terminal, Zap, Globe, Database, Server, Cpu, Wifi, Eye, Target, Loader2, Play, Activity, Crosshair, Map, Filter, Maximize2, X, ChevronRight, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { API_CONFIG } from "@/lib/api-config";
import TerminalShell from "./terminal/TerminalShell";

// Advanced Palantir-style Icons
const CATEGORY_ICONS: Record<string, any> = {
    "Network Tools": Wifi,
    "Web Exploitation": Crosshair,
    "OSINT": Globe,
    "Post-Exploitation": Server,
    "Exploit Development": Terminal,
    "Advanced": Cpu,
    "Intelligence": Shield,
    "Playbooks": Zap,
    "Audit": Activity,
};

type Tool = {
    id: string;
    name: string;
    description: string;
    category: string;
    version?: string;
    status?: string;
    risk_level?: string;
    installed?: boolean;
    url?: string;
    command?: string;
    mitre?: string;
    usage?: string;
    tactical?: string;
};

export default function ArsenalBrowser() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [target, setTarget] = useState("");
    const [isLaunching, setIsLaunching] = useState(false);
    const [lastJobId, setLastJobId] = useState<string | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [terminalTab, setTerminalTab] = useState<"logs" | "shell">("logs");

    useEffect(() => {
        apiClient("/api/tools")
            .then(d => {
                if (d.tools) {
                    setTools(d.tools.map((t: any) => ({ ...t, installed: true })));
                    setCategories(d.categories || []);
                }
            })
            .catch(() => {});
    }, []);
    const [jobStatus, setJobStatus] = useState<string>("idle");
    const [terminalMode, setTerminalMode] = useState<"minimized" | "expanded">("minimized");
    const [findings, setFindings] = useState<any[]>([]);
    const [reportUrl, setReportUrl] = useState<string | null>(null);
    const [remediatingIdx, setRemediatingIdx] = useState<number | null>(null);

    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLines]);

    useEffect(() => {
        if (!lastJobId) return;

        const pollLogs = async () => {
            try {
                const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/jobs/${lastJobId}`, {
                    headers: { "X-API-KEY": API_CONFIG.TOOLS_API_KEY }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.logs && data.logs.length > 0) {
                        const newLogs = data.logs.map((l: any) => `[${l.level.toUpperCase()}] ${l.message}`);
                        setTerminalLines(prev => {
                            const filtered = newLogs.filter((nl: string) => !prev.includes(nl));
                            return [...prev, ...filtered];
                        });
                    }
                    setJobStatus(data.status);
                    if (["completed", "failed", "stopped"].includes(data.status)) {
                        setTerminalLines(prev => [...prev, `Job ${lastJobId.substring(0,8)} finished with status: ${data.status}`, ""]);
                        if (data.findings) {
                            setFindings(data.findings.structured_findings || []);
                            if (data.findings.report_url) {
                                setReportUrl(`${API_CONFIG.TOOLS_API_BASE}${data.findings.report_url}`);
                            }
                        }
                    } else {
                        setTimeout(pollLogs, 1500);
                    }
                }
            } catch (err) { console.error(err); }
        };

        pollLogs();
    }, [lastJobId]);

    const handleLaunch = async () => {
        if (!selectedTool || !target) return;
        setIsLaunching(true);
        setFindings([]);
        setReportUrl(null);
        setTerminalLines(prev => [...prev, `kali@nexus:~$ ${selectedTool.command} ${target}`, ""]);
        setJobStatus("initiating...");
        setTerminalMode("expanded");
        
        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_CONFIG.TOOLS_API_KEY
                },
                body: JSON.stringify({
                    tool_id: selectedTool.toolId,
                    input: { target }
                })
            });
            if (res.ok) {
                const data = await res.json();
                setLastJobId(data.job_id);
            } else {
                setJobStatus("failed");
                setTerminalLines(prev => [...prev, "!! Error: API validation failed.", ""]);
            }
        } catch (err) {
            setJobStatus("failed");
            setTerminalLines(prev => [...prev, "!! Error: Uplink failure.", ""]);
        } finally {
            setIsLaunching(false);
        }
    };

    const handleRemediate = async (idx: number) => {
        if (!lastJobId) return;
        setRemediatingIdx(idx);
        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/remediation/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": API_CONFIG.TOOLS_API_KEY
                },
                body: JSON.stringify({
                    job_id: lastJobId,
                    finding_index: idx
                })
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                setTerminalLines(prev => [...prev, `[SUCCESS] Remediation executed for: ${data.finding_name}`, data.stdout, ""]);
            } else {
                setTerminalLines(prev => [...prev, `[ERROR] Remediation failed: ${data.stderr || "Unknown error"}`, ""]);
            }
        } catch (err) {
            setTerminalLines(prev => [...prev, "[ERROR] Uplink failure during remediation.", ""]);
        } finally {
            setRemediatingIdx(null);
        }
    };

    const filteredTools = useMemo(() => (tools.length > 0 ? tools : []).filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    }), [search, selectedCategory, tools]);

    return (
        <div className="h-full w-full bg-[#030508] text-[#e2e8f0] font-sans overflow-hidden flex flex-col selection:bg-blue-900 selection:text-white relative gotham-bg">
            <style>{`
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
                .gotham-bg {
                    background-image: radial-gradient(circle at 50% 50%, #0d1520 0%, #030508 100%);
                }
                .tool-card {
                    background: rgba(13, 21, 32, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tool-card:hover {
                    border-color: rgba(59, 130, 246, 0.3);
                    background: rgba(13, 21, 32, 0.9);
                    transform: translateY(-2px);
                }
                .tool-card.selected {
                    border-color: #2563eb;
                    background: rgba(37, 99, 235, 0.05);
                    box-shadow: 0 0 30px rgba(37, 99, 235, 0.1);
                }
            `}</style>

            {/* TOP HUD */}
            <header className="h-14 border-b border-white/5 bg-[#0A0C10]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-5 w-5 text-blue-500" />
                        <h1 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">KALI <span className="text-blue-500">ARSENAL</span></h1>
                    </div>
                </div>
                <div className="flex items-center gap-8 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" /> SYNC: STABLE</div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> NODE: KALI-MASTER-01</div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                
                {/* SEARCH & FILTERS BAR */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[600px] z-30">
                    <div className="relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                       <input
                           type="text"
                           placeholder="Search tactical toolsets..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full bg-[#0d1520]/80 backdrop-blur-2xl border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 outline-none transition-all shadow-2xl"
                       />
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                       <button onClick={() => setSelectedCategory(null)} className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", !selectedCategory ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10")}>ALL</button>
                       {categories.map(cat => (
                         <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", selectedCategory === cat ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10")}>{cat.replace(' Tools', '')}</button>
                       ))}
                    </div>
                </div>

                {/* GRID OF TOOLS */}
                <div className="flex-1 overflow-y-auto p-32 pt-40 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {filteredTools.map(tool => {
                            const isSelected = selectedTool?.name === tool.name;
                            const Icon = CATEGORY_ICONS[tool.category] || Target;
                            return (
                                <motion.div
                                    key={tool.name}
                                    layoutId={tool.name}
                                    onClick={() => setSelectedTool(tool)}
                                    className={cn("tool-card p-6 rounded-3xl cursor-pointer relative overflow-hidden group", isSelected && "selected")}
                                >
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors", isSelected ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500 group-hover:bg-blue-600/10 group-hover:text-blue-500")}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{tool.name}</h3>
                                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{tool.description}</p>
                                    
                                    <div className="mt-6 flex items-center justify-between">
                                       <span className="text-[9px] font-mono text-blue-500 font-bold">{tool.command}</span>
                                       {tool.mitre && <span className="text-[8px] font-black text-slate-600 border border-white/5 px-1.5 py-0.5 rounded uppercase">{tool.mitre}</span>}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* TOOL ACTION OVERLAY */}
                <AnimatePresence>
                   {selectedTool && (
                     <motion.div 
                        initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }}
                        className="w-[450px] border-l border-white/10 bg-[#0d1520]/95 backdrop-blur-3xl p-10 flex flex-col z-40 shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
                     >
                        <div className="flex justify-between items-start mb-10">
                           <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center">
                              <Zap className="w-8 h-8 text-blue-500" />
                           </div>
                           <button onClick={() => setSelectedTool(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{selectedTool.name}</h2>
                        <p className="text-[12px] text-slate-400 font-medium leading-relaxed mb-10">{selectedTool.description}</p>
                        
                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
                           <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Engagement Parameter</div>
                              <input 
                                 type="text" 
                                 placeholder="e.g. 192.168.1.1 or target.com"
                                 value={target}
                                 onChange={e => setTarget(e.target.value)}
                                 className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-sm font-mono text-blue-400 placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="text-[8px] font-black text-slate-500 uppercase mb-1">MITRE Map</div>
                                 <div className="text-xs font-black text-white">{selectedTool.mitre || "T1000"}</div>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                 <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Tactical</div>
                                 <div className="text-xs font-black text-blue-500">{selectedTool.tactical || "Generic"}</div>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-white/5">
                              <button 
                                 onClick={handleLaunch}
                                 disabled={isLaunching || !target}
                                 className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                              >
                                 {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                 Initialize Deployment
                              </button>
                           </div>

                           {/* Mythos Findings Section */}
                           {findings.length > 0 && (
                             <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                                <div className="flex items-center justify-between">
                                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Mythos Neural Findings</div>
                                   {reportUrl && (
                                     <a 
                                        href={reportUrl} 
                                        target="_blank" 
                                        className="text-[9px] font-black text-white bg-emerald-600/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-emerald-600/40 transition-all"
                                     >
                                        <Database className="w-3 h-3" /> Download Tactical Report
                                     </a>
                                   )}
                                </div>
                                
                                {findings.map((f, i) => (
                                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 group/finding">
                                     <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-white">{f.name}</h4>
                                        <span className={cn("text-[8px] font-black px-2 py-0.5 rounded uppercase", 
                                          f.severity === 'critical' ? 'bg-red-600 text-white' : 
                                          f.severity === 'high' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                                        )}>{f.severity}</span>
                                     </div>
                                     <p className="text-[10px] text-slate-500 mb-4">{f.description}</p>
                                     
                                     {f.remediation_script && (
                                       <div className="mt-4 pt-4 border-t border-white/5">
                                          <div className="text-[8px] font-black text-slate-600 uppercase mb-2">Remediation Script</div>
                                          <pre className="bg-black/50 p-3 rounded-lg text-[9px] font-mono text-emerald-400 overflow-x-auto mb-3 max-h-24 custom-scrollbar">
                                             {f.remediation_script}
                                          </pre>
                                          <button 
                                             onClick={() => handleRemediate(i)}
                                             disabled={remediatingIdx !== null}
                                             className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                          >
                                             {remediatingIdx === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                             Deploy Fix Sequence
                                          </button>
                                       </div>
                                     )}
                                  </div>
                                ))}
                             </div>
                           )}
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
            </div>

            {/* KALI TERMINAL BOTTOM OVERLAY — Interactive Shell + Job Logs */}
            <AnimatePresence>
                {(lastJobId || terminalTab === "shell") && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: terminalMode === "expanded" ? 0 : "calc(100% - 40px)" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        className="fixed bottom-0 left-0 right-0 h-[420px] bg-[#050505] border-t border-blue-500/30 flex flex-col z-[50] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
                    >
                        <div className="h-10 bg-[#0d1117] border-b border-white/5 flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                               <Terminal className="w-4 h-4 text-blue-500" />
                               <span className="text-[9px] font-black text-white uppercase tracking-widest">Nexus Tactical Shell — Kali Rolling</span>
                               {selectedTool && (
                                 <div className="flex gap-1 ml-4 border-l border-white/10 pl-4">
                                   <button onClick={() => setTerminalTab("logs")} className={cn("px-3 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-colors", terminalTab === "logs" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-white")}>Job Logs</button>
                                   <button onClick={() => setTerminalTab("shell")} className={cn("px-3 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-colors", terminalTab === "shell" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "text-slate-500 hover:text-white")}>Interactive Shell</button>
                                 </div>
                               )}
                               <div className="flex gap-2 items-center ml-2">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", jobStatus === 'running' ? "bg-amber-500 animate-pulse" : "bg-slate-500")} />
                                  <span className="text-[8px] font-black text-slate-500 uppercase">[{jobStatus}]</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <button onClick={() => setTerminalMode(prev => prev === "expanded" ? "minimized" : "expanded")}>
                                 {terminalMode === "expanded" ? <Minimize2 className="w-3.5 h-3.5 text-slate-500" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-500" />}
                               </button>
                               <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-500 cursor-pointer" onClick={(e) => { setLastJobId(null); setTerminalLines([]); setTerminalTab("logs"); }} />
                            </div>
                        </div>
                        {terminalTab === "logs" ? (
                          <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed custom-scrollbar selection:bg-blue-500 selection:text-white bg-[#050505]">
                             {terminalLines.length === 0 && (
                               <div className="text-slate-600 text-center mt-20 text-[10px] uppercase tracking-widest">No job running — launch a tool first</div>
                             )}
                             {terminalLines.map((line, i) => (
                               <div key={i} className={cn("mb-0.5 break-all",
                                 line.startsWith("kali@nexus") ? "text-emerald-500 font-bold" :
                                 line.startsWith("!!") ? "text-red-500" :
                                 line.includes("[ERROR]") ? "text-red-400" :
                                 line.includes("[SUCCESS]") ? "text-emerald-400" :
                                 "text-slate-300"
                               )}>
                                 {line}
                               </div>
                             ))}
                             {jobStatus === 'running' && (
                               <div className="w-2 h-4 bg-blue-500 animate-pulse mt-2" />
                             )}
                          </div>
                        ) : (
                          <div className="flex-1 relative bg-[#050505]">
                            <TerminalShell visible={true} wsUrl={typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8100/ws/shell` : 'ws://localhost:8100/ws/shell'} title="Kali Shell — root@nexus" />
                          </div>
                        )}
                    </motion.div>
                )}
                {!lastJobId && terminalTab !== "shell" && (
                  <button onClick={() => setTerminalTab("shell")} className="fixed bottom-6 right-6 z-[60] px-6 py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-600/30 transition-all flex items-center gap-3 shadow-2xl">
                    <Terminal className="w-4 h-4" /> Open Kali Terminal
                  </button>
                )}
            </AnimatePresence>
        </div>
    );
}
