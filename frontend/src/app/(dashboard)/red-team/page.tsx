"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Terminal, Shield, Zap, Lock, Crosshair,
    Wifi, Database, Globe, Key, AlertTriangle,
    Server, Cpu, Eye, Ghost, Skull
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RED_TEAM_TOOLS = [
    {
        category: "Reconnaissance",
        icon: Eye,
        tools: [
            { id: "network_recon", name: "Nmap", description: "Network mapper & port scanner", command: "nmap -sV -sC -O target", status: "ready" },
            { id: "mass_scan", name: "Masscan", description: "High-speed port scanner", command: "masscan -p1-65535 target --rate=1000", status: "ready" },
            { id: "amass_enum", name: "Amass", description: "In-depth DNS enumeration", command: "amass enum -d domain.com", status: "ready" },
            { id: "ad_recon", name: "BloodHound", description: "AD relationship graphing", command: "bloodhound-python -u user -p pass -d domain", status: "configured" }
        ]
    },
    {
        category: "Weaponization & Delivery",
        icon: Crosshair,
        tools: [
            { id: "exploit_framework", name: "Metasploit", description: "Exploitation framework", command: "msfconsole", status: "ready" },
            { id: "beacon_emulation", name: "Cobalt Strike", description: "Adversary emulator (Simulated)", command: "./teamserver IP password", status: "missing" },
            { id: "post_exploit_empire", name: "Empire", description: "PowerShell/Python post-exploit", command: "powershell-empire", status: "ready" }
        ]
    },
    {
        category: "Credential Access",
        icon: Key,
        tools: [
            { id: "windows_creds", name: "Mimikatz", description: "Windows credential extractor", command: "mimikatz # privilege::debug", status: "ready" },
            { id: "hashcat_crack", name: "Hashcat", description: "Advanced password recovery", command: "hashcat -m 0 -a 0 hashes.txt wordlist.txt", status: "ready" },
            { id: "password_auditor", name: "Hydra", description: "Online password attacks", command: "hydra -l user -P passlist.txt ssh://target", status: "ready" }
        ]
    },
    {
        category: "Lateral Movement",
        icon: Ghost,
        tools: [
            { id: "network_toolkit", name: "Impacket", description: "Network protocols toolkit", command: "python3 psexec.py domain/user:pass@target", status: "ready" },
            { id: "cme_smb", name: "CrackMapExec", description: "Swiss army knife for pentesting", command: "cme smb subnet -u user -p pass", status: "ready" },
            { id: "winrm_access", name: "Evil-WinRM", description: "WinRM shell access", command: "evil-winrm -i target -u user -p pass", status: "ready" }
        ]
    }
];

export default function RedTeamPage() {
    const [activeTab, setActiveTab] = useState("Reconnaissance");
    const router = useRouter();

    const handleLaunch = (toolId: string) => {
        router.push(`/tools?tool_id=${toolId}`);
    };

    return (
        <div className="min-h-screen bg-[#0f0f13] text-white p-8 animate-fade-in font-mono">
            {/* Header */}
            <header className="mb-12 border-b border-red-900/30 pb-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <Skull className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-red-500">
                            Red Team Operations
                        </h1>
                        <p className="text-xs text-red-400/60 uppercase tracking-[0.3em]">
                            Adversary Simulation & Offensive Tactics
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar Nav */}
                <div className="col-span-3 space-y-2">
                    {RED_TEAM_TOOLS.map((section) => (
                        <button
                            key={section.category}
                            onClick={() => setActiveTab(section.category)}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left group",
                                activeTab === section.category
                                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <section.icon className={cn(
                                "w-5 h-5 transition-colors",
                                activeTab === section.category ? "text-red-500" : "text-gray-500 group-hover:text-white"
                            )} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {section.category}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="col-span-9">
                    <div className="bg-[#1a1a20] rounded-2xl border border-white/5 p-8 min-h-[600px] relative overflow-hidden">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-3">
                                <span className="w-2 h-8 bg-red-500 rounded-sm" />
                                {activeTab}
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {RED_TEAM_TOOLS.find(t => t.category === activeTab)?.tools.map((tool) => (
                                    <motion.div
                                        key={tool.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-6 bg-black/40 border border-white/5 rounded-xl hover:border-red-500/30 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                                                        {tool.name}
                                                    </h3>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                                                        tool.status === 'ready' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                            tool.status === 'missing' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                    )}>
                                                        {tool.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">{tool.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleLaunch(tool.id)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                            >
                                                Launch
                                            </button>
                                        </div>

                                        <div className="bg-black rounded-lg p-3 border border-white/5 flex items-center justify-between font-mono text-xs">
                                            <code className="text-green-400/80">
                                                <span className="text-red-500 mr-2">$</span>
                                                {tool.command}
                                            </code>
                                            <button className="text-gray-500 hover:text-white p-1">
                                                <Terminal className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
