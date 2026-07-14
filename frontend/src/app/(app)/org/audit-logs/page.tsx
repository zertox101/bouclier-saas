"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function OrgAuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/org/audit-logs").then(d => setLogs((d as any)?.logs || [])).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-4"><FileText className="w-6 h-6 text-emerald-400" /><h1 className="text-2xl font-bold text-white">Audit Logs</h1></div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead><tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]"><th className="text-left p-3">Timestamp</th><th className="text-left p-3">User</th><th className="text-left p-3">Action</th><th className="text-left p-3">IP</th><th className="text-left p-3">Status</th></tr></thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={log.id || i} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="p-3 text-slate-400 font-mono text-[9px]">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-3 text-white">{log.user}</td>
                                <td className="p-3 text-slate-300 font-mono text-[9px]">{log.action}</td>
                                <td className="p-3 text-slate-500 text-[9px]">{log.ip}</td>
                                <td className="p-3">{log.status === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No audit logs available</p>}
            </div>
        </div>
    );
}
