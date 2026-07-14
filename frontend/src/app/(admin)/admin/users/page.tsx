"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users as UsersIcon, Mail, Calendar, UserPlus, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
    ORG_ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    ANALYST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
const ORG_OPTIONS = [
    { id: "00000000-0000-0000-0000-000000000002", name: "Startup Shield (FREE)" },
    { id: "00000000-0000-0000-0000-000000000001", name: "Bouclier Enterprise (PRO)" },
    { id: "00000000-0000-0000-0000-000000000003", name: "MegaCorp Defense (ENTERPRISE)" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [showInvite, setShowInvite] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");

    const loadUsers = async () => {
        try {
            const data = await apiClient<any[]>("/api/admin/users");
            setUsers(data);
        } catch { setUsers([]); }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setInviting(true);
        setInviteError("");
        const form = new FormData(e.currentTarget);
        try {
            await apiClient("/api/admin/users", {
                method: "POST",
                json: {
                    username: form.get("username"),
                    email: form.get("email"),
                    password: form.get("password"),
                    role: form.get("role"),
                    org_id: form.get("org_id"),
                    plan: form.get("plan") || "FREE",
                },
            });
            setShowInvite(false);
            loadUsers();
        } catch (err: any) {
            setInviteError(err?.data?.detail || err.message || "Failed to create user");
        } finally { setInviting(false); }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <UsersIcon className="w-6 h-6 text-purple-400" />
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                </div>
                <button onClick={() => setShowInvite(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Invite User
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Org</th>
                            <th className="text-left p-3">Plan</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u.id || i} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="p-3 text-white font-medium">{u.username || u.name || "N/A"}</td>
                                <td className="p-3 text-slate-400">{u.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${ROLE_COLORS[u.role] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>{u.role}</span>
                                </td>
                                <td className="p-3 text-slate-400">{u.org_name || u.org_id?.slice(0, 8) || "—"}</td>
                                <td className="p-3"><span className="text-[9px] font-mono text-slate-500">{u.plan}</span></td>
                                <td className="p-3"><span className={`inline-block w-2 h-2 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`} /></td>
                                <td className="p-3 text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="text-xs text-slate-500 text-center py-8">No users found</p>}
            </div>

            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-purple-400" /> Invite User</h2>
                            <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Username</label>
                                <input name="username" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</label>
                                <input name="email" type="email" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Password</label>
                                <input name="password" type="password" required minLength={6} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Role</label>
                                    <select name="role" defaultValue="ANALYST" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none">
                                        <option value="ANALYST">ANALYST</option>
                                        <option value="ORG_ADMIN">ORG_ADMIN</option>
                                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Plan</label>
                                    <select name="plan" defaultValue="FREE" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none">
                                        <option value="FREE">FREE</option>
                                        <option value="PRO">PRO</option>
                                        <option value="ENTERPRISE">ENTERPRISE</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Organization</label>
                                <select name="org_id" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none">
                                    <option value="">Select an organization...</option>
                                    {ORG_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            {inviteError && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{inviteError}</p>}
                            <button type="submit" disabled={inviting}
                                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create User"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
