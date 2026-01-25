import * as React from "react"
import { Bell, Search, User, ShieldAlert } from "lucide-react"

export function Navbar() {
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">

            {/* Left: Breadcrumbs or Search */}
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search threats, logs, IPs..."
                        className="bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 w-64 transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">

                {/* System Status Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-mono text-emerald-400 font-medium">SYSTEM SECURE</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-slate-200">Admin User</div>
                        <div className="text-xs text-slate-500">Security Analyst</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </header>
    )
}
