"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Shield, Terminal, Cpu, Activity, Sparkles, BrainCircuit, Command, Globe, Crosshair, Radar, Server, Zap, Braces, Files } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function MiniAgentPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "MINI-AGENT CORE v0.1.0 INITIALIZED. [MODEL: ANTIGRAPHITY]. Salam! I am the Mini-Agent, integrated into Bouclier SaaS. I can help you with complex tasks, file operations, and security analysis using specialized skills. My quota is set to 100,000 tokens for this session. How can I assist you today?",
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
        const data = await apiClient("/api/mini-agent/chat", {
          json: { 
            message: userMsg.content,
            history: messages.map(m => ({ role: m.role, content: m.content }))
          }
        });

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "ERROR: Failed to connect to Mini-Agent Core at backend. Please ensure the backend is running.",
          timestamp: new Date().toISOString(),
        }]);
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between cyber-panel p-6 overflow-hidden relative group border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 opacity-50" />
        <div className="scanline" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative group/icon">
            <div className="absolute -inset-1 bg-purple-500 rounded-2xl blur opacity-25 group-hover/icon:opacity-75 transition duration-1000 animate-pulse"></div>
            <div className="relative h-14 w-14 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover/icon:border-purple-400/60 transition-colors">
              <Zap className="h-8 w-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Mini <span className="text-purple-400">Agent</span></h1>
              <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Advanced Task Orchestrator</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-400/5 px-2.5 py-1 rounded-lg border border-purple-500/10">
                <Activity className="h-3 w-3" />
                Task Processing
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight font-mono opacity-60">
                Model: Antigraphity (Enhanced) // Status: Ready
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 relative z-10">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Token Quota</span>
            <span className="text-sm font-black text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              100,000 Remaining
            </span>
          </div>
        </div>
      </header>

      {/* Main Chat Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">

        {/* Left Side: Skills & Info */}
        <div className="hidden lg:flex flex-col gap-6 col-span-1">
          <div className="cyber-panel p-6 space-y-6 bg-slate-950/40 backdrop-blur-xl border-purple-500/10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Braces className="h-3 w-3 text-purple-400" /> Active Skills
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "File Operations", icon: Files },
                  { label: "Bash Execution", icon: Terminal },
                  { label: "Web Scan Analysis", icon: Crosshair },
                  { label: "Report Generation", icon: Server },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300"
                  >
                    <s.icon className="h-4 w-4 text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Activity className="h-3 w-3 text-purple-400" /> Performance
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Reasoning Depth", status: "High", color: "text-purple-400" },
                  { name: "Tool Accuracy", status: "98%", color: "text-emerald-400" },
                  { name: "Latency", status: "850ms", color: "text-cyan-400" },
                ].map(m => (
                  <div key={m.name} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">{m.name}</span>
                    <span className={m.color}>{m.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Agent Chat */}
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
                      : "bg-purple-500/10 border-purple-500/30 text-purple-400 cyber-glow-purple"
                  )}>
                    {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "flex flex-col gap-3 max-w-[85%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-5 rounded-[2rem] border shadow-2xl relative overflow-hidden",
                      msg.role === "user"
                        ? "bg-slate-900/60 border-white/10 text-slate-300 rounded-tr-none"
                        : "bg-slate-900/40 backdrop-blur-xl border-purple-500/20 text-white rounded-tl-none cyber-glass"
                    )}>
                      {msg.role === "assistant" && <div className="absolute top-0 right-0 p-3 opacity-5"><Cpu /></div>}
                      <p className="text-sm leading-relaxed font-medium tracking-wide whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                      <span
                        suppressHydrationWarning
                        className="text-[9px] font-black text-slate-600 uppercase tracking-widest"
                      >
                        {msg.role === "user" ? "Operator" : "Mini-Agent"} // {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="cyber-panel px-6 py-4 flex gap-2 items-center bg-slate-900/40 border-purple-500/20">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] animate-pulse">Processing Task...</span>
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="h-1 w-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="mt-auto relative cyber-panel p-2 flex items-center gap-4 bg-slate-900/40 border-white/10 group focus-within:border-purple-500/30 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-600 group-focus-within:text-purple-400 transition-colors">
              <Command className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Assign a task to Mini-Agent..."
              className="flex-1 bg-transparent px-2 py-4 text-[12px] font-black text-white placeholder-slate-700 uppercase tracking-widest focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-12 px-8 rounded-xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition disabled:opacity-30 flex items-center gap-2 hover:scale-[1.02] active:scale-95 group-focus-within:shadow-purple-500/20"
              >
                EXECUTE
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
