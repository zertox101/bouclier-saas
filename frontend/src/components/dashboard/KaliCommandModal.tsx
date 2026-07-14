"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Play, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useSecurityWebSocket } from "@/hooks/useSecurityAPI";

interface KaliCommandModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function KaliCommandModal({ isOpen, onClose }: KaliCommandModalProps) {
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // We can reuse the websocket to listen for job updates if we want, 
    // or just rely on the job start response.
    // For this simple modal, let's just fire and forget, then maybe show a "Job Started" toast.

    const handleExecute = async () => {
        if (!command.trim()) return;

        setIsRunning(true);
        setOutput(prev => [...prev, `root@kali:~# ${command}`]);

        try {
            // Call the tools API directly (assuming proxy or direct access)
            const response = await fetch("http://localhost:8100/tools/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tool_id: "kali_custom_tool",
                    input: { command: command }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Command failed");
            }

            const data = await response.json();
            setOutput(prev => [...prev, `[+] Job started: ${data.job_id}`, "Waiting for output stream..."]);

            // In a full implementation, we would subscribe to the job stream.
            // For now, we'll clear the input and show success.
            setCommand("");

        } catch (error: any) {
            setOutput(prev => [...prev, `[-] Error: ${error.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-[500px] z-[101] flex flex-col pointer-events-none" // pointer-events-none to let click through to backdrop, but content will reset it
                    >
                        <div className="pointer-events-auto w-full h-full bg-[#0d0d0d] border border-p-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-p-500/10 rounded-lg border border-p-500/20">
                                        <Terminal className="w-5 h-5 text-p-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Kali Terminal</h3>
                                        <span className="text-[10px] text-zinc-500 font-mono">root@bouclier-tools:~</span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            {/* Output Area */}
                            <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-2 bg-black/50 custom-scrollbar">
                                <div className="text-zinc-500">Bouclier Security OS [Version 2.4.0]</div>
                                <div className="text-zinc-500">(c) 2026 Bouclier Corp. All rights reserved.</div>
                                <div className="h-4" />
                                {output.map((line, i) => (
                                    <div key={i} className={`${line.startsWith("[-]") ? "text-red-400" : line.startsWith("[+]") ? "text-green-400" : "text-zinc-300"}`}>
                                        {line}
                                    </div>
                                ))}
                                {isRunning && (
                                    <div className="flex items-center gap-2 text-p-400 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Executing...</span>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white/5 border-t border-white/10">
                                <div className="relative flex items-center gap-2">
                                    <span className="text-p-400 font-bold ml-2">{`>`}</span>
                                    <input
                                        type="text"
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleExecute()}
                                        autoFocus
                                        placeholder="Enter command (e.g. nmap -sV 127.0.0.1)..."
                                        className="flex-1 bg-transparent border-none text-white focus:ring-0 font-mono placeholder:text-zinc-600"
                                        disabled={isRunning}
                                    />
                                    <button
                                        onClick={handleExecute}
                                        disabled={isRunning || !command.trim()}
                                        className="px-4 py-2 bg-p-600 hover:bg-p-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                                    >
                                        {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Run
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
