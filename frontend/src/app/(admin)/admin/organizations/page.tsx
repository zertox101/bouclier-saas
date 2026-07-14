"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building, Calendar, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AdminOrganizationsPage() {
    const [orgs, setOrgs] = useState<any[]>([]);

    useEffect(() => {
        apiClient("/api/admin/organizations").then(d => setOrgs((d as any)?.organizations || [])).catch(() => {});
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><Building className="w-6 h-6 text-purple-400" /><h1 className="text-2xl font-bold text-white">Organizations</h1></div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Create Org</button>
            </div>
            <div className="grid gap-3">
                {orgs.map((org, i) => (
                    <motion.div key={org.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div><h3 className="text-sm font-bold text-white">{org.name}</h3><p className="text-[10px] text-slate-500">{org.slug || org.id}</p></div>
                            <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{org.user_count || org.users_count || 0}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{org.created_at ? new Date(org.created_at).toLocaleDateString() : "N/A"}</span>
                                <span className={`px-2 py-0.5 rounded border text-[9px] uppercase ${org.plan === "enterprise" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>{org.plan || "free"}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {orgs.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No organizations found</p>}
            </div>
        </div>
    );
}
