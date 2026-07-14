"use client";

import { motion } from 'framer-motion';
import { Bot, X, Maximize2, Terminal, Zap, ShieldCheck } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import { useSecurityWebSocket } from '@/hooks/useSecurityAPI';
import { apiClient } from '@/lib/api-client';

export function SentinelTerminal() {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputVal, setInputVal] = useState("");
    const [logs, setLogs] = useState<Array<{ ts: string, msg: string, type: string }>>([
        { ts: new Date().toLocaleTimeString(), msg: "AI Pentester Automated Installer linked. Ready for commands.", type: "system" },
        { ts: new Date().toLocaleTimeString(), msg: "Type 'help' or 'install <tool>' (e.g. install nmap).", type: "system" }
    ]);
    const [systemStatus, setSystemStatus] = useState({
        core: "SECURE",
        engine: "ACTIVE"
    });

    const handleCommand = async () => {
        if (!inputVal.trim()) return;
        
        const cmd = inputVal.trim();
        setInputVal("");

        // User message
        const newLog = { ts: new Date().toLocaleTimeString(), msg: `> ${cmd}`, type: "command" };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
        
        try {
            // Real API Call to Tools-API or Main Backend
            const data = await apiClient("/api/sentinel/chat", {
                method: "POST",
                json: { message: cmd },
            });
            
            const replyLog = { 
                ts: new Date().toLocaleTimeString(), 
                msg: data.content || data.result || "Command processed by AI Core.", 
                type: "system" 
            };
            setLogs(prev => [replyLog, ...prev].slice(0, 50));
        } catch (error) {
            const errorLog = { 
                ts: new Date().toLocaleTimeString(), 
                msg: "[ERROR] AI Core unreachable. Check backend status.", 
                type: "system" 
            };
            setLogs(prev => [errorLog, ...prev].slice(0, 50));
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
             handleCommand();
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`fixed bottom-8 right-8 z-[100] w-[400px] flex flex-col bg-[#050505]/95 backdrop-blur-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-amber-500/5 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500 blur-md opacity-20 animate-pulse" />
                        <Terminal className="w-5 h-5 text-amber-500 relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-100 leading-none">AI_PENTESTER_CHAT</h3>
                        <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-0.5 block">Automated Tool Deployment</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 transition-colors">
                        <Maximize2 className="w-3 h-3 text-zinc-500" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/10 group transition-colors">
                        <X className="w-3 h-3 text-zinc-500 group-hover:text-red-500" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar flex flex-col-reverse font-mono">
                        <div className="space-y-4 flex flex-col justify-end">
                            {[...logs].reverse().map((log, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">[{log.ts}]</span>
                                    <div className={`p-3 border leading-relaxed text-[10px] break-words whitespace-pre-wrap ${log.type === 'command' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 self-end ml-12 rounded-tl-xl rounded-b-xl' : 'bg-black border-zinc-800 text-zinc-400 self-start mr-12 rounded-tr-xl rounded-b-xl'}`}>
                                        {log.msg}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black border-t border-amber-500/20">
                        <div className="relative group flex items-center gap-2">
                            <span className="text-amber-500 font-mono text-xs font-bold shrink-0">root@ai:~#</span>
                            <input
                                type="text"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="enter command (e.g. install nmap)"
                                className="w-full bg-transparent border-none py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:ring-0 placeholder:text-zinc-700"
                            />
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
