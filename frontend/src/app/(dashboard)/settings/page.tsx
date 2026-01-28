"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Settings, User, Shield, Bell, Key,
    Database, Globe, Palette, Mail,
    Trash2, CreditCard, Lock, Eye,
    EyeOff, Check, AlertCircle, Zap,
    Monitor, Cpu, Cloud, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";

const SECTIONS = [
    { id: "profile", label: "My Profile", icon: User, desc: "Personal identity and access" },
    { id: "organization", label: "Organization", icon: Globe, desc: "Workspace and team control" },
    { id: "security", label: "Security & Auth", icon: Shield, desc: "Encryption and protection" },
    { id: "notifications", label: "Intelligence Alerts", icon: Bell, desc: "Traffic and scan notifications" },
    { id: "api", label: "API & Uplinks", icon: Terminal, desc: "External system integrations" },
    { id: "billing", label: "Billing & Plans", icon: CreditCard, desc: "Subscription and invoices" },
    { id: "system", label: "Core Modules", icon: Database, desc: "Node health and logging" },
];

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeSection, setActiveSection] = useState("profile");

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Dynamic Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-p-500/10 rounded-2xl border border-p-500/20 shadow-[0_0_20px_rgba(167,139,250,0.1)]">
                            <Settings className="w-6 h-6 text-p-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-3">System Control Node</span>
                    </div>
                    <h1 className="text-display mb-1 text-text-1">Platform <span className="text-p-400">Settings</span></h1>
                    <p className="text-sm text-text-3 font-medium">Configure global security parameters and neural interfaces.</p>
                </div>

                <div className="flex items-center gap-4 bg-bg-2/30 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="text-right">
                        <span className="block text-[8px] font-black text-white/40 uppercase tracking-widest">Uplink Status</span>
                        <span className="text-xs font-black text-green-500 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                            ENCRYPTED_LIVE
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8 items-start">
                {/* Nav Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden",
                                activeSection === section.id
                                    ? "bg-p-600/10 border-p-500/40 text-white shadow-[0_0_20px_rgba(167,139,250,0.05)]"
                                    : "bg-white/2 border-white/5 text-text-3 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <section.icon className={cn(
                                "w-5 h-5 transition-colors",
                                activeSection === section.id ? "text-p-400" : "text-text-3 group-hover:text-p-400"
                            )} />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">{section.label}</div>
                                <div className="text-[8px] text-text-3 font-bold opacity-60 uppercase">{section.desc}</div>
                            </div>
                            {activeSection === section.id && (
                                <motion.div
                                    layoutId="settings-pill"
                                    className="absolute right-4 w-1.5 h-1.5 bg-p-400 rounded-full shadow-[0_0_8px_#a78bfa]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="col-span-12 lg:col-span-9">
                    <div className="bg-bg-1/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[600px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                            <Settings className="w-64 h-64 rotate-12" />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative z-10"
                            >
                                {activeSection === "profile" && <ProfileSection session={session} />}
                                {activeSection === "security" && <SecuritySection />}
                                {activeSection === "organization" && <OrganizationSection session={session} />}
                                {activeSection === "api" && <ApiSection />}
                                {activeSection === "notifications" && <NotificationsSection />}
                                {activeSection === "billing" && <BillingSection session={session} />}
                                {activeSection === "system" && <SystemSection />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="mb-10 space-y-1">
            <h2 className="text-xl font-black text-text-1 uppercase tracking-tight italic">{title}</h2>
            <p className="text-xs text-text-3 font-bold uppercase tracking-widest">{desc}</p>
        </div>
    );
}

function ProfileSection({ session }: any) {
    return (
        <div className="space-y-10">
            <SectionHeader title="Neural Identity" desc="Operator verification credentials" />

            <div className="flex items-center gap-10 p-8 bg-bg-0/30 rounded-3xl border border-white/5">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-p-600/20 border-2 border-p-500/30 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-p-400">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-p-400" />
                        )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-white text-black rounded-xl shadow-xl hover:scale-110 transition-transform">
                        <Palette className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <div className="text-2xl font-black text-white italic truncate">{session?.user?.name || "OPERATOR_GUEST"}</div>
                        <div className="text-xs text-p-400 font-mono">BOUCLIER_ID_{session?.user?.id?.substring(0, 8) || "882B_X99"}</div>
                    </div>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-text-3 border border-white/10 rounded-lg">Level_Pro</span>
                        <span className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-text-3 border border-white/10 rounded-lg">Admin_Priv</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Display Name" defaultValue={session?.user?.name || ""} />
                <InputGroup label="Email Channel" defaultValue={session?.user?.email || ""} icon={Mail} />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Cancel</button>
                <button className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-white/10 transition-all">Sync_Identity</button>
            </div>
        </div>
    );
}

function SecuritySection() {
    return (
        <div className="space-y-10">
            <SectionHeader title="Encryption Guard" desc="Authentication layer configuration" />

            <div className="grid gap-6">
                <PanelRow title="Dual-Phase Auth" desc="Extra biometric or hardware verification" status="DEACTIVATED" color="red" />
                <PanelRow title="Session Lockdown" desc="Auto-terminate inactive uplinks" status="ACTIVE" color="green" />
                <PanelRow title="Neural Encryption" desc="Quantum-resistant password hashing" status="HARDENED" color="p-400" />
            </div>

            <div className="p-8 bg-bg-0/40 border border-white/5 rounded-3xl space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-p-400">Update Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Current Pulse" placeholder="••••••••" type="password" />
                    <div className="hidden md:block" />
                    <InputGroup label="New Matrix" placeholder="••••••••" type="password" />
                    <InputGroup label="Confirm Matrix" placeholder="••••••••" type="password" />
                </div>
                <button className="w-full py-4 bg-p-600 hover:bg-p-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-p-600/20">
                    Inject_New_Credentials
                </button>
            </div>
        </div>
    );
}

function ApiSection() {
    return (
        <div className="space-y-10">
            <SectionHeader title="System Uplinks" desc="Neural connections and system integrations" />

            <div className="space-y-4">
                {[
                    { name: "Production API Core", key: "sk_shield_772...f92", date: "Jan 12, 2026" },
                    { name: "External SIEM Hub", key: "sk_shield_001...x82", date: "Feb 05, 2026" },
                ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-6 bg-bg-0/30 border border-white/5 rounded-2xl hover:border-p-500/20 transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-p-500/10 rounded-xl text-p-400 group-hover:bg-p-400 group-hover:text-black transition-all">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-white italic uppercase tracking-tighter">{api.name}</div>
                                <div className="text-[10px] font-mono text-text-3 opacity-60 tracking-wider font-bold">{api.key}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-text-3 uppercase">{api.date}</span>
                            <button className="p-2 hover:bg-danger/10 text-danger rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-10 border-2 border-dashed border-white/5 hover:border-p-500/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group">
                <div className="p-4 bg-white/5 rounded-2xl text-text-3 group-hover:text-p-400 group-hover:scale-110 transition-all">
                    <Terminal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-text-3 tracking-[0.3em]">Initialize_New_Uplink</span>
            </button>
        </div>
    );
}

function NotificationsSection() {
    return (
        <div className="space-y-10">
            <SectionHeader title="Comms Center" desc="Traffic alerts and intelligence signal" />

            <div className="space-y-3">
                <ToggleRow title="Security Anomalies" desc="Critical threat level alerts" active />
                <ToggleRow title="Scan Reports" desc="Completion matrix for system audits" active />
                <ToggleRow title="Audit Logs" desc="Low-level telemetry tracking" />
                <ToggleRow title="AI Insights" desc="Sentinel intelligence commentary" active />
            </div>
        </div>
    );
}

function OrganizationSection({ session }: any) {
    return (
        <div className="space-y-10">
            <SectionHeader title="Governance" desc="Workspace and hierarchy settings" />

            <div className="p-8 bg-gradient-to-br from-p-600/10 to-transparent border border-p-500/20 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20"><Cloud className="w-20 h-20 text-p-400" /></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{session?.user?.orgName || "BOUCLIER_PRIME"}</h3>
                    <p className="text-xs text-text-3 font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-6">Premium Workspace Deployment</p>

                    <div className="grid grid-cols-3 gap-8">
                        <StatCell label="Active Nodes" value="142" />
                        <StatCell label="Team Slots" value="12 / 50" />
                        <StatCell label="Tier Status" value="ENTERPRISE" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-3 mb-6 flex items-center gap-3">
                    <div className="w-4 h-px bg-white/20" /> Tactical Team <div className="w-4 h-px bg-white/20" />
                </h3>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-bg-0/20 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-bg-2 border border-white/5 flex items-center justify-center text-text-3">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-white italic uppercase">Operator_0{i + 1}</div>
                                <div className="text-[9px] text-text-3 opacity-60 font-bold uppercase">ops_scout_unit@bouclier.ma</div>
                            </div>
                        </div>
                        <span className="text-[8px] font-black px-2 py-1 bg-p-600/20 text-p-400 border border-p-500/30 rounded uppercase tracking-widest">Sentinel</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SystemSection() {
    return (
        <div className="space-y-10">
            <SectionHeader title="Neural Health" desc="System core metrics and logging" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-bg-0/30 border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-p-400 flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Hardware Matrix
                    </h4>
                    <div className="space-y-4">
                        <MetricRow label="CPU Lattice" value="44%" color="p-400" />
                        <MetricRow label="Memory Pool" value="8.2 GB" color="neon-1" />
                        <MetricRow label="Internal Hub" value="OPTIMAL" color="green-500" />
                    </div>
                </div>

                <div className="p-6 bg-black rounded-3xl border border-white/5 space-y-4 font-mono">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 font-sans">
                        <Database className="w-4 h-4" /> Live Log Feed
                    </h4>
                    <div className="h-40 overflow-y-auto text-[8px] space-y-1 text-green-500/70 custom-scrollbar pr-4 italic">
                        <div className="flex gap-2"><span className="opacity-30">[13:14:22]</span><span className="text-blue-400">&gt;</span> SESSION_REHASH_COMPLETE</div>
                        <div className="flex gap-2"><span className="opacity-30">[13:14:25]</span><span className="text-blue-400">&gt;</span> CRYPTO_LATTICE_SYNC: OK</div>
                        <div className="flex gap-2"><span className="opacity-30">[13:14:30]</span><span className="text-amber-500">!</span> UPLINK_JITTER_DETECTED: 1.2ms</div>
                        <div className="flex gap-2"><span className="opacity-30">[13:14:42]</span><span className="text-blue-400">&gt;</span> HEARTBEAT_ECHO_STABLE</div>
                        <div className="flex gap-2 animate-pulse"><span className="opacity-30">[13:15:01]</span><span className="text-p-400">&gt;</span> LISTENING_FOR_PULSE_</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// UI HELPER COMPONENTS
function BillingSection({ session }: any) {
    const plan = session?.user?.orgPlan || "FREE";
    return (
        <div className="space-y-10">
            <SectionHeader title="Subscription Plan" desc="Compare and manage your tier" />

            <div className="p-8 bg-bg-2/30 border border-white/5 rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Current Plan: {plan}</h3>
                        <p className="text-xs text-text-3 font-bold uppercase tracking-widest mt-1">Renewal: Jan 12, 2027</p>
                    </div>
                    <button className="px-6 py-2 bg-p-600 hover:bg-p-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-p-600/20">
                        Manage_Billing
                    </button>
                </div>

                <h4 className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-6 block">Plan Comparison Matrix</h4>
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-bg-0/30">
                    <FeatureComparison />
                </div>
            </div>
        </div>
    );
}
function InputGroup({ label, defaultValue, type = "text", placeholder, icon: Icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-p-400 transition-colors" />}
                <input
                    type={type}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-6 py-4 bg-bg-0 border border-white/5 rounded-2xl text-xs font-black text-white italic tracking-widest focus:outline-none focus:border-p-500/50 focus:bg-white/5 transition-all shadow-inner",
                        Icon ? "pl-14" : ""
                    )}
                />
            </div>
        </div>
    );
}

function PanelRow({ title, desc, status, color }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-bg-2/30 border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-bg-0 border border-white/5 flex items-center justify-center text-text-3 shadow-inner">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xs font-black text-white uppercase italic">{title}</div>
                    <div className="text-[9px] text-text-3 opacity-60 font-bold uppercase tracking-wider">{desc}</div>
                </div>
            </div>
            <div className={cn("px-4 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest", `text-${color} border-${color}/20 bg-${color}/5`)}>
                {status}
            </div>
        </div>
    );
}

function ToggleRow({ title, desc, active }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-bg-0/30 border border-white/5 rounded-3xl hover:bg-bg-0/40 transition-all">
            <div>
                <div className="text-xs font-black text-white uppercase italic tracking-tighter">{title}</div>
                <div className="text-[10px] text-text-3 opacity-60 font-bold uppercase italic">{desc}</div>
            </div>
            <button className={cn("w-14 h-7 rounded-full relative transition-all duration-500 shadow-inner", active ? "bg-p-600 shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "bg-bg-3 border border-white/5")}>
                <div className={cn("absolute top-1.5 w-4 h-4 bg-white rounded-md shadow-xl transition-all duration-300", active ? "right-1.5 rotate-45" : "left-1.5 rotate-0")} />
            </button>
        </div>
    );
}

function StatCell({ label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[8px] font-black text-text-3 uppercase tracking-widest opacity-50">{label}</div>
            <div className="text-xl font-black text-white italic italic">{value}</div>
        </div>
    );
}

function MetricRow({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                <span className="text-text-3">{label}</span>
                <span className={`text-${color}`}>{value}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", `bg-${color}`)} style={{ width: value.includes('%') ? value : '65%' }} />
            </div>
        </div>
    );
}
