
import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean
}

export function GlassCard({ className, hoverEffect = true, children, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "bg-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl transition-all duration-300",
                hoverEffect && "hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
