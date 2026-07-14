"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, Terminal, Shield, Zap, Search, Activity, Cpu, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_CONFIG } from "@/lib/api-config";

type ToolStatus = {
    id: string;
    name: string;
    status: string; // "ready", "missing", "blocked"
    category: string;
    description: string;
};

interface Props {
    variant?: "default" | "compact";
}

export default function ToolsStatusWidget({ variant = "default" }: Props) {
    const [tools, setTools] = useState<ToolStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState<string>("---");

    const checkToolsStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.TOOLS_API_BASE}/tools/status`, {
                headers: { "X-API-KEY": API_CONFIG.TOOLS_API_KEY },
            });
            if (res.ok) {
                const data = await res.json();
                setTools(data.tools || []);
                setLastCheck(new Date().toLocaleTimeString('en-US', { hour12: false }));
            }
        } catch (error) {
            console.error("Failed to check tools status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkToolsStatus();
        const interval = setInterval(checkToolsStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const readyCount = tools.filter(t => t.status === 'ready').length;
    const totalCount = tools.length;
    const healthPercentage = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-6 bg-[#0D1017] border border-white/5 p-4 py-3 rounded-[2px] shadow-sm">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Arsenal_Sync</span>
                    <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", healthPercentage > 80 ? "bg-emerald-500" : "bg-amber-500")} />
                        <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-tighter">
                            {readyCount}/{totalCount} READY
                        </span>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-white/5" />

                <div className="flex-1 min-w-[150px]">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Global_Status</span>
                        <span className="text-[8px] font-mono text-blue-500">{healthPercentage}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${healthPercentage}%` }}
                            className="h-full bg-blue-600"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#0D1017] border border-white/5 rounded-[2px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-[1px]" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Security_Suite_Telemetry</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-slate-600">SYNC_ID: {lastCheck}</span>
                    <button onClick={checkToolsStatus} disabled={loading}>
                        <RefreshCwIcon className={cn("w-3 h-3 text-slate-500 hover:text-white transition-colors", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 space-y-6">
                
                {/* Visual Indicators */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/20 p-3 rounded-[2px] border border-white/2 flex flex-col items-center justify-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[14px] font-mono font-black text-white">{readyCount}</span>
                        <span className="text-[7px] font-black text-slate-600 uppercase">Operational</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-[2px] border border-white/2 flex flex-col items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[14px] font-mono font-black text-white">{tools.filter(t => t.status !== 'ready').length}</span>
                        <span className="text-[7px] font-black text-slate-600 uppercase">Missing</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-[2px] border border-white/2 flex flex-col items-center justify-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[14px] font-mono font-black text-white">{healthPercentage}%</span>
                        <span className="text-[7px] font-black text-slate-600 uppercase">Health</span>
                    </div>
                </div>

                {/* Scrolable Tools List (Palantir Density) */}
                <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                    {tools.map((tool, idx) => (
                        <div 
                            key={tool.id} 
                            className="flex items-center justify-between p-2.5 bg-white/2 border border-transparent hover:border-white/5 transition-all group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                {tool.status === 'ready' ? (
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                ) : (
                                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                )}
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest truncate">{tool.name}</span>
                                    <span className="text-[7px] font-bold text-slate-600 uppercase truncate">{tool.category}</span>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-[1px]",
                                tool.status === 'ready' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {tool.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer Link */}
                <a 
                    href="/shadow-root"
                    className="w-full flex items-center justify-between px-4 py-2 border border-blue-600/30 hover:bg-blue-600/5 transition-all group"
                >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Launch_Full_Arsenal</span>
                    <ChevronRightIcon className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}

function RefreshCwIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
}

function ChevronRightIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
}
