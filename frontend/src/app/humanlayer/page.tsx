"use client";

import Link from 'next/link';
import { Shield, Smartphone, Lock, ArrowRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HumanLayerLanding() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#05040B] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="z-10 text-center max-w-4xl px-6">
                <div className="mb-8 flex justify-center">
                    <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                        <Shield className="h-8 w-8 text-indigo-400" />
                    </div>
                </div>

                <h1 className="text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    SignalGuard
                    <span className="block text-2xl font-normal text-indigo-400 tracking-widest uppercase mt-2">Human Layer Security</span>
                </h1>

                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    The world's first AI-powered defense against Vishing, Deepfakes, and Social Engineering attacks.
                    Real-time voice stream analysis and threat neutralization.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-16">
                    <button
                        onClick={() => router.push('/humanlayer/dashboard')}
                        className="w-full group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <Zap className="h-5 w-5" />
                        <span>Launch Console</span>
                    </button>

                    <button className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all text-slate-300 flex items-center justify-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span>Secure Login</span>
                    </button>
                </div>

                {/* Footer Metrics */}
                <div className="grid grid-cols-3 gap-12 border-t border-white/10 pt-12">
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">99.4%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Deepfake Detection</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">~12ms</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Analysis Latency</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">Zero</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Trust Arch</div>
                    </div>
                </div>

            </div>

            <div className="absolute bottom-8 text-xs text-slate-600 font-mono">
                HX-CORE v1.0.0 • ENCRYPTED CONNECTION • SYSTEM OPERATIONAL
            </div>

        </div>
    );
}
