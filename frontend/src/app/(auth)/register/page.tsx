"use client";

import { useForm } from "react-hook-form";
import { GlassCard, NeonButton } from "@/components/ui/core";
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });

            const contentType = res.headers.get("content-type");

            if (!res.ok) {
                // Check if response is JSON
                if (contentType && contentType.includes("application/json")) {
                    const json = await res.json();
                    throw new Error(json.message || "Registration failed");
                } else {
                    // Server returned HTML error page
                    const text = await res.text();
                    console.error("Server error:", text);
                    throw new Error("Server error occurred. Please check the console for details.");
                }
            }

            // Auto-login after registration
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-0">
            {/* Background Decor */}
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-2 ml-1 uppercase tracking-wider">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-neon-1 transition-colors" />
                            <input
                                {...register("name", { required: true })}
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
                                {...register("email", { required: true })}
                                type="email"
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
                                {...register("password", { required: true, minLength: 6 })}
                                type="password"
                                className="w-full bg-bg-1/50 border border-border-1 rounded-lg py-3 pl-11 pr-4 text-sm text-text-1 focus:border-neon-1/50 focus:ring-1 focus:ring-neon-1 outline-none transition-all placeholder:text-text-3/30"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <NeonButton
                        variant="primary"
                        className="w-full h-12 text-base shadow-lg shadow-p-600/25 relative overflow-hidden group"
                        disabled={isLoading}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isLoading ? "Encrypting Identity..." : "Generate Account"}
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                    </NeonButton>
                </form>

                <div className="mt-8 pt-6 border-t border-border-1 text-center">
                    <p className="text-xs text-text-2">Already have clearance? <Link href="/login" className="text-p-400 hover:text-p-300 font-bold ml-1">Access Terminal</Link></p>
                </div>
            </GlassCard>
        </div>
    );
}
