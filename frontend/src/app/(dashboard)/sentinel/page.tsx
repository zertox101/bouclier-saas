"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Shield, Terminal, Mic, Cpu, Activity, Sparkles, BrainCircuit, Command, Globe, Crosshair, Radar, Server } from "lucide-react";
import { ENDPOINTS, fetchAPI } from "@/lib/api-config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: Action[];
}

interface Action {
  type: "navigate" | "command" | "mitigate" | "lookup";
  label: string;
  path?: string;
  command?: string;
  action?: string;
}

export default function SentinelChatPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "NEURAL ENGINE INITIALIZED. Salam, I am Sentinel, your AI Security Analyst. Mrehab bik! Everything looks stable on our end. How can I help you secure the perimeter today?",
      timestamp: new Date().toISOString(),
    }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await fetchAPI<any>(ENDPOINTS.SENTINEL_CHAT, {
        method: "POST",
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (data) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
          actions: data.actions,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "COMMUNICATION_FAULT:: Kayn chi problem f connection m3a Sentinel Core. Re-establishing secure uplink...",
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: Action) => {
    if (action.type === "navigate" && action.path) {
      router.push(action.path);
    } else {
      alert(`Executing: ${action.label}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between cyber-panel p-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 opacity-50" />
        <div className="scanline" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative group/icon">
            <div className="absolute -inset-1 bg-cyan-500 rounded-2xl blur opacity-25 group-hover/icon:opacity-75 transition duration-1000 animate-pulse"></div>
            <div className="relative h-14 w-14 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover/icon:border-cyan-400/60 transition-colors">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Sentinel <span className="text-cyan-400">Core</span></h1>
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Analyst dyalna</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                <Activity className="h-3 w-3" />
                Live Oversight
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight font-mono opacity-60">
                Lat: 12ms // Sig_Strength: 98% // Region: MA-CAS-01
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 relative z-10">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Engine</span>
            <span className="text-sm font-black text-white">Quantum-V4</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Security Layer</span>
            <span className="text-sm font-black text-cyan-400 uppercase">Shielded</span>
          </div>
        </div>
      </header>

      {/* Main Chat Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">

        {/* Left Side: Context & Shortcuts */}
        <div className="hidden lg:flex flex-col gap-6 col-span-1">
          <div className="cyber-panel p-6 space-y-6 bg-slate-950/40 backdrop-blur-xl border-white/5">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Terminal className="h-3 w-3 text-cyan-400" /> Tactical Shortcuts
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Global Overview", path: "/overview", icon: Globe },
                  { label: "Web Scan (ZAP)", path: "/scans", icon: Crosshair },
                  { label: "Threat Map", path: "/threat-map-pro", icon: Radar },
                  { label: "Asset Audit", path: "/assets", icon: Server },
                ].map((s) => (
                  <button
                    key={s.path}
                    onClick={() => router.push(s.path)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left text-slate-300 hover:text-white"
                  >
                    <s.icon className="h-4 w-4 text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Cpu className="h-3 w-3 text-cyan-400" /> Module Status
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Neural Link", status: "Active", color: "text-emerald-400" },
                  { name: "Log Ingestion", status: "Active", color: "text-emerald-400" },
                  { name: "Anom. Detection", status: "Learning", color: "text-amber-400" },
                ].map(m => (
                  <div key={m.name} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">{m.name}</span>
                    <span className={m.color}>{m.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center p-6 text-center opacity-30">
            <Shield className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Secure Environment Sandbox Active</p>
          </div>
        </div>

        {/* Center: Neural Link Chat */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-5",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Entity Icon */}
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-2xl border transition-all mt-1",
                    msg.role === "user"
                      ? "bg-slate-900 border-white/10 text-slate-400"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 cyber-glow-cyan"
                  )}>
                    {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>

                  {/* Neural Transmission */}
                  <div className={cn(
                    "flex flex-col gap-3 max-w-[85%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-5 rounded-[2rem] border shadow-2xl relative overflow-hidden",
                      msg.role === "user"
                        ? "bg-slate-900/60 border-white/10 text-slate-300 rounded-tr-none"
                        : "bg-slate-900/40 backdrop-blur-xl border-cyan-500/20 text-white rounded-tl-none cyber-glass"
                    )}>
                      {msg.role === "assistant" && <div className="absolute top-0 right-0 p-3 opacity-5"><Cpu /></div>}
                      <p className="text-sm leading-relaxed font-medium tracking-wide whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Subsidiarity Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                              action.type === "mitigate"
                                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                            )}
                          >
                            {action.type === "mitigate" ? <Shield className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        Transmission_{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="cyber-panel px-6 py-4 flex gap-2 items-center bg-slate-900/40">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] animate-pulse">Calculating...</span>
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Comm Link Input */}
          <form
            onSubmit={handleSendMessage}
            className="mt-auto relative cyber-panel p-2 flex items-center gap-4 bg-slate-900/40 border-white/10 group focus-within:border-cyan-500/30 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-600 group-focus-within:text-cyan-400 transition-colors">
              <Command className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sowl Sentinel (Ask anything)..."
              className="flex-1 bg-transparent px-2 py-4 text-[12px] font-black text-white placeholder-slate-700 uppercase tracking-widest focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden md:flex h-12 w-12 rounded-xl border border-white/5 text-slate-600 hover:text-white transition-all items-center justify-center"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 px-8 rounded-xl bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition disabled:opacity-30 flex items-center gap-2 hover:scale-[1.02] active:scale-95 group-focus-within:shadow-cyan-500/20"
              >
                SEND
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
