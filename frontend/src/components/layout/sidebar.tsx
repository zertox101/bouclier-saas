"use client"

import * as React from "react"
import { LayoutDashboard, AlertTriangle, FileText, Settings, Shield, Menu, Bell, Search, User, Scan, Terminal, Activity, Upload, Wifi, Globe } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from "../../lib/utils"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/overview" },
    { icon: Scan, label: "Vuln Scanner", href: "/scanner" },
    { icon: FileText, label: "Scan Reports", href: "/results" },
    { icon: Terminal, label: "Security Tools", href: "/tools" },
    { icon: Search, label: "SentinelAI Prompt", href: "/sentinel" },
    { icon: Shield, label: "Threat Map", href: "/threat-map" },
    { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
    { icon: Activity, label: "DDoS Detection", href: "/ddos" },
    { icon: Wifi, label: "Live Traffic", href: "/traffic" },
    { icon: Upload, label: "Log Analysis", href: "/analysis" },
    { icon: FileText, label: "All Logs", href: "/logs" },
    { icon: User, label: "Users & Roles", href: "/users" },
    { icon: Globe, label: "Integration", href: "/deploy" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 z-50 flex flex-col",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-4 border-b border-slate-800">
                <Shield className="w-8 h-8 text-cyan-400 mr-2" />
                {!collapsed && (
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-wider">
                        CYBER<span className="text-white">SHIELD</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400")} />
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}

                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#06b6d4]"></div>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Footer Toggle */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full p-2 rounded-md hover:bg-slate-900 text-slate-500 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </aside>
    )
}
