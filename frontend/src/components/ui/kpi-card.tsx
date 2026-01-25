
import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon: LucideIcon
    className?: string
}

export function KpiCard({ title, value, change, trend, icon: Icon, className }: KpiCardProps) {
    return (
        <GlassCard className={cn("p-4 flex flex-col justify-between h-32", className)}>
            <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground font-medium">{title}</span>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
                {change && (
                    <div className={cn(
                        "text-xs mt-1 flex items-center",
                        trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
                    )}>
                        {change}
                    </div>
                )}
            </div>
        </GlassCard>
    )
}
