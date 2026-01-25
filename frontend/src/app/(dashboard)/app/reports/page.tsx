"use client";

import React from 'react';
import { GlassCard, NeonButton } from '@/components/ui/core';
import { FileText, Download, Filter, Search, Calendar, ShieldCheck, Clock, ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORTS = [
    { id: 'R-2026-001', name: 'Quarterly Ingress Audit', date: '2026-01-15', size: '4.2 MB', category: 'Compliance', status: 'Generated' },
    { id: 'R-2026-002', name: 'Weekly Threat Intel Brief', date: '2026-01-20', size: '1.8 MB', category: 'Intelligence', status: 'Ready' },
    { id: 'R-2026-003', name: 'Vulnerability Summary', date: '2026-01-18', size: '12.4 MB', category: 'Scanning', status: 'Archived' },
    { id: 'R-2026-004', name: 'Purple Team Execution Log', date: '2025-12-30', size: '2.1 MB', category: 'Offensive', status: 'Generated' },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-fade-in mb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1 text-white">Governance & Audit</h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest">Enterprise reporting and historical signal logs</p>
                </div>
                <div className="flex items-center gap-4">
                    <NeonButton variant="primary" size="sm">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Schedule Report
                    </NeonButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Report Library */}
                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="!p-0 border-border-1/50 overflow-hidden">
                        <div className="p-6 border-b border-border-1 bg-bg-2/30">
                            <h3 className="text-lg font-bold text-white tracking-tight">Report Library</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-bg-2/10 border-b border-border-1">
                                        <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Report Identifier</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest text-right">Date / Size</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-1/50">
                                    {REPORTS.map((report) => (
                                        <tr key={report.id} className="group hover:bg-white/5 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-bg-2 border border-border-1 text-text-3 group-hover:text-p-400 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-white transition-colors">{report.name}</div>
                                                        <code className="text-[10px] text-text-3 opacity-60 font-mono italic uppercase tracking-tighter">{report.id}</code>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-info border border-info/30 bg-info/5 px-2 py-0.5 rounded uppercase tracking-widest">
                                                    {report.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-xs font-bold text-white mb-0.5">{report.date}</div>
                                                <div className="text-[10px] text-text-3 font-medium opacity-60">{report.size}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 rounded-lg bg-bg-2 border border-border-1 text-text-3 hover:text-white transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 rounded-lg text-text-3 hover:bg-bg-3">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Audit Trail */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard className="border-border-1/50">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-1">
                            <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest">Real-time Audit Trail</h3>
                            <Clock className="w-4 h-4 text-text-3" />
                        </div>
                        <div className="space-y-6 relative ml-2">
                            <div className="absolute top-0 bottom-0 left-[7px] w-px bg-border-1" />

                            {[
                                { time: '02:42', user: 'Admin', action: 'Modified IDS Rule #092', color: 'text-p-400' },
                                { time: '02:15', user: 'System', action: 'Daily database backup complete', color: 'text-success' },
                                { time: '01:50', user: 'Sentinel', action: 'AI analysis report generated', color: 'text-info' },
                                { time: '01:10', user: 'Operator_04', action: 'Accessed Telemetry Node SEA-02', color: 'text-text-3' },
                            ].map((log, i) => (
                                <div key={i} className="relative pl-8 group">
                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-bg-1 border-2 border-border-1 group-hover:border-p-600 transition-colors z-10" />
                                    <div className="text-[10px] font-black text-text-3 opacity-50 mb-1 uppercase tracking-widest">{log.time} UTC</div>
                                    <div className="text-[11px] font-bold text-white mb-0.5">[{log.user}]</div>
                                    <p className={cn("text-xs leading-relaxed", log.color)}>{log.action}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-3 rounded-xl border border-border-1 text-[10px] font-black text-text-2 uppercase tracking-widest hover:bg-white/5 transition-all">
                            Access Full Audit Vault
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
