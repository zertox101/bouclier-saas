import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverGlow?: boolean;
}

export function GlassCard({ children, className, hoverGlow = true }: GlassCardProps) {
    return (
        <div className={cn(
            "glass-card p-6 overflow-hidden relative group",
            hoverGlow && "hover:shadow-violet-500/10",
            className
        )}>
            {/* Subtle corner highlight */}
            <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            {children}
        </div>
    );
}
