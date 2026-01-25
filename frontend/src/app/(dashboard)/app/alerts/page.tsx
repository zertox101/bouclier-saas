"use client";

import React from 'react';
import { GlassCard, SeverityBadge, NeonButton } from '@/components/ui/core';
import { Filter, Search, Download, Trash2, ShieldAlert, CheckCircle, ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE_ALERTS = [
    { id: 'AL-1092', title: 'Suspicious Kerberos Activity', time: '2026-01-21 02:30:12', severity: 'Critical', source: 'Internal-DB-04', actor: 'unauthorized_admin', status: 'New' },
    { id: 'AL-1091', title: 'Brute Force Attempt: SSH', time: '2026-01-21 02:15:33', severity: 'High', source: 'Web-FE-01', actor: '45.16.2.10', status: 'Investigating' },
    { id: 'AL-1090', title: 'Data Exfiltration Warning', time: '2026-01-21 02:05:10', severity: 'Medium', source: 'File-Server-09', actor: 'john.doe', status: 'Resolved' },
    { id: 'AL-1089', title: 'Malware Signature Detected', time: '2026-01-21 01:50:44', severity: 'Critical', source: 'Workstation-P-22', actor: '-', status: 'New' },
    { id: 'AL-1088', title: 'Large DNS Query Volume', time: '2026-01-21 01:40:00', severity: 'Low', source: 'DNS-Resolver-01', actor: '10.0.0.42', status: 'Closed' },
];

export default function AlertsPage() {
    const [selectedAlert, setSelectedAlert] = React.useState<typeof SAMPLE_ALERTS[0] | null>(null);

    return (
        <div className="space-y-8 animate-fade-in relative min-h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display mb-1 text-white">Security Alerts</h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest">Real-time detection events & triage</p>
                </div>
                <div className="flex items-center gap-4">
                    <NeonButton variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </NeonButton>
                    <NeonButton variant="primary" size="sm">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Bulk Resolve
                    </NeonButton>
                </div>
            </div>

            {/* Filters HUD */}
            <GlassCard className="!p-4 border-border-1/50 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-p-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, Resource, Agent, or Rule..."
                        className="w-full bg-bg-2/30 border border-border-1 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-text-3 placeholder:opacity-40 outline-none focus:border-p-600/30 transition-all font-mono tracking-tight"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select className="bg-bg-0 border border-border-1 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-text-2 tracking-widest outline-none cursor-pointer">
                        <option>All Severities</option>
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                    </select>
                    <select className="bg-bg-0 border border-border-1 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-text-2 tracking-widest outline-none cursor-pointer">
                        <option>All Status</option>
                        <option>New</option>
                        <option>Investigating</option>
                        <option>Resolved</option>
                    </select>
                </div>
                <button className="p-3 bg-bg-0 border border-border-1 rounded-xl text-text-3 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                </button>
            </GlassCard>

            {/* Alerts Table */}
            <GlassCard className="!p-0 border-border-1/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-2/30 border-b border-border-1">
                                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-widest">Alert ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-widest">Alert Title / Resource</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-widest text-center">Severity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-widest">Time (UTC)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1/50">
                            {SAMPLE_ALERTS.map((alert) => (
                                <tr
                                    key={alert.id}
                                    className={cn(
                                        "group hover:bg-p-600/5 transition-all cursor-pointer",
                                        selectedAlert?.id === alert.id && "bg-p-600/10"
                                    )}
                                    onClick={() => setSelectedAlert(alert)}
                                >
                                    <td className="px-6 py-4 font-mono text-[11px] text-p-400 font-bold whitespace-nowrap">{alert.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-white mb-1">{alert.title}</div>
                                        <div className="text-[10px] font-black text-text-3 opacity-60 uppercase tracking-widest flex items-center gap-2">
                                            {alert.source} • <span className="text-info">{alert.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <SeverityBadge severity={alert.severity} />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[11px] text-text-2 opacity-60">
                                        {alert.time.split(' ')[1]}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-lg text-text-3 group-hover:text-white hover:bg-bg-3 transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Details Side Panel (Drawer) placeholder */}
            {selectedAlert && (
                <div
                    className="fixed inset-y-0 right-0 w-full max-w-lg bg-bg-1 border-l border-border-1 shadow-2xl z-[100] p-8 animate-in slide-in-from-right duration-300"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-p-600/10 text-p-400"><ShieldAlert className="w-5 h-5" /></div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Alert Intelligence</h2>
                        </div>
                        <button onClick={() => setSelectedAlert(null)} className="text-text-3 hover:text-white text-xs font-black uppercase tracking-widest">Close [Esc]</button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest opacity-50">Alert ID</span>
                            <div className="text-2xl font-black text-white font-mono tracking-tighter">{selectedAlert.id}</div>
                            <SeverityBadge severity={selectedAlert.severity} />
                        </div>

                        <GlassCard className="bg-bg-0/50 space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-text-2 uppercase tracking-widest mb-2 block">Detection Title</span>
                                <p className="text-sm font-bold text-white leading-relaxed">{selectedAlert.title}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-text-2 uppercase tracking-widest mb-2 block">Observed Actor</span>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-2 rounded-lg border border-border-1 font-mono text-[11px] text-info">
                                    {selectedAlert.actor}
                                </div>
                            </div>
                        </GlassCard>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest">Recommended Remediation</h4>
                            <div className="space-y-2">
                                <div className="p-4 rounded-xl border border-border-1 bg-white/5 text-xs text-text-2 leading-relaxed">
                                    1. Terminate active SSH sessions on <b>{selectedAlert.source}</b>.<br />
                                    2. Revoke service account credentials for <b>{selectedAlert.actor}</b>.<br />
                                    3. Trigger automated forensic capture for cloud-instance-09.
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 grid grid-cols-2 gap-4">
                            <NeonButton variant="primary" className="flex-1">
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                            </NeonButton>
                            <NeonButton variant="ghost" className="flex-1">
                                <ExternalLink className="w-4 h-4 mr-2" /> Graph View
                            </NeonButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
