"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, Download, File } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgDocumentsPage() {
    const [docs, setDocs] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/org/documents").then(d => setDocs((d as any)?.documents || [])).catch(() => {});
    }, []);

    const statusColor = (s: string) => {
        if (s === "published") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (s === "draft") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (s === "under_review") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><FileText className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Documents</h1></div>
            <div className="grid gap-3">
                {docs.map((doc, i) => (
                    <motion.div key={doc.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <File className="w-4 h-4 text-emerald-400 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-[9px] text-slate-500">
                                        <span className="uppercase">{doc.type}</span>
                                        <span>{doc.size}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                        <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase ${statusColor(doc.status)}`}>{doc.status.replace("_", " ")}</span>
                                    </div>
                                </div>
                            </div>
                            <Download className="w-4 h-4 text-slate-500 hover:text-emerald-400 cursor-pointer" />
                        </div>
                    </motion.div>
                ))}
                {docs.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No documents found</p>}
            </div>
        </div>
    );
}
