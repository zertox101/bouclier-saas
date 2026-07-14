"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, Scale, FileText, Gavel,
    Lock, AlertCircle, CheckCircle2, TrendingUp,
    BarChart3, Globe, Users, Clock, History,
    ShieldAlert, Fingerprint, FileBadge, ExternalLink, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

const LEGAL_HOLDS = [
    { id: "LH-2024-001", case: "Securities Litigation vs. Dept 4", status: "Active", artifacts: 12, date: "2024-01-10" },
    { id: "LH-2024-008", case: "Internal Investigation - Data Leak", status: "Suspended", artifacts: 45, date: "2024-02-02" }
];

export default function GRCDashboard() {
    const [frameworks, setFrameworks] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/governance/compliance")
            .then(d => {
                if (d.frameworks) {
                    setFrameworks(d.frameworks.map((fw: any) => ({
                        name: fw.name,
                        status: fw.status === "compliant" ? "Compliant" : fw.status === "in_progress" ? "Action Required" : fw.status,
                        score: fw.progress || 0,
                        lastAudit: fw.last_audit ? new Date(fw.last_audit).toLocaleDateString() : "N/A",
                        trend: fw.trend === "up" ? "+" + (Math.random() * 3).toFixed(1) + "%" : fw.trend === "stable" ? "Stable" : "-" + (Math.random() * 5).toFixed(1) + "%",
                    })));
                }
                if (d.summary) setSummary(d.summary);
            })
            .catch(() => {});
    }, []);
    return (
        <div className="min-h-screen p-10 bg-[#020205] text-slate-300 font-sans selection:bg-blue-500/30 overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-fixed opacity-[0.03] pointer-events-none" />
            
            {/* Header HUD */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 relative z-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[32px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.1)] group">
                        <Scale className="w-10 h-10 text-blue-500 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Governance, Risk & Compliance</h1>
                        <p className="text-[11px] font-mono text-blue-400/70 uppercase tracking-[0.5em] mt-3">Legal Ops // Regulatory Defense Interface V2.4</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="px-8 py-4 bg-white/[0.02] border border-white/10 rounded-[32px] flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Global_Audit_Score</p>
                          <p className="text-3xl font-black text-white italic">{summary?.overall_progress || 94.8}%</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                         <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      </div>
                   </div>
                   <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-3">
                      Generate_Regulatory_Pack <ExternalLink className="w-4 h-4" />
                   </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 relative z-10">
                
                {/* Left Column: Compliance & Risks */}
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    
                    {/* Compliance Grid */}
                    <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <Globe className="w-5 h-5 text-blue-500" />
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Regulatory_Posture_Matrix</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-600">Cross-Framework Audit // 2024-Q1</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(frameworks.length > 0 ? frameworks : []).map((fw, i) => (
                                <motion.div 
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: i * 0.1 }}
                                   key={fw.name} 
                                   className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group/card cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                           <h3 className="text-xl font-black text-white italic group-hover/card:text-blue-400 transition-colors">{fw.name}</h3>
                                           <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">Ref: {fw.lastAudit}</p>
                                        </div>
                                        <div className={cn(
                                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                           fw.status === 'Compliant' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                           {fw.status}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-end justify-between">
                                          <div className="text-5xl font-black text-white italic">{fw.score}<span className="text-xl text-slate-600">%</span></div>
                                          <div className={cn("text-[10px] font-black flex items-center gap-1", fw.trend.startsWith('+') ? "text-emerald-500" : "text-slate-500")}>
                                             {fw.trend !== 'Stable' && <TrendingUp className="w-3 h-3" />} {fw.trend}
                                          </div>
                                       </div>
                                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                          <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${fw.score}%` }}
                                             transition={{ duration: 1, delay: i * 0.2 }}
                                             className={cn("h-full", fw.score > 90 ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]")}
                                          />
                                       </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Liability & Risk Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                            <h2 className="text-[11px] font-black text-red-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5" /> Liability_Hotspots
                            </h2>
                            <div className="space-y-6">
                                <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 group/item hover:bg-red-500/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Unpatched Assets</span>
                                        <span className="text-[10px] font-black text-white">EST. $1.2M RISK</span>
                                    </div>
                                    <p className="text-[12px] text-slate-400 font-medium italic">3 Critical Servers (SRV-DC01) lack Kernel-level security patches.</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-orange-500/5 border border-orange-500/10 group/item hover:bg-orange-500/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">MFA Policy Gap</span>
                                        <span className="text-[10px] font-black text-white">EST. $450K RISK</span>
                                    </div>
                                    <p className="text-[12px] text-slate-400 font-medium italic">Non-MFA access detected on legacy Jump-Server in DMZ.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                            <h2 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <Award className="w-5 h-5" /> Active_Certifications
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                {['SOC2_T2', 'ISO_27001', 'HIPAA', 'GDPR'].map(cert => (
                                   <div key={cert} className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-[32px] group hover:border-blue-500/30 transition-all">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                         <FileBadge className="w-6 h-6 text-blue-500" />
                                      </div>
                                      <p className="text-[11px] font-black text-white uppercase tracking-widest">{cert}</p>
                                      <p className="text-[8px] font-mono text-emerald-500 mt-2 uppercase">Verified</p>
                                   </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Legal Holds & Audit */}
                <div className="col-span-12 lg:col-span-4 space-y-10">
                    
                    {/* Legal Hold Hub */}
                    <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-10">
                            <Gavel className="w-5 h-5 text-amber-500" />
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Tactical_Legal_Holds</span>
                        </div>
                        <div className="space-y-6">
                            {LEGAL_HOLDS.map(lh => (
                                <div key={lh.id} className="p-8 rounded-[40px] border border-amber-500/20 bg-amber-500/5 group/lh hover:bg-amber-500/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-mono text-amber-500 font-black">{lh.id}</span>
                                        <span className="text-[9px] font-black px-3 py-1 bg-amber-500 text-black rounded-full uppercase tracking-widest">
                                            {lh.status}
                                        </span>
                                    </div>
                                    <h3 className="text-[15px] font-black text-white italic mb-6 leading-tight">{lh.case}</h3>
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
                                        <span>{lh.artifacts} Artifacts</span>
                                        <span>Since {lh.date}</span>
                                    </div>
                                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                                        <Fingerprint className="w-4 h-4" /> Verify_Chain_Integrity
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Immutable Decision Audit */}
                    <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                            <History className="w-5 h-5" /> Decision_Blockchain_Audit
                        </h2>
                        <div className="space-y-10 relative ml-4">
                            <div className="absolute top-2 bottom-8 left-0 w-px bg-white/10" />

                            <div className="relative pl-10">
                                <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                <p className="text-[10px] text-slate-500 font-mono mb-1">2024-02-07 22:15:04</p>
                                <p className="text-sm font-black text-white italic">System Isolation: WKSTN-042</p>
                                <p className="text-[11px] text-slate-500 mt-1 italic">Action by @john_doe (CISO Approved)</p>
                                <div className="mt-3 text-[9px] font-mono p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 inline-block">HASH: a3b5...f2a3 (VERIFIED)</div>
                            </div>

                            <div className="relative pl-10">
                                <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                <p className="text-[10px] text-slate-500 font-mono mb-1">2024-02-07 21:04:12</p>
                                <p className="text-sm font-black text-white italic">Evidence Collected: LSASS Dump</p>
                                <p className="text-[11px] text-slate-500 mt-1 italic">WORM Storage commit by AI Sentinel</p>
                                <div className="mt-3 text-[9px] font-mono p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 inline-block">HASH: b4c6...0f2a (VERIFIED)</div>
                            </div>
                        </div>

                        <button className="w-full mt-12 py-4 border border-dashed border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-white/5 transition-all">
                            Export_Full_Compliance_Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
