"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, FileText, Tag, Clock, User, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function PlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/soc/playbooks").then(d => setPlaybooks((d as any)?.playbooks || [])).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><FileText className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Playbooks</h1></div>
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all">Create Playbook</button>
            </div>
            <div className="grid gap-4">
                {playbooks.map((pb, i) => (
                    <motion.div key={pb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 hover:border-amber-500/30 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-sm font-bold text-white">{pb.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                                        pb.severity === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        pb.severity === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                        pb.severity === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                        "bg-green-500/10 text-green-400 border-green-500/20"
                                    }`}>{pb.severity}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                                        pb.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        pb.status === "draft" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                        pb.status === "testing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                    }`}>{pb.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {pb.category}</span>
                                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {pb.steps} steps</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pb.estimated_time}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {pb.owner}</span>
                                    <span className="flex items-center gap-1">{pb.version}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-[10px]">
                                    {pb.test_success_rate != null && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> {pb.test_success_rate}% test success</span>}
                                    {pb.last_tested && <span className="text-slate-500">Last tested: {new Date(pb.last_tested).toLocaleDateString()}</span>}
                                </div>
                            </div>
                            <button className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"><Play className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
