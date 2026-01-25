import Link from "next/link";
import { ArrowRight, ChevronRight, Zap, Shield, Lock, Globe, Terminal, Activity } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-48 pb-32 overflow-hidden bg-white">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nokod-purple/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] grayscale invert" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="container mx-auto text-center relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 mb-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Next-Gen Blue Team Stack</span>
                </div>

                <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-tight text-nokod-black md:text-8xl lg:text-[7.5rem] lg:leading-[0.85] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    Defend your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-500 to-slate-900">Digital Asset.</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 md:text-xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Equip your Blue Team with an elite command center. Real-time neural surveillance, automated mitigation, and a unified executive dashboard.
                </p>

                <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <Link
                        href="/overview"
                        className="group relative flex h-16 items-center justify-center rounded-2xl bg-nokod-black px-12 text-lg font-bold text-white shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        Enter Command Center
                    </Link>
                    <Link
                        href="/product"
                        className="flex h-16 items-center justify-center rounded-2xl border border-slate-200 bg-white px-12 text-lg font-bold text-nokod-black transition-all hover:bg-slate-50 hover:border-slate-300"
                    >
                        Learn the Architecture
                    </Link>
                </div>

                {/* Dashboard Preview - Ultra Premium Style */}
                <div className="mt-40 relative mx-auto max-w-6xl animate-in fade-in zoom-in duration-1000 delay-300">

                    {/* Shadow Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-nokod-purple/20 to-blue-500/20 blur-[100px] rounded-[3rem] -z-10 opacity-30" />

                    <div className="bg-slate-950 rounded-[3rem] p-3 shadow-[0_0_80px_rgba(0,0,0,0.4)] border border-slate-900 relative">
                        <div className="bg-slate-900/50 rounded-[2.3rem] overflow-hidden border border-white/5">
                            {/* Mock Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5 grayscale opacity-50">
                                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Command Terminal v2.0</div>
                                </div>
                                <div className="flex gap-6">
                                    {["Monitoring", "Analysis", "Threats"].map((item, i) => (
                                        <span key={item} className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>{item}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="p-8 grid grid-cols-12 gap-8 text-left">
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                    <div className="h-64 rounded-3xl bg-slate-950/80 border border-white/5 p-6 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Ingress Stream</div>
                                                <div className="text-2xl font-black text-white tracking-tighter">1,240 pkts/sec</div>
                                            </div>
                                            <div className="h-10 w-24 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center">
                                                <div className="h-1.5 w-16 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
                                            </div>
                                        </div>
                                        {/* Simple SVG Graph */}
                                        <svg className="w-full h-32 text-cyan-500/20" viewBox="0 0 400 100">
                                            <path d="M0 80 Q 50 20 100 70 T 200 10 T 300 80 T 400 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                                            <path d="M0 80 Q 50 20 100 70 T 200 10 T 300 80 T 400 30 L 400 100 L 0 100 Z" fill="url(#grad)" />
                                            <defs>
                                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style={{ stopColor: 'rgb(6, 182, 212)', stopOpacity: 0.1 }} />
                                                    <stop offset="100%" style={{ stopColor: 'rgb(6, 182, 212)', stopOpacity: 0 }} />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-32 rounded-3xl bg-slate-950/80 border border-emerald-500/20 p-6">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Status</div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <Activity size={16} />
                                                </div>
                                                <div className="text-lg font-black text-white uppercase italic tracking-tighter">Optimal</div>
                                            </div>
                                        </div>
                                        <div className="h-32 rounded-3xl bg-slate-950/80 border border-white/5 p-6">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Sync Integrity</div>
                                            <div className="text-xl font-black text-white">99.9%</div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                                <div className="w-[99.9%] h-full bg-nokod-purple" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    <div className="rounded-3xl bg-white p-8 text-nokod-black">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Evaluation</div>
                                        <div className="text-5xl font-black tracking-tighter mb-4">LOW</div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Access Control', status: 'Active' },
                                                { label: 'Encryption', status: 'Verified' },
                                                { label: 'Cloud Guard', status: 'Optimal' },
                                            ].map(item => (
                                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase">{item.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-3xl bg-nokod-purple p-8 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Shield size={80} />
                                        </div>
                                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Managed Security</div>
                                        <div className="text-xl font-black tracking-tighter">Enterprise Standard.</div>
                                        <div className="mt-8 flex items-center gap-2 text-xs font-bold">
                                            Learn more <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
