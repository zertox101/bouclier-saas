import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    subValue?: string;
    color?: 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber';
}

export function KpiCard({
    label,
    value,
    icon: Icon,
    trend,
    subValue,
    color = 'violet'
}: KpiCardProps) {
    const colors = {
        violet: "text-violet-400 group-hover:text-violet-300",
        cyan: "text-cyan-400 group-hover:text-cyan-300",
        emerald: "text-emerald-400 group-hover:text-emerald-300",
        rose: "text-rose-400 group-hover:text-rose-300",
        amber: "text-amber-400 group-hover:text-amber-300",
    };

    const bgGlows = {
        violet: "bg-violet-500/5",
        cyan: "bg-cyan-500/5",
        emerald: "bg-emerald-500/5",
        rose: "bg-rose-500/5",
        amber: "bg-amber-500/5",
    };

    return (
        <GlassCard className="group relative overflow-hidden">
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", bgGlows[color])} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={cn("p-2 rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:border-white/20", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border",
                        trend >= 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                        {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</div>
                <motion.div
                    key={value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black text-white tracking-widest"
                >
                    {value}
                </motion.div>
                {subValue && (
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{subValue}</div>
                )}
            </div>
        </GlassCard>
    );
}
