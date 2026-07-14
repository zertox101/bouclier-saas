"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    User, Shield, Mail, Building, Globe,
    Lock, Key, Bell, CreditCard, LogOut,
    CheckCircle2, Clock, Award
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        apiClient("/api/settings/profile").then(setProfile).catch(() => {});
    }, []);

    const role = session?.user?.role || profile?.role || "OPERATOR";
    const orgName = session?.user?.orgName || profile?.org_name || "Bouclier Security";
    const email = session?.user?.email || profile?.email || "operator@bouclier.ma";

    const stats = [
        { label: "Clearance", value: profile?.clearance || "Level " + (role === "SUPER_ADMIN" ? "5" : role === "ORG_ADMIN" ? "4" : "3"), icon: Shield, color: "text-blue-400" },
        { label: "Role", value: role.replace(/_/g, " "), icon: Award, color: "text-p-400" },
        { label: "Region", value: profile?.region || "Casablanca, MA", icon: MapPin, color: "text-emerald-400" },
    ];

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* Header / Banner */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden border border-border-1 bg-bg-2 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-p-600/20 to-blue-600/20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-p-500 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
                        <div className="relative h-32 w-32 rounded-full bg-bg-1 border-4 border-bg-2 overflow-hidden flex items-center justify-center">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-16 w-16 text-text-3" />
                            )}
                        </div>
                    </div>

                    <div className="mb-14">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                            {session?.user?.name || "GUEST OPERATOR"}
                        </h1>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-p-500 text-black font-black text-[10px] uppercase px-3">
                                {session?.user?.role || "OPERATOR"}
                            </Badge>
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                Active System Session
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Info */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 rounded-3xl border border-border-1 bg-bg-1/50"
                            >
                                <s.icon className={`h-5 w-5 ${s.color} mb-4`} />
                                <div className="text-[9px] font-black text-text-3 uppercase tracking-widest mb-1">{s.label}</div>
                                <div className="text-lg font-black text-white">{s.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="glass-card p-8 rounded-3xl border border-border-1 bg-bg-1/50 space-y-8">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                <Building className="h-5 w-5 text-p-400" /> Organization Profile
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Enterprise Entity</span>
                                        <span className="text-sm font-bold text-white uppercase">{orgName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Department</span>
                                        <span className="text-sm font-bold text-white uppercase">Cyber Defense Unit</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">System Email</span>
                                        <span className="text-sm font-bold text-white">{email}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">ID Hash</span>
                                        <span className="text-[10px] font-mono text-p-400">0x7F2B...A90E</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                <Lock className="h-5 w-5 text-success" /> Security & Access
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-2 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase">Multi-Factor Authentication</div>
                                            <div className="text-[9px] text-text-3 uppercase">Secured via FIDO2 / Yubikey</div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-[8px] font-black uppercase">Manage</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-2 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase">Last Login Location</div>
                                            <div className="text-[9px] text-text-3 uppercase">Rabat, Morocco (196.200.x.x)</div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-text-3 italic">2 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-3xl border border-border-1 bg-bg-1/50">
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-6">Quick Settings</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group">
                                <Key className="h-4 w-4 text-text-3 group-hover:text-p-400" />
                                <span className="text-[10px] font-black text-text-2 uppercase group-hover:text-white">Rotate Credentials</span>
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group">
                                <Bell className="h-4 w-4 text-text-3 group-hover:text-p-400" />
                                <span className="text-[10px] font-black text-text-2 uppercase group-hover:text-white">Intelligence Alerts</span>
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group">
                                <Globe className="h-4 w-4 text-text-3 group-hover:text-p-400" />
                                <span className="text-[10px] font-black text-text-2 uppercase group-hover:text-white">Interface Locale (MA)</span>
                            </button>
                            <div className="my-4 h-px bg-white/5" />
                            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-danger/10 hover:bg-danger text-danger hover:text-white transition-all text-left group">
                                <LogOut className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-3xl border border-border-1 bg-gradient-to-br from-p-500/10 to-transparent">
                        <div className="h-10 w-10 rounded-xl bg-p-500 text-black flex items-center justify-center mb-6">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-2">PRO Clearance</h3>
                        <p className="text-[10px] text-text-3 uppercase tracking-wide leading-relaxed mb-6">
                            Unlimited satellite bandwidth, AI-powered threat triage, and full arsenal access enabled.
                        </p>
                        <Button className="w-full bg-white text-black font-black uppercase text-[10px] hover:bg-p-400">
                            Enterprise Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
