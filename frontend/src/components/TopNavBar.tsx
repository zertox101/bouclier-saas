"use client";

import { Bell, ChevronDown, Clock, Search, Signal, User, Shield, Terminal, Zap, Activity, Cpu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sectionTabs = [
  { label: "Internal SOC", href: "/app" },
  { label: "Threat Intel", href: "/threat-map-pro" },
  { label: "Traffic Dissector", href: "/traffic" },
  { label: "DDoS Center", href: "/ddos" },
  { label: "Sentinel AI", href: "/sentinel" },
];

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-1 bg-bg-0/80 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-3">

        {/* Left: Command Search */}
        <div className="flex w-full max-w-2xl items-center gap-6">
          <div className="relative w-full group">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3 group-focus-within:text-p-400 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH ASSETS, THREATS, OR SIGNATURES..."
              className="w-full rounded-2xl border border-border-1 bg-bg-2/50 py-3 pl-12 pr-16 text-[10px] font-black text-text-1 uppercase tracking-widest outline-none transition-all focus:border-p-500/30 focus:bg-bg-1 focus:ring-4 focus:ring-p-500/5 placeholder:text-text-3/50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg border border-border-1 bg-bg-1 text-[8px] font-black text-text-3 tracking-tighter shadow-sm">
              ⌘ K
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-bg-2/50 border border-border-1 rounded-2xl px-5 py-2.5">
            <div className="flex flex-col items-start pr-4 border-r border-border-1">
              <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Spectral Integrity</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-black text-success uppercase tracking-widest">Synchronized</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400 shadow-[0_0_10px_rgba(167,139,250,0.1)]">
                <Shield className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Identity & Services */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5 pr-6 border-r border-border-1">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">Processing Node</span>
              <span className="text-[11px] font-black text-text-1 font-mono tracking-tighter">BOUCLIER_ALPHA_01</span>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-p-400 transition-colors">
              <Cpu className="h-5 w-5" />
            </div>
          </div>

          <button className="relative group h-10 w-10 rounded-2xl border border-border-1 bg-bg-2/50 flex items-center justify-center text-text-2 transition hover:border-p-500/30 hover:text-text-1">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-danger border-2 border-bg-0 translate-x-1/4 -translate-y-1/4" />
          </button>

          <div className="flex items-center gap-4 rounded-3xl border border-border-1 bg-bg-2/50 pl-5 pr-2 py-2 group hover:border-border-2 transition-all cursor-pointer">
            <div className="hidden text-right md:block">
              <div className="text-[10px] font-black text-text-1 uppercase tracking-widest flex items-center gap-2">
                Root_Administrator
                <ChevronDown className="h-3 w-3 text-text-3 group-hover:text-text-1 transition-colors" />
              </div>
              <div className="text-[8px] font-black text-p-400 uppercase tracking-[0.2em] mt-0.5">Level_04 Persistence</div>
            </div>
            <div className="h-10 w-10 rounded-[1.25rem] bg-gradient-to-br from-bg-2 to-bg-0 border border-border-1 flex items-center justify-center text-text-2 relative overflow-hidden group-hover:scale-105 transition-transform">
              <User className="h-5 w-5" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-p-500/20 blur-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation HUD */}
      <div className="flex items-center gap-10 px-8 py-1 text-[9px] font-black text-text-3 tracking-[0.3em] uppercase border-t border-border-1 bg-bg-0/90">
        <nav className="flex items-center gap-2">
          {sectionTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <button
                key={tab.label}
                onClick={() => router.push(tab.href)}
                className={cn(
                  "px-5 py-3 transition-all relative group",
                  isActive ? "text-text-1" : "text-text-3 hover:text-text-1"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="top-nav-indicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-p-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                    initial={false}
                  />
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-p-500/10 to-transparent pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-success">
            <Activity className="h-3 w-3" />
            <span className="font-black letter-spacing-[0.2em]">Network_Pulse::OS_OK</span>
          </div>
          <div className="h-3 w-px bg-border-1" />
          <div className="flex items-center gap-2.5 text-text-3">
            <Clock className="h-3 w-3" />
            <span className="font-black font-mono tracking-tight">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
          <div className="h-3 w-px bg-border-1" />
          <div className="flex items-center gap-2 text-p-400/80">
            <Zap className="h-3 w-3 fill-current" />
            <span className="font-black">G-NODE::SEA</span>
          </div>
        </div>
      </div>
    </header>
  );
}
