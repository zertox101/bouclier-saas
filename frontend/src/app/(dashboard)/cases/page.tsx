"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, Activity, ChevronRight, Lock, Loader2, Globe, FileBadge } from "lucide-react"
import { apiClient } from '@/lib/api-client'

type CaseSummary = {
    id: string
    title: string
    status: string
    assigned_to?: string
    created_at: string
}

export default function CasesPage() {
    const [cases, setCases] = useState<CaseSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCases = async () => {
            setLoading(true)
            try {
                const data = await apiClient('/api/cases?limit=50')
                setCases(
                    Array.isArray(data)
                        ? data.map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            status: item.status || "triage",
                            assigned_to: item.assigned_to,
                            created_at: new Date(item.created_at).toLocaleString(),
                        }))
                        : []
                )
                setError(null)
            } catch (err) {
                console.error(err)
                setCases([])
                setError("Unable to load active incident cases.")
            } finally {
                setLoading(false)
            }
        }
        fetchCases()
    }, [apiBase])

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 pb-12">
            {/* Context Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white/[0.01] p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl">
                <div>
                    <div className="section-label flex items-center gap-2">
                        <FileBadge className="w-4 h-4 text-cyan-400" />
                        Incident Management
                    </div>
                    <h1 className="display-title mb-4">
                        Case <span className="text-cyan-400">Workspace.</span>
                    </h1>
                    <p className="text-text-2 text-sm max-w-xl leading-relaxed">
                        Track active investigations derived from Sentinel security alerts.
                        Assign operators, execute playbooks, and document threat actor containment.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="btn-cyber flex items-center gap-2 px-6 h-12">
                        <Activity className="w-4 h-4" /> Sync Registry
                    </button>
                </div>
            </div>

            {/* Cases List */}
            <div className="premium-card p-0 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-[11px] font-black text-white tracking-[0.2em] uppercase">Active Case Docket</h2>
                            <p className="text-[8px] text-slate-500 font-black uppercase mt-1 tracking-widest">{cases.length} Open Incidents</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Decrypting Case Files...</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest">System Error</h3>
                                <p className="text-[10px] font-mono mt-1 opacity-70">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && cases.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-40">
                            <Lock className="w-16 h-16 text-slate-400" />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">
                                No Active Cases <br />
                                <span className="text-[8px] opacity-50 block mt-2">Elevate an alert to open a new case</span>
                            </span>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {cases.map((item) => (
                            <Link key={item.id} href={`/cases/${item.id}`}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all group flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">#{item.id.slice(0, 8)}</span>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${item.status === "closed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    item.status === "triage" ? "bg-warning/10 text-warning border-warning/20" :
                                                        "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                                {item.assigned_to ? item.assigned_to[0].toUpperCase() : 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Assigned</span>
                                                <span className="text-[10px] text-white opacity-80 truncate max-w-[100px]">{item.assigned_to || "Unassigned"}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
