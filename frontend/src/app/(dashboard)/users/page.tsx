"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Shield, Key, UserPlus, Search, ShieldAlert,
    CheckCircle, XCircle, Lock, Unlock, Trash2, Edit2,
    Eye, RefreshCw, Activity, X, Crown, Terminal, User,
    AlertTriangle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleGate } from "@/lib/rbac/guards";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────
type UserRole = string;

interface DBUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    orgId: string | null;
    organization: { name: string; plan: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
    "ADMIN":           { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",     icon: Crown },
    "admin":           { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",     icon: Crown },
    "RED_TEAM":        { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20", icon: Terminal },
    "ANALYST":         { color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20",     icon: Shield },
    "AUDITOR":         { color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20",icon: Eye },
    "SUSPENDED":       { color: "text-red-500",     bg: "bg-red-900/20 border-red-900/30",     icon: AlertTriangle },
    "USER":            { color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20", icon: User },
};

const getRoleConfig = (role: string) =>
    ROLE_CONFIG[role] ?? { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", icon: User };

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await apiClient("/api/users", { method: "POST", json: form });
            setSuccess(true);
            setTimeout(() => { onCreated(); onClose(); setSuccess(false); setForm({ name: "", email: "", password: "", role: "USER" }); }, 1000);
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    if (!open) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0D1017] border border-white/10 rounded-[4px] w-full max-w-md mx-4 overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <UserPlus className="w-4 h-4 text-sky-400" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Provision New Operator</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[2px] text-xs text-red-400 font-mono">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px] text-xs text-emerald-400 font-mono flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5" /> Operator provisioned successfully
                            </div>
                        )}

                        {[
                            { label: "Full Name", key: "name", placeholder: "Youssef El Amrani", type: "text" },
                            { label: "Institutional Email", key: "email", placeholder: "name@ibt.ac.ma", type: "email" },
                            { label: "Password", key: "password", placeholder: "••••••••", type: "password" },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">{f.label}</label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={(form as any)[f.key]}
                                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/5 rounded-[2px] px-4 py-2.5 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-sky-500/40 transition-colors font-mono"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Access Role</label>
                            <select
                                value={form.role}
                                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full bg-black/40 border border-white/5 rounded-[2px] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 transition-colors"
                            >
                                <option value="USER">Viewer (USER)</option>
                                <option value="ANALYST">Security Analyst</option>
                                <option value="AUDITOR">Auditor</option>
                                <option value="RED_TEAM">Red Team Operator</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2.5 border border-white/5 rounded-[2px] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-sky-500/10 border border-sky-500/30 rounded-[2px] text-[10px] font-black text-sky-400 uppercase tracking-widest hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            {loading ? "Provisioning..." : "Provision Access"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
function ConfirmDeleteModal({ user, onClose, onDeleted }: { user: DBUser; onClose: () => void; onDeleted: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await apiClient(`/api/users/${user.id}`, { method: "DELETE" });
            onDeleted();
            onClose();
        } catch { } finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="bg-[#0D1017] border border-red-500/20 rounded-[4px] w-full max-w-sm mx-4 p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Revoke Access</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6 font-mono">
                    Permanently delete <span className="text-white font-bold">{user.name || user.email}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-white/5 rounded-[2px] text-[10px] font-black text-slate-500 uppercase">Cancel</button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2 bg-red-500/10 border border-red-500/30 rounded-[2px] text-[10px] font-black text-red-400 uppercase flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Confirm Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DBUser | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient<{ users: DBUser[] }>("/api/users");
            if (data.users) setUsers(data.users);
        } catch (e) {
            console.error("Failed to fetch users:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSuspend = async (user: DBUser) => {
        const isSuspended = user.role === "SUSPENDED";
        setActionLoading(user.id);
        try {
            await apiClient(`/api/users/${user.id}`, { method: "PATCH", json: { suspended: !isSuspended } });
            await fetchUsers();
        } finally { setActionLoading(null); }
    };

    const filtered = users.filter(u => {
        const matchSearch =
            (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchRole = roleFilter === "All" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.role !== "SUSPENDED").length,
        suspended: users.filter(u => u.role === "SUSPENDED").length,
        admins: users.filter(u => u.role === "ADMIN" || u.role === "admin").length,
    };

    return (
        <RoleGate roles={["SUPER_ADMIN", "ORG_ADMIN"]} fallback={
            <div className="h-full p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
                    <h2 className="text-lg font-bold text-slate-400">Access Restricted</h2>
                    <p className="text-slate-600 text-sm">You need admin privileges to manage users.</p>
                </div>
            </div>
        }>
            <div className="h-full p-6 lg:p-8 space-y-6">
            {showModal && (
                <AddUserModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onCreated={fetchUsers}
                />
            )}
            {deleteTarget && (
                <ConfirmDeleteModal
                    user={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={fetchUsers}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-6 h-6 bg-sky-500/10 border border-sky-500/20 rounded-[2px] flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <h1 className="text-lg font-black text-white uppercase tracking-[0.2em]">Operator Management</h1>
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-[1px] text-[8px] font-black text-red-400 uppercase tracking-widest">Admin Only</span>
                    </div>
                    <p className="text-slate-600 text-xs font-mono pl-9">
                        Real-time RBAC — Université Ibn Tofail Cyber Lab
                        {!loading && <span className="text-emerald-600 ml-2">· {users.length} operators in DB</span>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 border border-white/5 rounded-[2px] text-slate-600 hover:text-sky-400 hover:border-sky-500/20 transition-colors"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/10 border border-sky-500/30 rounded-[2px] text-sky-400 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-all"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Provision User
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Operators", value: stats.total, icon: Users, color: "text-sky-400", border: "border-sky-500/20" },
                    { label: "Active Accounts", value: stats.active, icon: Activity, color: "text-emerald-400", border: "border-emerald-500/20" },
                    { label: "Administrators", value: stats.admins, icon: Key, color: "text-amber-400", border: "border-amber-500/20" },
                    { label: "Suspended", value: stats.suspended, icon: ShieldAlert, color: "text-red-400", border: "border-red-500/20" },
                ].map(s => (
                    <div key={s.label} className={cn("p-5 bg-[#0D1017] border rounded-[4px] flex items-center gap-4", s.border)}>
                        <div className="p-2 rounded-[2px] bg-white/5"><s.icon className={cn("w-4 h-4", s.color)} /></div>
                        <div>
                            <div className={cn("text-2xl font-black", s.color)}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : s.value}
                            </div>
                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table + Side Panel */}
            <div className="flex gap-6">
                <div className="flex-1 min-w-0 bg-[#0D1017] border border-white/5 rounded-[4px] overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-black/20">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <input
                                type="text"
                                placeholder="Search operators..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-[2px] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-sky-500/30 font-mono"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded-[2px] px-3 py-2 text-xs text-slate-400 focus:outline-none appearance-none"
                        >
                            <option value="All">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="RED_TEAM">Red Team</option>
                            <option value="ANALYST">Analyst</option>
                            <option value="AUDITOR">Auditor</option>
                            <option value="USER">User</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                        <span className="text-[9px] font-mono text-slate-700 ml-auto">
                            {filtered.length}/{users.length} operators
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/10">
                                    {["Operator", "Role", "Organization", "Member Since", "Last Action", ""].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-slate-700 font-mono text-xs uppercase tracking-widest">
                                            No operators match filter
                                        </td>
                                    </tr>
                                ) : filtered.map(user => {
                                    const cfg = getRoleConfig(user.role);
                                    const RoleIcon = cfg.icon;
                                    const isSuspended = user.role === "SUSPENDED";
                                    const isSelected = selectedUser?.id === user.id;
                                    return (
                                        <motion.tr
                                            key={user.id}
                                            onClick={() => setSelectedUser(isSelected ? null : user)}
                                            className={cn(
                                                "border-b border-white/[0.03] cursor-pointer transition-colors group",
                                                isSelected ? "bg-sky-500/5" : "hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-7 h-7 rounded-[2px] flex items-center justify-center text-[10px] font-black border", cfg.bg, cfg.color)}>
                                                        {(user.name || user.email || "??").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{user.name || "—"}</div>
                                                        <div className="text-[9px] font-mono text-slate-600">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-[1px] border text-[9px] font-black uppercase tracking-wider", cfg.bg, cfg.color)}>
                                                    <RoleIcon className="w-2.5 h-2.5" />
                                                    {user.role}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[10px] font-mono text-slate-500">
                                                {user.organization?.name || "—"}
                                                {user.organization?.plan && (
                                                    <span className="ml-2 text-[8px] text-slate-700 uppercase">[{user.organization.plan}]</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-[10px] font-mono text-slate-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-[10px] font-mono text-slate-600">
                                                {timeAgo(user.updatedAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleSuspend(user); }}
                                                        disabled={actionLoading === user.id}
                                                        className="p-1.5 rounded-[2px] text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                                        title={isSuspended ? "Restore" : "Suspend"}
                                                    >
                                                        {actionLoading === user.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : isSuspended ? (
                                                            <Unlock className="w-3 h-3" />
                                                        ) : (
                                                            <Lock className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); setDeleteTarget(user); }}
                                                        className="p-1.5 rounded-[2px] text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-black/10">
                        <span className="text-[9px] font-mono text-slate-700">
                            Source: Prisma SQLite DB · Real-time data
                        </span>
                        <div className="flex items-center gap-1.5 text-[8px] text-slate-700 font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <AnimatePresence>
                    {selectedUser && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 280 }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            className="shrink-0 bg-[#0D1017] border border-white/5 rounded-[4px] overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Operator Profile</span>
                                <button onClick={() => setSelectedUser(null)} className="text-slate-700 hover:text-slate-300 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className={cn("w-14 h-14 rounded-[4px] flex items-center justify-center text-xl font-black border-2", getRoleConfig(selectedUser.role).bg, getRoleConfig(selectedUser.role).color)}>
                                        {(selectedUser.name || selectedUser.email || "??").slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-black text-white">{selectedUser.name || "No name"}</div>
                                        <div className="text-[10px] font-mono text-slate-600">{selectedUser.email}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: "Role", value: selectedUser.role },
                                        { label: "Organization", value: selectedUser.organization?.name || "—" },
                                        { label: "Plan", value: selectedUser.organization?.plan || "—" },
                                        { label: "User ID", value: selectedUser.id.slice(0, 12) + "..." },
                                        { label: "Member Since", value: new Date(selectedUser.createdAt).toLocaleDateString() },
                                        { label: "Last Updated", value: timeAgo(selectedUser.updatedAt) },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-start text-xs gap-2">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest shrink-0">{item.label}</span>
                                            <span className="font-mono text-slate-300 text-[10px] text-right truncate">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => { handleSuspend(selectedUser); setSelectedUser(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 rounded-[2px] text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        {selectedUser.role === "SUSPENDED" ? <><Unlock className="w-3 h-3" />Restore Access</> : <><Lock className="w-3 h-3" />Suspend Access</>}
                                    </button>
                                    <button
                                        onClick={() => { setDeleteTarget(selectedUser); setSelectedUser(null); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-[2px] text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" /> Revoke & Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        </RoleGate>
    );
}
