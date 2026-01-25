import { SseStatus } from "@/lib/sse";
import { cn } from "@/lib/utils";
import { Zap, ZapOff, RefreshCcw } from "lucide-react";

interface SseStatusIndicatorProps {
    status: SseStatus;
}

export function SseStatusIndicator({ status }: SseStatusIndicatorProps) {
    const configs: Record<string, { color: string; label: string; icon: any; animate?: string }> = {
        connected: {
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            label: "Live System Synchronized",
            icon: Zap,
        },
        reconnecting: {
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            label: "Signal Lost - Resyncing",
            icon: RefreshCcw,
            animate: "animate-spin",
        },
        disconnected: {
            color: "text-slate-500 bg-slate-900 border-white/5",
            label: "Offline Mode",
            icon: ZapOff,
        },
        error: {
            color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            label: "Encryption Failure",
            icon: ZapOff,
        }
    };

    const current = configs[status] || configs.disconnected;
    const Icon = current.icon;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
            current.color
        )}>
            <Icon className={cn("w-3.5 h-3.5", current.animate)} />
            {current.label}
            {status === 'connected' && (
                <span className="relative flex h-1.5 w-1.5 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
            )}
        </div>
    );
}
