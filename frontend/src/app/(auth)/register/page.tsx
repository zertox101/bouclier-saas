"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/core";
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Mail, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

const API_BASE = typeof window !== "undefined"
    ? `http://${window.location.hostname}:8005`
    : "http://localhost:8005";

const ORG_OPTIONS = [
    { id: "", name: "Create new organization" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Startup Shield (FREE)" },
    { id: "00000000-0000-0000-0000-000000000001", name: "Bouclier Enterprise (PRO)" },
    { id: "00000000-0000-0000-0000-000000000003", name: "MegaCorp Defense (ENTERPRISE)" },
];

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [orgId, setOrgId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name,
                    email,
                    password,
                    org_id: orgId || null,
                }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.detail || "Registration failed");
            }

            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            const session = await getSession();
            if (session?.user?.accessToken) {
                localStorage.setItem("auth_token", session.user.accessToken);
                localStorage.setItem("auth_user", JSON.stringify(session.user));
                if (session.user.orgId) {
                    localStorage.setItem("auth_org_id", session.user.orgId);
                }
            }
            const ROLE_REDIRECTS: Record<string, string> = {
                SUPER_ADMIN: "/admin/platform-overview",
                ORG_ADMIN: "/org/dashboard",
                ANALYST: "/soc/dashboard",
            };
            const role = session?.user?.role || "ANALYST";
            router.push(ROLE_REDIRECTS[role] || "/soc/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-p-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

            <GlassCard className="w-full max-w-md p-8 border-t border-t-border-1 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bg-3 to-bg-2 border border-border-1 flex items-center justify-center mb-6 shadow-lg shadow-p-600/20 group">
                        <ShieldCheck className="w-8 h-8 text-p-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-1 tracking-tight mb-2">
                        Member<span className="text-p-400">.Access</span>
                    </h1>
                    <p className="text-text-3 text-sm font-medium uppercase tracking-widest">
                        Create your SOC ID
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-2 ml-1 uppercase tracking-wider">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-neon-1 transition-colors" />
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full bg-bg-1/50 border border-border-1 rounded-lg py-3 pl-11 pr-4 text-sm text-text-1 focus:border-neon-1/50 focus:ring-1 focus:ring-neon-1 outline-none transition-all placeholder:text-text-3/30"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-2 ml-1 uppercase tracking-wider">Email Identity</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-neon-1 transition-colors" />
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                required
                                className="w-full bg-bg-1/50 border border-border-1 rounded-lg py-3 pl-11 pr-4 text-sm text-text-1 focus:border-neon-1/50 focus:ring-1 focus:ring-neon-1 outline-none transition-all placeholder:text-text-3/30"
                                placeholder="agent@bouclier.io"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-2 ml-1 uppercase tracking-wider">Secure Passphrase</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-neon-1 transition-colors" />
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-bg-1/50 border border-border-1 rounded-lg py-3 pl-11 pr-4 text-sm text-text-1 focus:border-neon-1/50 focus:ring-1 focus:ring-neon-1 outline-none transition-all placeholder:text-text-3/30"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-2 ml-1 uppercase tracking-wider">Organization</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-neon-1 transition-colors" />
                            <select
                                value={orgId}
                                onChange={e => setOrgId(e.target.value)}
                                className="w-full bg-bg-1/50 border border-border-1 rounded-lg py-3 pl-11 pr-4 text-sm text-text-1 focus:border-neon-1/50 focus:ring-1 focus:ring-neon-1 outline-none transition-all appearance-none"
                            >
                                {ORG_OPTIONS.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] text-text-3 mt-1">Join an existing org or create a new one</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-base shadow-lg shadow-p-600/25 relative overflow-hidden group rounded-lg font-bold
                            bg-gradient-to-r from-p-600 to-p-500 hover:from-p-500 hover:to-p-400 disabled:opacity-50 text-white
                            flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? "Encrypting Identity..." : "Generate Account"}
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-1 text-center">
                    <p className="text-xs text-text-2">Already have clearance? <Link href="/login" className="text-p-400 hover:text-p-300 font-bold ml-1">Access Terminal</Link></p>
                </div>
            </GlassCard>
        </div>
    );
}
