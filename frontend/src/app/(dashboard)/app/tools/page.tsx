"use client";

import React from 'react';
import { GlassCard, NeonButton } from '@/components/ui/core';
import { Search, Zap, Shield, SearchIcon, Globe, Terminal, Code, Cpu, Activity, Play, Settings, AlertCircle, Wifi } from 'lucide-react';

const CATEGORIES = ["All Tools", "Network Analysis", "Exploitation", "OSINT", "Forensics", "Cloud Sec"];

const TOOLS = [
    { id: 't-1', name: 'Nmap Pro', category: 'Network Analysis', desc: 'Advanced network discovery and security auditing with NSE scripting.', icon: Wifi, status: 'Installed' },
    { id: 't-2', name: 'Metasploit Node', category: 'Exploitation', desc: 'Managed penetration testing framework for offensive security validation.', icon: Target, status: 'Ready' },
    { id: 't-3', name: 'Wireshark HQ', category: 'Network Analysis', desc: 'Deep packet inspection and protocol analysis interface for traffic streams.', icon: Activity, status: 'Installed' },
    { id: 't-4', name: 'Volatile RAM', category: 'Forensics', desc: 'Memory forensics toolkit for extracting evidence from digital artifacts.', icon: Cpu, status: 'Cloud Only' },
    { id: 't-5', name: 'Subfinder', category: 'OSINT', desc: 'Subdomain discovery tool designed for massive attack surface monitoring.', icon: Globe, status: 'Installed' },
    { id: 't-6', name: 'Gitleaks Node', category: 'Cloud Sec', desc: 'Automated secret scanning and credential exposure prevention.', icon: Code, status: 'Policy Blocked' },
];

function Target({ className }: { className?: string }) { return <Shield className={className} /> } // Helper

export default function ToolsPage() {
    const [activeCategory, setActiveCategory] = React.useState("All Tools");

    return (
        <div className="space-y-8 animate-fade-in mb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1 text-white">Security Tooling</h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest">Unified interface for offensive & defensive utilities</p>
                </div>
                <div className="relative group min-w-[300px]">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-p-400" />
                    <input
                        type="text"
                        placeholder="Search tool library..."
                        className="w-full bg-bg-2/30 border border-border-1 rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder:text-text-3 placeholder:opacity-40 outline-none focus:border-p-600/30 font-mono tracking-tight"
                    />
                </div>
            </div>

            {/* Categories HUD */}
            <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                            ? "bg-p-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                            : "bg-bg-0 border border-border-1 text-text-3 hover:text-white hover:border-border-2"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {TOOLS.map((tool) => (
                    <GlassCard key={tool.id} className="group flex flex-col justify-between border-border-1/50 hover:border-p-600/30">
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-bg-2 border border-border-1 flex items-center justify-center text-p-400 group-hover:scale-110 transition-transform">
                                    <tool.icon className="w-7 h-7" />
                                </div>
                                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${tool.status === 'Installed' ? "bg-success/10 text-success" :
                                    tool.status === 'Ready' ? "bg-p-600/10 text-p-400" :
                                        tool.status === 'Policy Blocked' ? "bg-danger/10 text-danger" :
                                            "bg-white/5 text-slate-500"
                                    }`}>
                                    {tool.status}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{tool.name}</h3>
                            <div className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] mb-4 opacity-60">{tool.category}</div>
                            <p className="text-sm text-text-2 leading-relaxed opacity-80 mb-8">{tool.desc}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {tool.status === 'Policy Blocked' ? (
                                <div className="flex-1 px-4 py-2.5 rounded-lg bg-bg-2 border border-border-1 text-[10px] font-black text-text-3 uppercase flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Blocked by Admin
                                </div>
                            ) : (
                                <NeonButton variant="primary" size="sm" className="flex-1 rounded-lg">
                                    <Play className="w-3.5 h-3.5 mr-2" /> Launch Tool
                                </NeonButton>
                            )}
                            <button className="p-2.5 rounded-lg bg-bg-2 border border-border-1 text-text-3 hover:text-white transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </GlassCard>
                ))}

                {/* Add Tool Placeholder */}
                <GlassCard className="border-dashed border-border-2/50 bg-transparent flex flex-col items-center justify-center text-center p-12 hover:bg-white/5 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-2 flex items-center justify-center text-text-3 group-hover:text-p-400 group-hover:border-p-400 transition-all mb-4">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Inventory Sync</h4>
                    <p className="text-xs text-text-3 font-medium opacity-60">Connect your custom security stack via Bouclier SDK.</p>
                </GlassCard>
            </div>
        </div>
    );
}
