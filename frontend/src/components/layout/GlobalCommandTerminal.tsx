"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Search, Zap, Shield, Cpu, Target, Command as CommandIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalCommandTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS = [
    { cmd: "/overview", desc: "Executive Dashboard Overview", action: () => router.push("/overview") },
    { cmd: "/soc", desc: "Enter Operation SOC Expert Center", action: () => router.push("/operation-soc-expert") },
    { cmd: "/map", desc: "Open Gaia 3D Global Threat Map", action: () => router.push("/threat-map-pro") },
    { cmd: "/alerts", desc: "Access SOC Alert Inbox & Triage", action: () => router.push("/alerts") },
    { cmd: "/reasoning", desc: "Access Neural Reasoning Core", action: () => router.push("/ai-reasoning") },
    { cmd: "/pentest", desc: "Launch AI Pentesting Module", action: () => router.push("/ai-pentester") },
    { cmd: "/osint", desc: "Open OSINT 360 Explorer", action: () => router.push("/osint") },
    { cmd: "/wiretap", desc: "Execute SIGINT WireTapper Intercept", action: () => router.push("/wiretapper") },
    { cmd: "/infra", desc: "Check Global Infrastructure Status", action: () => router.push("/infrastructure") },
    { cmd: "/malware", desc: "Enter Malware Analysis Sandbox", action: () => router.push("/malware-lab") },
    { cmd: "/reports", desc: "View Advanced Reports & Forensic Dossiers", action: () => router.push("/reports") },
    { cmd: "/offensive", desc: "Launch Offensive Security Consultant Suite", action: () => router.push("/offensive-consultant") },
    { cmd: "/neural", desc: "Launch Neural Pentest Suite — Autonomous Offensive Mode", action: () => router.push("/neural-pentest") },
    { cmd: "/mythos", desc: "Access Mythos Strategic Intelligence", action: () => router.push("/mythos-intelligence") },
    { cmd: "/wstg", desc: "OWASP WSTG Web Security Scanner — Full Web Pentest", action: () => router.push("/wstg-scanner") },
    { cmd: "/raptor", desc: "RAPTOR AI — Autonomous Security Research Framework", action: () => router.push("/raptor") },
    { cmd: "/grc", desc: "Open Governance, Risk & Compliance", action: () => router.push("/grc") },
    { cmd: "/redhound", desc: "Run RedHound Active Directory Audit", action: () => router.push("/red-hound") },
    { cmd: "/datasets", desc: "Manage AI Training Datasets", action: () => router.push("/datasets") },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.startsWith("/")) {
      const filtered = COMMANDS.filter(c => c.cmd.startsWith(val)).map(c => c.cmd);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleExecute = (cmdStr: string) => {
    const found = COMMANDS.find(c => c.cmd === cmdStr || cmdStr.startsWith(c.cmd));
    if (found) {
      found.action();
      setHistory(prev => [cmdStr, ...prev].slice(0, 5));
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      {/* Search Trigger Button (Visual only) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
      >
        <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Execute Command...</span>
        <div className="flex items-center gap-1 ml-4 px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
          <CommandIcon className="w-2.5 h-2.5 text-slate-600" />
          <span className="text-[9px] font-black text-slate-600">K</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Terminal Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0a0e17] border border-white/10 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <Terminal className="w-5 h-5 text-blue-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleExecute(query)}
                  placeholder="Enter neural command (e.g. /scan 10.0.1.1)..."
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-slate-600"
                />
                <button onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {query.length === 0 && history.length > 0 && (
                  <div className="mb-6">
                    <p className="px-3 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Recent Commands</p>
                    {history.map((h, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleExecute(h)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all text-sm font-mono"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-600" />
                        {h}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <p className="px-3 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {query.length > 0 ? "Matching Directives" : "Available Directives"}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {(query.length > 0 ? COMMANDS.filter(c => c.cmd.includes(query)) : COMMANDS).map((c, i) => (
                      <button 
                        key={i}
                        onClick={() => handleExecute(c.cmd)}
                        className="group w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-blue-600/10 border border-transparent hover:border-blue-500/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                            {c.cmd.includes("map") ? <Target className="w-4 h-4 text-blue-400" /> : 
                             c.cmd.includes("pentest") ? <Cpu className="w-4 h-4 text-purple-400" /> :
                             c.cmd.includes("raptor") ? <Zap className="w-4 h-4 text-amber-400" /> :
                             <Shield className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-white font-mono">{c.cmd}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{c.desc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-700 font-black group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all italic">EXECUTE_CMD →</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white">ENTER</kbd> to run</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white">ESC</kbd> to close</span>
                </div>
                <p className="text-[9px] font-black text-blue-500/50 uppercase italic tracking-widest">Sentinel Command Protocol v1.0.4</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
