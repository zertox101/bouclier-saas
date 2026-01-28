"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Terminal, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

type ToolStatus = {
    name: string;
    command: string;
    installed: boolean;
    category: string;
};

const CRITICAL_TOOLS = [
    { name: "Nmap", command: "nmap", category: "Network" },
    { name: "SQLmap", command: "sqlmap", category: "Web" },
    { name: "Metasploit", command: "msfconsole", category: "Exploit" },
    { name: "Hydra", command: "hydra", category: "Password" },
    { name: "Nikto", command: "nikto", category: "Web" },
    { name: "theHarvester", command: "theHarvester", category: "OSINT" },
    { name: "CrackMapExec", command: "crackmapexec", category: "Post-Exploit" },
    { name: "Aircrack-ng", command: "aircrack-ng", category: "Wireless" },
    { name: "Nuclei", command: "nuclei", category: "Vuln Scanner" },
    { name: "BloodHound", command: "bloodhound-python", category: "AD" },
    { name: "Empire", command: "empire", category: "C2" },
    { name: "Radare2", command: "r2", category: "Reverse Eng" },
];

export default function ToolsStatusWidget() {
    const [toolsStatus, setToolsStatus] = useState<ToolStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkToolsStatus = async () => {
        setLoading(true);
        try {
            // Simulate checking tool availability
            // In production, this would call the tools-api to verify each tool
            const statuses = CRITICAL_TOOLS.map(tool => ({
                ...tool,
                installed: Math.random() > 0.1, // Simulate 90% success rate
            }));

            setToolsStatus(statuses);
            setLastCheck(new Date());
        } catch (error) {
            console.error("Failed to check tools status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkToolsStatus();
        const interval = setInterval(checkToolsStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const installedCount = toolsStatus.filter(t => t.installed).length;
    const totalCount = toolsStatus.length;
    const healthPercentage = totalCount > 0 ? Math.round((installedCount / totalCount) * 100) : 0;

    return (
        <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-cyan-400" />
                        Offensive Tools Status
                    </CardTitle>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-500">
                                {lastCheck?.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Health Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Arsenal Health</span>
                        <span className="font-bold text-white">{installedCount}/{totalCount}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${healthPercentage}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${healthPercentage >= 90 ? 'bg-emerald-500' :
                                    healthPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Operational Status</span>
                        <span className={`text-xs font-bold ${healthPercentage >= 90 ? 'text-emerald-400' :
                                healthPercentage >= 70 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {healthPercentage >= 90 ? 'OPTIMAL' :
                                healthPercentage >= 70 ? 'DEGRADED' : 'CRITICAL'}
                        </span>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {toolsStatus.map((tool, idx) => (
                        <motion.div
                            key={tool.command}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${tool.installed
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-red-500/5 border-red-500/20'
                                }`}
                        >
                            {tool.installed ? (
                                <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                            ) : (
                                <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                    {tool.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                    {tool.category}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                        onClick={checkToolsStatus}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <Shield className="h-3 w-3" />
                                Refresh Status
                            </>
                        )}
                    </button>
                    <a
                        href="/arsenal"
                        className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap className="h-3 w-3" />
                        View Arsenal
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
