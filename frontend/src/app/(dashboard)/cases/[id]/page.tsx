"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, Activity, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Terminal, Clock, MapPin, UserCheck, Shield, ExternalLink, ActivitySquare } from "lucide-react"
import { apiClient } from '@/lib/api-client'

export default function CaseDetailPage({ params }: { params: { id: string } }) {
    const [caseData, setCaseData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCase = async () => {
            setLoading(true)
            try {
                const data = await apiClient(`/api/cases/${params.id}`)
                setCaseData(data)
                setError(null)
            } catch (err) {
                console.error(err)
                setCaseData(null)
                setError("Unable to load case file.")
            } finally {
                setLoading(false)
            }
        }
        fetchCase()
    }, [apiBase, params.id])

    const timeline = caseData?.timeline || []
    const linkedAlerts = caseData?.alerts || []

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 pb-12">

            <div className="flex items-center gap-4 mb-2">
                <Link href="/cases" className="h-10 w-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all group">
                    <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Incident Registry</span>
                    <ChevronRight className="h-3 w-3 text-slate-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">#{params.id.slice(0, 8)}</span>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <Activity className="w-12 h-12 text-cyan-400 animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Decrypting Case File...</span>
                </div>
            )}

            {error && !loading && (
                <div className="premium-card p-8 border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center text-center gap-4 py-20">
                    <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
                    <div>
                        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">Decryption Failed</h3>
                        <p className="text-[10px] font-mono text-red-500/60 uppercase">{error}</p>
                    </div>
                </div>
            )}

            {!loading && !caseData && !error && (
                <div className="premium-card p-8 border-white/10 flex flex-col items-center justify-center text-center gap-4 py-20 opacity-50">
                    <ShieldAlert className="h-16 w-16 text-slate-500 mb-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">File Not Found in Registry</span>
                </div>
            )}

            {caseData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                    {/* Header Card */}
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Shield className="w-64 h-64 text-cyan-400" />
                        </div>

                        <div className="p-10 relative z-10 border-b border-white/5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                        {caseData.title || "Classified Incident"}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${caseData.status === "closed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                caseData.status === "triage" ? "bg-warning/10 text-warning border-warning/20 shadow-[0_0_15px_rgba(255,190,0,0.1)]" :
                                                    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                            }`}>
                                            STATUS: {caseData.status || "triage"}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                            <Clock className="w-3.5 h-3.5" />
                                            OPENED: {new Date(caseData.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/10 shrink-0">
                                    <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                                        {caseData.assigned_to ? caseData.assigned_to[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Lead Investigator</span>
                                        <span className="text-xs font-bold text-white uppercase truncate max-w-[150px]">
                                            {caseData.assigned_to || "Unassigned"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            <div className="p-8 pb-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6 flex items-center gap-2">
                                    <ActivitySquare className="w-4 h-4" /> Operational Checklist
                                </h3>

                                {Array.isArray(caseData.checklist) && caseData.checklist.length > 0 ? (
                                    <ul className="space-y-4">
                                        {caseData.checklist.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 group cursor-default">
                                                <div className="mt-0.5 h-3.5 w-3.5 rounded-sm border border-slate-600 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                                                    {i === 0 && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                                                </div>
                                                <span className={`text-[11px] leading-relaxed ${i === 0 ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-[10px] text-slate-500 italic uppercase">No standard operating procedure defined.</div>
                                )}
                            </div>

                            <div className="p-8 md:col-span-2 pb-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-6 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Correlated Alerts ({linkedAlerts.length})
                                </h3>

                                {linkedAlerts.length === 0 ? (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-[10px] uppercase font-bold text-slate-500">
                                        No threat vectors currently linked to this operation.
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {linkedAlerts.map((alert: any) => (
                                            <Link key={alert.id} href={`/alerts/${alert.id}`}>
                                                <div className="group bg-white/[0.02] border border-white/5 hover:border-red-500/30 hover:bg-white/[0.04] p-4 rounded-xl transition-all h-full flex flex-col justify-between cursor-pointer relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                                        <Activity className="w-10 h-10 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${alert.severity === "critical" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                                                                    alert.severity === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                                                        "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                                                }`}>
                                                                {alert.severity?.toUpperCase() || "UNKNOWN"}
                                                            </span>
                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 transition-colors" />
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors mb-2 line-clamp-2">
                                                            {alert.rule_id}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                                        <span className="text-[9px] font-mono text-slate-500">STATE: {alert.state || "NEW"}</span>
                                                        <span className="text-[9px] font-mono text-slate-600">ID: {alert.id.slice(0, 6)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="premium-card p-0 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-cyan-400" /> Event Timeline
                            </h3>
                        </div>

                        <div className="p-6 md:p-10">
                            {timeline.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <Clock className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                                    <span className="text-[10px] uppercase font-bold text-slate-400">No chronological data available.</span>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                    {timeline.map((entry: any, idx: number) => (
                                        <div key={`${entry.timestamp}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#08080c] bg-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 text-slate-500 group-hover:text-cyan-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all">
                                                <Activity className="w-4 h-4" />
                                            </div>

                                            {/* Content */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/[0.02] border border-white/5 p-4 rounded-2xl group-hover:border-cyan-500/20 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                                                        {entry.actor || "Automated System"}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-slate-500">
                                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                    {entry.note || entry.description || "Status updated"}
                                                </p>
                                                <div className="mt-3 pt-2 border-t border-white/5">
                                                    <span className="text-[8px] font-mono text-slate-600 uppercase">
                                                        {new Date(entry.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
