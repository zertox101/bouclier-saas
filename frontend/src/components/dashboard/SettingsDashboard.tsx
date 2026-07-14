"use client";

import { useState, useEffect } from "react";
import {
    CreditCard, Key, Users, Shield, Zap,
    Settings, Save, Plus, Trash2, Copy,
    ExternalLink, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function SettingsDashboard() {
    const [activeTab, setActiveTab] = useState("billing");
    const [org, setOrg] = useState<any>(null);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient("/api/settings/org").catch(() => null),
            apiClient("/api/settings/api-keys").catch(() => []),
            apiClient("/api/settings/profile").catch(() => null),
        ]).then(([o, k, p]) => {
            setOrg(o);
            setApiKeys(k || []);
            setProfile(p);
            setLoading(false);
        });
    }, []);

    const tabs = [
        { id: "billing", label: "Billing & Plans", icon: CreditCard },
        { id: "api", label: "API Management", icon: Key },
        { id: "team", label: "Team & Access", icon: Users },
        { id: "security", label: "Global Security", icon: Shield },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pt-4">
                <div className="space-y-2">
                    <div className="section-label">Enterprise Control</div>
                    <h1 className="display-title italic">Organization <span className="text-violet-400">Settings</span></h1>
                    <p className="body-medium max-w-xl text-slate-400">
                        Manage your subscription, API integrations, and tactical team permissions.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border",
                                activeTab === tab.id
                                    ? "bg-violet-500/10 border-violet-500/30 text-white shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                                    : "bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                            )}
                        >
                            <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-violet-400" : "text-slate-600")} />
                            <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="premium-card p-10 min-h-[600px] bg-slate-900/40 backdrop-blur-3xl"
                    >
                        {activeTab === "billing" && <BillingView org={org} />}
                        {activeTab === "api" && <APIView keys={apiKeys} />}
                        {activeTab === "team" && <TeamView profile={profile} />}
                        {activeTab === "security" && <SecurityView />}
                    </motion.div>
                </div>
            </div>
            )}
        </div>
    );
}

function BillingView({ org }: { org: any }) {
    const plan = org?.plan || "FREE";
    const status = org?.subscription_status || "ACTIVE";
    const planDisplay = plan === "ENTERPRISE" ? "Enterprise Elite" : plan === "PRO" ? "Professional" : "Free";
    const planCost = plan === "ENTERPRISE" ? "$499.00" : plan === "PRO" ? "$299.00" : "$0.00";

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white italic tracking-tight">Active Plan: <span className="text-violet-400">{planDisplay}</span></h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{org?.name || "Organization"}</p>
                </div>
                <div className={cn(
                    "px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                    status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}>
                    STATUS: {status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Monthly Cost", value: planCost, icon: CreditCard },
                    { label: "Plan Tier", value: plan, icon: Shield },
                    { label: "Organization", value: org?.name || "N/A", icon: Users },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <stat.icon className="h-5 w-5 text-violet-400 mb-4" />
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-xl font-black text-white tracking-tight italic">{stat.value}</div>
                    </div>
                ))}
            </div>

            {plan !== "ENTERPRISE" && (
                <button className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-3">
                    <Zap className="h-4 w-4" />
                    Upgrade to {plan === "FREE" ? "Professional" : "Enterprise Elite"} Tier
                </button>
            )}
        </div>
    );
}

function APIView({ keys }: { keys: any[] }) {
    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white italic tracking-tight">API Access <span className="text-violet-400">Tokens</span></h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Connect your infra to Bouclier intelligence</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-white/10 transition-all">
                    <Plus className="h-4 w-4 text-violet-400" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Generate Key</span>
                </button>
            </div>

            {keys.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">No API keys yet. Generate your first key above.</div>
            ) : (
            <div className="space-y-4">
                {keys.map((k: any) => (
                    <div key={k.id || k.name} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs font-bold text-white tracking-tight">{k.name}</div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Created {k.created_at}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all"><Copy className="h-3.5 w-3.5" /></button>
                                <button className="p-2.5 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-violet-400 flex items-center justify-between">
                            <code>{k.key}</code>
                            <span className="text-[8px] font-black text-slate-700 uppercase">{k.scope || "Hidden"}</span>
                        </div>
                    </div>
                ))}
            </div>
            )}

            <div className="p-6 rounded-2xl bg-violet-600/5 border border-violet-500/20 flex gap-4">
                <AlertCircle className="h-5 w-5 text-violet-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    Never share your production keys. Bouclier will never ask for your key over email or SMS.
                    Rotate keys every 90 days for maximum safety.
                </p>
            </div>
        </div>
    );
}

function TeamView({ profile }: { profile: any }) {
    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white italic tracking-tight">Your <span className="text-violet-400">Profile</span></h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Account details and security clearance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold text-white">{profile?.email || "N/A"}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Role</div>
                    <div className="text-sm font-bold text-white">{profile?.role || "N/A"}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan</div>
                    <div className="text-sm font-bold text-white">{profile?.plan || "FREE"}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Org ID</div>
                    <div className="text-sm font-mono text-violet-400">{profile?.org_id || "N/A"}</div>
                </div>
            </div>
        </div>
    );
}

function SecurityView() {
    return (
        <div className="space-y-10">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-white italic tracking-tight">Global <span className="text-violet-400">Security</span></h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Security policies and encryption controls</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Encryption Status</div>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-white">AES-256-GCM encryption active on all data channels</span>
                </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Session Policy</div>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-white">JWT session timeout: 24 hours</span>
                </div>
            </div>
        </div>
    );
}
