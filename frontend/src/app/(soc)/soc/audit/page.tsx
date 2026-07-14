"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function SocAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/admin/platform/audit-logs").then(d => setLogs((d as any)?.logs || (d as any)?.audit_logs || [])).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><FileText className="w-6 h-6 text-amber-400" /><h1 className="text-2xl font-bold text-white">Audit Log</h1></div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead><tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]"><th className="text-left p-3">Timestamp</th><th className="text-left p-3">User</th><th className="text-left p-3">Action</th><th className="text-left p-3">Status</th></tr></thead>
                        <tbody>
                            {(logs.length > 0 ? logs : []).map((log, i) => (
                                <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30">
                                    <td className="p-3 text-slate-400 font-mono">{log.timestamp || log.time || log.created_at || ""}</td>
                                    <td className="p-3 text-white">{log.user || log.username || log.email || ""}</td>
                                    <td className="p-3 text-slate-300">{log.action || log.event || log.description || ""}</td>
                                    <td className="p-3">{log.status === "success" || log.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-500">{log.status || ""}</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No audit logs available</p>}
            </div>
        </div>
    );
}
