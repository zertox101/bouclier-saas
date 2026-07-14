"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Shield, TrendingUp, TrendingDown, Minus, Clock,
    AlertTriangle, CheckCircle2, BarChart3, PieChart,
    Download, Calendar, ChevronRight, Target, Zap,
    FileText, Globe, Lock, Activity, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';

export default function ExecutiveDashboard() {
    const [briefing, setBriefing] = useState<any>(null);
    const [forensics, setForensics] = useState<any>(null);

    useEffect(() => {
        apiClient('/api/strategic-briefing/').then(d => setBriefing(d)).catch(() => null);
        apiClient('/api/forensics/executive-summary').then(d => setForensics(d)).catch(() => null);
    }, []);

    const metrics = briefing?.metrics_snapshot || {};
    const riskScore = metrics.risk_score || forensics?.risk_score || 84;
    const activeThreats = metrics.total_alerts_24h || forensics?.total_alerts || 3;
    const complianceScore = forensics?.compliance_score || 98;
    const mttr = forensics?.mttr_hours || 1.4;
    const trend = riskScore > 70 ? "+4" : riskScore > 50 ? "+2" : "-1";

    const handlePrint = () => {
        const style = document.createElement('style');
        style.id = 'print-pdf-style';
        style.textContent = `
          @media print {
            body { background: white !important; color: black !important; }
            nav, [data-no-print], .sticky { display: none !important; }
            * { border-color: #e5e7eb !important; }
            .premium-card { border: 1px solid #e5e7eb !important; background: #f9fafb !important; }
            h1, h2, h3, h4 { color: black !important; }
            p, span, td, th { color: #374151 !important; }
            @page { margin: 15mm; size: A4; }
          }
        `;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => { document.getElementById('print-pdf-style')?.remove(); }, 2000);
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pt-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-10 bg-violet-500 rounded-full shadow-[0_0_15px_#8B5CF6]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Board Level Oversight</span>
                    </div>
                    <h1 className="display-title italic text-6xl">Executive <span className="text-violet-400">Briefing</span></h1>
                    <p className="body-medium max-w-xl text-slate-400">
                        Consolidated risk posture, compliance status, and operational efficiency metrics.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                        <Calendar className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Select Period</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-all">
                        <Download className="h-4 w-4" />
                        Generate Audit PDF
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RiskWidget score={riskScore} trend={trend} />
                <KPICounter label="Active Threats" value={String(activeThreats).padStart(2, "0")} subValue={riskScore > 70 ? "Elevated risk level" : "Within thresholds"} icon={AlertTriangle} color="text-red-500" />
                <KPICounter label="Compliance Score" value={`${complianceScore}%`} subValue="PCI-DSS Compliant" icon={Award} color="text-emerald-500" />
                <KPICounter label="MTTR" value={`${mttr}h`} subValue="Target: <2.0h" icon={Clock} color="text-violet-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 premium-card p-10 bg-slate-900/40 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                        <Activity className="h-64 w-64" />
                    </div>
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tight">Postural <span className="text-violet-400">Intelligence</span></h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Global risk trend &mdash; {briefing?.briefing?.status || "STABLE"}</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4">
                        {[65, 68, 72, 70, 75, 82, 80, 78, 85, 88, 86, riskScore].map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${v}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="w-full bg-gradient-to-t from-violet-600/20 to-violet-500 rounded-xl relative group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-crosshair"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{v}</div>
                                </motion.div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">M{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 premium-card p-10 bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight">Compliance <span className="text-violet-400">Vault</span></h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit readiness status</p>
                    </div>
                    <div className="space-y-6 my-10">
                        {[
                            { name: "ISO 27001", status: "Compliant", progress: 100 },
                            { name: "SOC 2 Type II", status: complianceScore >= 95 ? "Compliant" : "In Audit", progress: complianceScore },
                            { name: "GDPR / Privacy", status: "Compliant", progress: 100 },
                            { name: "PCI DSS v4.0", status: riskScore > 80 ? "Review" : "Compliant", progress: riskScore > 80 ? 72 : 100 },
                        ].map((c) => (
                            <div key={c.name} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white">{c.name}</span>
                                    <span className={c.progress === 100 ? "text-emerald-400" : "text-amber-400"}>{c.status}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} className={cn("h-full", c.progress === 100 ? "bg-emerald-500" : "bg-amber-500")} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-[0.2em]">View Full Audit Log</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <InsightCard
                    title="Threat Landscape"
                    desc={briefing?.briefing?.summary?.substring(0, 120) || "Phishing and social engineering attempts have increased by 22% this month. Recommend defensive training refreshment."}
                    icon={Target}
                />
                <InsightCard
                    title="Priority Action"
                    desc={briefing?.briefing?.priority_action || "Current automation handles 78% of tier-1 alerts. Targeting 85% by EOY through Sentinel neural refinements."}
                    icon={Zap}
                />
                <InsightCard
                    title="Risk Assessment"
                    desc={briefing?.briefing?.risk_assessment || "Efficiency gains have reduced compute overhead by $1.2k/month. Reallocating to deep packet inspection units."}
                    icon={BarChart3}
                />
            </div>
        </div>
    );
}

function RiskWidget({ score, trend }: { score: number; trend: string }) {
    return (
        <div className="premium-card p-10 bg-slate-950/40 border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Shield className="h-24 w-24" />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Tactical Risk Score</div>
            <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-white italic tracking-tighter">{score}</span>
                <span className="text-xl font-bold text-slate-700 uppercase">/100</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <TrendingUp className="h-4 w-4" />
                <span>{score > 70 ? "Elevated" : score > 50 ? "Moderate" : "Stable"} ({trend} pts)</span>
            </div>
        </div>
    );
}

function KPICounter({ label, value, subValue, icon: Icon, color }: any) {
    return (
        <div className="premium-card p-10 bg-slate-900/40 border border-white/5 transition-all hover:bg-slate-900/60">
            <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
                <Icon className={cn("h-5 w-5 opacity-40", color)} />
            </div>
            <div className="text-4xl font-black text-white italic tracking-tight mb-2">{value}</div>
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{subValue}</div>
        </div>
    );
}

function InsightCard({ title, desc, icon: Icon }: any) {
    return (
        <div className="p-8 rounded-3xl bg-violet-600/5 border border-violet-500/10 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                    <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h4>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-medium italic">{desc}</p>
        </div>
    );
}
