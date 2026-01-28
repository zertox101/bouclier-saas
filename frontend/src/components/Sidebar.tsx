"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Shield, LayoutDashboard, AlertTriangle,
  Terminal, BarChart3, Settings,
  ChevronRight, LogOut, Search,
  Zap, Globe, Database, ShieldAlert,
  Activity, Crosshair, Radar, Lock, Server,
  LogOut as LogoutIcon,
  User, Cpu, Wifi,
  Package, Eye, Star, Skull
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Navigation structured by category
const navSections = [
  {
    title: "Command Center",
    items: [
      { icon: LayoutDashboard, label: "Global Overview", href: "/overview", count: "HQ" },
      { icon: Activity, label: "Live Dashboard", href: "/dashboard", count: "LIVE" },
    ]
  },
  {
    title: "AI & Intelligence",
    items: [
      { icon: Zap, label: "AI Analyst", href: "/sentinel", count: "GPT", isPro: true },
      { icon: Wifi, label: "Traffic Analysis", href: "/traffic" },
      { icon: Globe, label: "Threat Intel", href: "/threat-map-pro", isPro: true },
    ]
  },
  {
    title: "Security Operations",
    items: [
      { icon: ShieldAlert, label: "Security Alerts", href: "/alerts", count: "12" },
      { icon: Eye, label: "Asset Monitor", href: "/assets", count: "142" },
      { icon: Search, label: "Log Archive", href: "/logs" },
    ]
  },
  {
    title: "Offensive Tools",
    items: [
      { icon: Crosshair, label: "Tactical Tools", href: "/tools", count: "60+" },
      { icon: Skull, label: "Red Team Ops", href: "/red-team", isPro: true },
      { icon: Radar, label: "Web Scanner", href: "/scans", isPro: true },
      { icon: Package, label: "Arsenal Browser", href: "/arsenal", count: "48" },
    ]
  },
  {
    title: "Administration",
    items: [
      { icon: Lock, label: "Governance", href: "/reports" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [platformMode, setPlatformMode] = useLocalStorage<"simulator" | "emulation">("platform-mode", "emulation");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-[60] bg-bg-1 border-r border-border-1 transition-all duration-500 ease-in-out group flex flex-col",
        isCollapsed ? "w-20" : "w-72"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 gap-4 overflow-hidden bg-bg-0/50">
        <div className="relative shrink-0">
          <div className="absolute -inset-2 bg-p-600 rounded-lg blur-lg opacity-20" />
          <div className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xl">
            <Shield className="w-5 h-5 text-black" />
          </div>
        </div>
        <div className={cn(
          "flex flex-col transition-all duration-300",
          isCollapsed ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
        )}>
          <span className="text-sm font-black tracking-tighter text-white uppercase leading-tight">BOUCLIER.</span>
          <span className="text-[8px] font-black text-p-400 uppercase tracking-widest">Enterprise SaaS</span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className={cn(
        "p-4 transition-all duration-300",
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <div className="bg-bg-0/60 border border-white/5 p-1 rounded-2xl flex relative h-10 shadow-inner">
          <motion.div
            className={cn(
              "absolute inset-y-1 rounded-xl shadow-lg transition-colors duration-500",
              platformMode === "simulator" ? "bg-[#F59E0B]" : "bg-white"
            )}
            initial={false}
            animate={{
              x: platformMode === "simulator" ? 0 : "100%",
              width: "calc(50% - 6px)",
              left: platformMode === "simulator" ? "4px" : "2px"
            } as any}
          />
          <button
            onClick={() => setPlatformMode("simulator")}
            className={cn(
              "flex-1 z-10 text-[8px] font-black uppercase tracking-tighter transition-all duration-300",
              platformMode === "simulator" ? "text-black scale-105" : "text-text-3 opacity-50"
            )}
          >
            Tactical Sim
          </button>
          <button
            onClick={() => setPlatformMode("emulation")}
            className={cn(
              "flex-1 z-10 text-[8px] font-black uppercase tracking-tighter transition-all duration-300",
              platformMode === "emulation" ? "text-black scale-105" : "text-text-3 opacity-50"
            )}
          >
            Live Core
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              platformMode === "emulation" ? "bg-[#10B981] shadow-[0_0_8px_#10B981]" : "bg-[#F59E0B] opacity-50"
            )} />
            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">
              {platformMode === "emulation" ? "Mkhdam (Live)" : "Mock Data"}
            </span>
          </div>
          <span className="text-[8px] font-mono text-white/20">v2.4</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section Header */}
            <div className={cn(
              "px-4 mb-2 transition-all duration-300",
              isCollapsed ? "opacity-0" : "opacity-100"
            )}>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">
                {section.title}
              </span>
            </div>

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group",
                      isActive ? "bg-white/5 text-white" : "text-text-3 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="relative shrink-0">
                      <item.icon className={cn(
                        "w-5 h-5 transition-all duration-500",
                        isActive ? "text-white" : "group-hover:text-p-400"
                      )} />
                      {isActive && (
                        <div className="absolute inset-0 blur-md bg-white/20 animate-pulse" />
                      )}
                    </div>

                    <div className={cn(
                      "flex-1 flex items-center justify-between transition-all duration-300 whitespace-nowrap",
                      isCollapsed ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                    )}>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.isPro && (
                          <span className={cn(
                            "text-[6px] font-black px-1.5 py-0.5 rounded-full border flex items-center gap-0.5",
                            isActive ? "bg-neon-1 text-black border-neon-1" : "bg-p-600/20 text-p-400 border-p-500/30"
                          )}>
                            <Star className="w-2 h-2" />
                            PRO
                          </span>
                        )}
                        {item.count && (
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded-full border",
                            isActive ? "bg-white text-black border-white" : "bg-white/5 text-text-3 border-white/10"
                          )}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="p-3 border-t border-white/5 bg-bg-0/30">
        <div className={cn(
          "flex items-center gap-4 px-4 py-3 cursor-pointer group hover:bg-white/5 rounded-xl transition-colors",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-full bg-p-600/20 border border-p-500/20 flex items-center justify-center text-p-400 shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>

          <div className={cn(
            "flex flex-col transition-all duration-300 flex-1 overflow-hidden",
            isCollapsed ? "opacity-0 hidden" : "opacity-100 block"
          )}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-white uppercase truncate">
                {session?.user?.name || "GUEST OPERATOR"}
              </span>
              {session?.user?.orgPlan && (
                <span className={cn(
                  "text-[6px] font-black px-1 rounded uppercase tracking-wider",
                  session.user.orgPlan === "PRO" ? "bg-neon-1 text-black" : "bg-white/10 text-white/60"
                )}>
                  {session.user.orgPlan}
                </span>
              )}
            </div>
            <span className="text-[8px] text-text-3 truncate">
              {session?.user?.orgName || session?.user?.email || "No Active Session"}
            </span>
          </div>

          {!isCollapsed && (
            <button
              onClick={() => session ? signOut() : null}
              className="text-text-3 hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors"
              title={session ? "Sign Out" : "No Session"}
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
