'use client';

import React from 'react';
import {
    Server,
    Monitor as PCIcon,
    Smartphone,
    Globe,
    ShieldCheck,
    ShieldAlert,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Activity,
    Cpu,
    Database,
    Wifi
} from 'lucide-react';
import { cn } from "@/lib/utils";

const ASSETS = [
    { id: 'AS-001', name: 'CORE-FW-01', type: 'Firewall', ip: '192.168.1.1', risk: 'Low', status: 'Healthy', load: '12%', icon: ShieldCheck },
    { id: 'AS-002', name: 'SRV-DATACENTER-A', type: 'Database', ip: '10.0.0.45', risk: 'Medium', status: 'Warning', load: '88%', icon: Database },
    { id: 'AS-003', name: 'WKS-ADMIN-X', type: 'Workstation', ip: '10.0.2.14', risk: 'High', status: 'Breached', load: '4%', icon: PCIcon },
    { id: 'AS-004', name: 'APP-AUTH-SECURE', type: 'Server', ip: '172.16.0.5', risk: 'Low', status: 'Healthy', load: '34%', icon: Server },
    { id: 'AS-005', name: 'WIFI-GUEST-AP', type: 'Access Point', ip: '192.168.50.2', risk: 'Medium', status: 'Suspicious', load: '65%', icon: Wifi },
    { id: 'AS-006', name: 'EXT-WEB-PORTAL', type: 'Web App', ip: '203.0.113.4', risk: 'Low', status: 'Healthy', load: '21%', icon: Globe },
];

const riskStyles = {
    Low: 'text-success bg-success/10 border-success/20',
    Medium: 'text-warning bg-warning/10 border-warning/20',
    High: 'text-danger bg-danger/10 border-danger/20',
};

const statusStyles = {
    Healthy: 'bg-success',
    Warning: 'bg-warning',
    Breached: 'bg-danger animate-pulse',
    Suspicious: 'bg-warning animate-pulse',
};

export default function AssetsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400">
                            <Server className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Asset Intelligence</span>
                    </div>
                    <h1 className="text-display mb-1 text-text-1">
                        Global <span className="text-p-400">Armamentarium</span>
                    </h1>
                    <p className="text-text-2 text-sm max-w-lg">
                        Complete inventory of managed nodes, sensors, and virtualized infrastructures with real-time risk assessment.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-11 px-6 rounded-xl bg-bg-2 border border-border-1 text-text-3 hover:text-text-1 hover:border-text-2 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="h-11 px-6 rounded-xl bg-text-1 text-bg-0 hover:bg-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-white/10">
                        <Plus className="h-4 w-4" />
                        Add Asset
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Assets', value: '1,542', icon: Server, color: 'p-500' },
                    { label: 'Critical Risk', value: '03', icon: ShieldAlert, color: 'danger' },
                    { label: 'Network Load', value: '42%', icon: Activity, color: 'info' },
                    { label: 'CPU Utilization', value: '28%', icon: Cpu, color: 'success' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-border-1 group hover:border-p-500/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-bg-1", `text-${stat.color}`)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest group-hover:text-text-2 transition-colors">实时监控</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-display text-2xl mb-1 text-text-1">{stat.value}</span>
                            <span className="text-xs font-bold text-text-3 uppercase tracking-wider">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Area */}
            <div className="glass-card rounded-2xl border border-border-1 overflow-hidden bg-bg-1/40 backdrop-blur-md">
                <div className="p-6 border-b border-border-1 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3 group-focus-within:text-p-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, IP, OR TYPE..."
                            className="w-full bg-bg-2 border border-border-1 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-p-500/50 transition-all uppercase tracking-widest"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Displaying 1-6 of 1,542 Nodes</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-2/30 border-b border-border-1">
                                <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Asset Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Management IP</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Security Risk</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest">Pulse Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-3 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1">
                            {ASSETS.map((asset) => (
                                <tr key={asset.id} className="hover:bg-bg-2/40 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-bg-2 border border-border-2 flex items-center justify-center text-text-2 group-hover:text-p-400 group-hover:border-p-500/30 transition-all">
                                                <asset.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-text-1 uppercase tracking-tight">{asset.name}</div>
                                                <div className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">{asset.type} • {asset.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-mono text-[11px] text-text-1 flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3 text-p-400 opacity-50" />
                                            {asset.ip}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            riskStyles[asset.risk as keyof typeof riskStyles]
                                        )}>
                                            {asset.risk} Risk
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                                                <span className="text-text-3">{asset.status}</span>
                                                <span className="text-text-2">Load: {asset.load}</span>
                                            </div>
                                            <div className="h-1 w-full bg-bg-2 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", statusStyles[asset.status as keyof typeof statusStyles])}
                                                    style={{ width: asset.load }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="h-8 w-8 rounded-lg text-text-3 hover:text-text-1 hover:bg-bg-3 transition-all flex items-center justify-center ml-auto">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-border-1 bg-bg-2/10 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest italic">Inventory Synchronization: Last updated 2m ago</div>
                    <div className="flex items-center gap-2">
                        <button className="h-8 px-4 rounded-lg bg-bg-2 border border-border-1 text-[10px] font-black text-text-3 uppercase hover:text-text-1 transition-all">Previous</button>
                        <button className="h-8 px-4 rounded-lg bg-bg-2 border border-border-1 text-[10px] font-black text-text-3 uppercase hover:text-text-1 transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
