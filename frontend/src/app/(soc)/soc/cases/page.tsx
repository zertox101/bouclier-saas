"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SocCasesPage() {
    const [cases, setCases] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/investigation/cases").then(d => setCases((d as any)?.cases || [])).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><FolderOpen className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Investigation Cases</h1></div>
            <div className="grid gap-3">
                {(cases.length > 0 ? cases : []).map((c, i) => (
                    <motion.div key={c.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white">{c.title || c.name || `Case ${c.id || i + 1}`}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${c.status === "open" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : c.status === "closed" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>{c.status || "open"}</span>
                        </div>
                        <p className="text-xs text-slate-500">{c.description || c.summary || ""}</p>
                    </motion.div>
                ))}
                {cases.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No investigation cases</p>}
            </div>
        </div>
    );
}
