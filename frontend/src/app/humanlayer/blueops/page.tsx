"use client";

import { Shield, Radio, Lock, Activity, Search } from 'lucide-react';
import Link from 'next/link';

export default function BlueOpsPage() {
    return (
        <div className="min-h-screen bg-[#05040B] text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="text-blue-500" />
                            BlueOps <span className="text-slate-500 text-lg font-normal">Active Defense</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Real-time threat monitoring, incident response, and forensic analysis.</p>
                    </div>
                    <Link href="/humanlayer/dashboard" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Defense Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-blue-400 mb-2"><Radio className="h-6 w-6" /></div>
                        <div className="text-2xl font-bold">Active</div>
                        <div className="text-sm text-slate-400">Defense Mode</div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-indigo-400 mb-2"><Activity className="h-6 w-6" /></div>
                        <div className="text-2xl font-bold">12ms</div>
                        <div className="text-sm text-slate-400">Response Time</div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-emerald-400 mb-2"><Lock className="h-6 w-6" /></div>
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-sm text-slate-400">Encryption Integrity</div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-orange-400 mb-2"><Search className="h-6 w-6" /></div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-slate-400">Open Incidents</div>
                    </div>
                </div>

                {/* Incident Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-lg font-bold">Security Incidents</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-white/5 rounded text-xs font-bold hover:bg-white/10">EXPORT LOGS</button>
                            <button className="px-3 py-1.5 bg-blue-600 rounded text-xs font-bold hover:bg-blue-500">TRIAGE NEW</button>
                        </div>
                    </div>
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/[0.02] text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">Source</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { id: "INC-2049", severity: "CRITICAL", source: "Voice Gateway", desc: "Blocked Deepfake Vishing from unknown caller", status: "Resolved" },
                                { id: "INC-2048", severity: "HIGH", source: "Auth Service", desc: "Brute force attempt on admin dashboard", status: "Investigating" },
                                { id: "INC-2045", severity: "MEDIUM", source: "Endpoint", desc: "Suspicious file download detected", status: "Open" },
                            ].map((inc, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition">
                                    <td className="p-4 font-mono text-white">{inc.id}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${inc.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : inc.severity === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {inc.severity}
                                        </span>
                                    </td>
                                    <td className="p-4">{inc.source}</td>
                                    <td className="p-4 text-white">{inc.desc}</td>
                                    <td className="p-4">{inc.status}</td>
                                    <td className="p-4">
                                        <button className="text-indigo-400 hover:text-white transition underline">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
