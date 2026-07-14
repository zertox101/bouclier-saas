"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Mail, Calendar, UserPlus, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const ROLE_COLORS: Record<string, string> = {
    ORG_ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    ANALYST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function OrgUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");

    const loadUsers = async () => {
        try {
            const data = await apiClient<any[]>("/api/org/users");
            setUsers(Array.isArray(data) ? data : []);
        } catch { setUsers([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadUsers(); }, []);

    const activeUsers = users.filter((u: any) => u.is_active).length;
    const pendingInvites = users.filter((u: any) => !u.is_active).length;

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setInviting(true);
        setInviteError("");
        const form = new FormData(e.currentTarget);
        try {
            await apiClient("/api/org/users", {
                method: "POST",
                json: {
                    username: form.get("username"),
                    email: form.get("email"),
                    password: form.get("password"),
                    role: form.get("role"),
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
                    <Users className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl font-bold text-white">Organization Users</h1>
                </div>
                <button onClick={() => setShowInvite(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Invite User
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Users", value: users.length, icon: Users, color: "text-emerald-400" },
                    { label: "Active", value: activeUsers, icon: Shield, color: "text-blue-400" },
                    { label: "Pending", value: pendingInvites, icon: Calendar, color: "text-amber-400" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /><span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="text-left p-3">Username</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(loading ? [] : users).map((u, i) => (
                            <tr key={u.id || i} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="p-3 text-white font-medium">{u.username || u.name}</td>
                                <td className="p-3 text-slate-400">{u.email}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${ROLE_COLORS[u.role] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>{u.role}</span>
                                </td>
                                <td className="p-3"><span className={`inline-block w-2 h-2 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-amber-500"}`} /></td>
                                <td className="p-3 text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                            </tr>
                        ))}
                        {!loading && users.length === 0 && <tr><td colSpan={5} className="p-6 text-xs text-slate-500 text-center">No users found. Invite your first team member.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-400" /> Invite User</h2>
                            <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Username</label>
                                <input name="username" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</label>
                                <input name="email" type="email" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Password</label>
                                <input name="password" type="password" required minLength={6} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Role</label>
                                <select name="role" defaultValue="ANALYST" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                                    <option value="ANALYST">ANALYST</option>
                                    <option value="ORG_ADMIN">ORG_ADMIN</option>
                                </select>
                            </div>
                            {inviteError && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{inviteError}</p>}
                            <button type="submit" disabled={inviting}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create User"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
