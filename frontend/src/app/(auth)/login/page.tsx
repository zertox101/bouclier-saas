"use client";

import { useForm } from "react-hook-form";
import { Shield, Fingerprint, Activity, Crosshair, ArrowRight, Scan, Lock, User, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const { register, handleSubmit } = useForm();

    const ROLE_REDIRECTS: Record<string, string> = {
        SUPER_ADMIN: "/admin/platform-overview",
        ORG_ADMIN: "/soc/dashboard",
        ANALYST: "/soc/dashboard",
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password
            });

            if (result?.error) {
                setError("Invalid credentials. Please try again.");
            } else {
                const params = new URLSearchParams(window.location.search);
                const callbackUrl = params.get("callbackUrl");
                const session = await getSession();
                if (session?.user?.accessToken) {
                    localStorage.setItem("auth_token", session.user.accessToken);
                    localStorage.setItem("auth_user", JSON.stringify(session.user));
                }
                if (callbackUrl) {
                    window.location.href = callbackUrl;
                } else {
                    const role = session?.user?.role || "ANALYST";
                    window.location.href = ROLE_REDIRECTS[role] || "/overview";
                }
            }
        } catch (err) {
            setError("Authentication service unavailable.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030508] font-sans selection:bg-amber-500/30 selection:text-amber-500 text-slate-300">
            <style>{`
                .gotham-bg {
                    background-image: 
                        linear-gradient(rgba(30, 41, 59, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30, 41, 59, 0.3) 1px, transparent 1px);
                    background-size: 50px 50px;
                    background-position: center center;
                }
                .gotham-input {
                    background: rgba(11, 15, 25, 0.6);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                }
                .gotham-input:focus {
                    border-color: rgba(56, 189, 248, 0.5);
                    box-shadow: 0 0 15px rgba(56, 189, 248, 0.1), inset 0 2px 10px rgba(0,0,0,0.5);
                    outline: none;
                }
                .gotham-panel {
                    background: rgba(8, 11, 18, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255,255,255,0.02);
                }
            `}</style>

            {/* Radar Map Background */}
            <div className="absolute inset-0 gotham-bg opacity-40 -z-20" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.2] z-0 overflow-hidden flex items-center justify-center">
                <div className="w-[1200px] h-[1200px] border border-sky-500/10 rounded-full flex items-center justify-center relative">
                    <div className="w-[900px] h-[900px] border border-sky-500/10 rounded-full" />
                    <div className="w-[600px] h-[600px] border border-sky-500/10 rounded-full" />
                    <div className="absolute inset-0 border-t border-sky-500/20 animate-[spin_15s_linear_infinite]" style={{ transformOrigin: 'center' }} />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header Badge */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm">
                        <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                        <span className="text-[9px] font-bold tracking-[0.2em] text-sky-400 uppercase">Université Ibn Tofail - Cyber Lab</span>
                    </div>
                </div>

                <div className="gotham-panel rounded-lg overflow-hidden relative">
                    {/* Top Edge Glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

                    <div className="p-8">
                        {/* Title Section */}
                        <div className="flex flex-col items-center mb-10">
                            <motion.div
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="mb-6 relative"
                            >
                                <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20" />
                                <div className="w-16 h-16 rounded border border-sky-500/50 bg-[#0A0F1A] flex items-center justify-center shadow-[inset_0_0_15px_rgba(56,189,248,0.2)]">
                                    <Shield className="w-8 h-8 text-sky-400" strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <h1 className="text-2xl font-light tracking-widest text-white uppercase text-center mb-2">
                                Sentinel <span className="font-bold text-sky-500">Node</span>
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest">
                                <Crosshair className="w-3 h-3" />
                                AUTHORIZATION REQUIRED
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* UID */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Operative ID / Email</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="w-full gotham-input rounded py-3 pl-11 pr-4 text-xs text-sky-100 font-mono placeholder:text-slate-700 transition-all"
                                        placeholder="user@uit.ac.ma"
                                    />
                                    <div className="absolute inset-0 rounded border border-sky-500/0 group-focus-within:border-sky-500/30 transition-all pointer-events-none" />
                                </div>
                            </div>

                            {/* Passkey */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Security Key</label>
                                    <Link href="#" className="text-[9px] text-sky-500 hover:text-sky-300 transition-colors tracking-widest uppercase">Lost Key?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full gotham-input rounded py-3 pl-11 pr-12 text-xs text-sky-100 font-mono placeholder:text-slate-700 transition-all"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <div className="absolute inset-0 rounded border border-sky-500/0 group-focus-within:border-sky-500/30 transition-all pointer-events-none" />
                                </div>
                            </div>

                            {/* Error Warning */}
                            {error && (
                                <div className="flex items-center gap-3 text-[10px] text-amber-500 bg-amber-500/10 p-3 rounded border border-amber-500/20 font-mono uppercase tracking-wide">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Action */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex items-center justify-center gap-3 bg-sky-500/10 border border-sky-500/30 rounded text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] hover:bg-sky-500/20 hover:text-white transition-all disabled:opacity-50 mt-8 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Scan className="w-4 h-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <Fingerprint className="w-4 h-4" />
                                            Initialize Handshake
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                            </button>
                        </form>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-[#05070B] p-4 flex justify-between items-center border-t border-slate-800 text-[9px] font-mono text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                            SECURE CHANNEL
                        </div>
                        <div>ENC: AES-256-GCM</div>
                    </div>
                </div>

                <div className="mt-8 text-center flex flex-col items-center gap-2">
                    <p className="text-[10px] text-slate-600 font-mono">
                        Projet Académique — Université Ibn Tofail
                    </p>
                    <Link href="/register" className="text-[9px] text-amber-500 hover:text-amber-400 tracking-widest uppercase transition-colors">
                        Request Student Access (Undergrad)
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
