import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Menu, Search, Bell, Terminal, User, Settings, ChevronDown,
    Grid3X3, Filter, Clock, Edit, MoreVertical, Bot,
    Shield, LayoutDashboard, LogOut
} from "lucide-react";
import SearchAutocomplete from "./SearchAutocomplete";
import { NotificationPanel } from "./NotificationSystem";

interface DashboardHeaderProps {
    dashboardName?: string;
    onSearch?: (query: string) => void;
    onMenuClick?: () => void;
    unreadNotifications?: number;
}

export default function DashboardHeader({
    dashboardName = "DH-SOC_Dashboard",
    onSearch,
    onMenuClick,
    unreadNotifications = 3,
}: DashboardHeaderProps) {
    const router = useRouter();
    const [isLive, setIsLive] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [liveBlinking, setLiveBlinking] = useState(false);

    // Blink Live indicator on state change
    useEffect(() => {
        if (isLive) {
            setLiveBlinking(true);
            const timer = setTimeout(() => setLiveBlinking(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isLive]);

    return (
        <div className="sticky top-0 z-30 w-full mb-4">
            {/* Dashboard Actions Bar (Simplified) */}
            <div className="flex items-center justify-between bg-slate-900/40 border-b border-slate-800/50 px-4 py-2 backdrop-blur-sm rounded-lg border border-slate-800/30">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-medium text-white shadow-cyan-500/20 drop-shadow-sm">{dashboardName}</h1>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Shield className="h-3 w-3 text-cyan-500" />
                        <span>Security Level: High</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition active:scale-95 ${showFilters
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                            : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"
                            }`}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filters</span>
                        {showFilters && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    </button>

                    <div className="h-4 w-px bg-slate-700" />

                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition active:scale-95 ${isLive
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800/60 border border-slate-700/50 text-slate-500"
                            }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${isLive
                            ? `bg-emerald-400 ${liveBlinking ? 'animate-ping' : 'animate-pulse'}`
                            : "bg-slate-600"
                            }`} />
                        Live
                    </button>

                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadNotifications > 0 && (
                            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </button>
                    <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Notification Slide-over */}
            <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
