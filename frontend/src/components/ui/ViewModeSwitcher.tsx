"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewMode, ViewMode } from "@/lib/viewMode";

interface ViewModeSwitcherProps {
    className?: string;
}

export default function ViewModeSwitcher({ className }: ViewModeSwitcherProps) {
    const { mode, setMode } = useViewMode();

    const modes: { id: ViewMode; label: string; icon: React.ElementType; color: string }[] = [
        {
            id: 'soc',
            label: 'SOC',
            icon: Monitor,
            color: "from-[rgb(var(--neon-1))] to-[rgb(var(--neon-2))]"
        },
        {
            id: 'client',
            label: 'Client',
            icon: Users,
            color: "from-[rgb(var(--neon-4))] to-[rgb(var(--p-500))]"
        },
        {
            id: 'executive',
            label: 'Executive',
            icon: BarChart3,
            color: "from-indigo-500 to-purple-500"
        }
    ];

    return (
        <div className={cn(
            "p-1 rounded-xl bg-[rgb(var(--bg-2))]/80 border border-white/10",
            className
        )}>
            <div className="flex gap-1">
                {modes.map((m) => {
                    const isActive = mode === m.id;
                    const Icon = m.icon;

                    return (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                isActive
                                    ? "text-white"
                                    : "text-text-3 hover:text-text-2 hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="view-mode-active"
                                    className={cn("absolute inset-0 rounded-lg bg-gradient-to-r", m.color)}
                                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                                />
                            )}
                            <Icon className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">{m.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
