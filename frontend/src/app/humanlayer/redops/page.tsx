"use client";

import { Crown, ShieldAlert, Target, Terminal, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function RedOpsPage() {
    return (
        <div className="min-h-screen bg-[#05040B] text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Target className="text-rose-500" />
                            RedOps <span className="text-slate-500 text-lg font-normal">Offensive Simulations</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Launch controlled vishing, phishing, and precision social engineering campaigns.</p>
                    </div>
                    <Link href="/humanlayer/dashboard" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Create Campaign */}
                    <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-indigo-400" />
                            New Campaign Configuration
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Campaign Name</label>
                                <input type="text" placeholder="e.g. Q3 Executive Whale Phishing" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Target Group</label>
                                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 outline-none">
                                        <option>Executive Team (C-Suite)</option>
                                        <option>Finance Department</option>
                                        <option>HR & Recruitment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Attack Vector</label>
                                    <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 outline-none">
                                        <option>AI Voice Cloning (Vishing)</option>
                                        <option>Spear Phishing (Email)</option>
                                        <option>SMS Smishing</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">AI Scenario Prompt</label>
                                <textarea rows={4} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition font-mono text-sm" placeholder="Act as a frantic IT administrator needing urgent password reset..." />
                            </div>

                            <button className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white transition shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                                <Target className="h-5 w-5" />
                                LAUNCH SIMULATION
                            </button>
                        </div>
                    </div>

                    {/* Active Campaigns */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-6">Active Operations</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-bold text-slate-200">Operation "Silent Night"</div>
                                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">RUNNING</span>
                                    </div>
                                    <div className="w-full bg-black/50 h-1.5 rounded-full mb-2 overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${i * 30}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Progress</span>
                                        <span>{i * 30}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
