import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function NeonButton({
    variant = 'primary',
    size = 'md',
    children,
    className,
    ...props
}: NeonButtonProps) {
    const variants = {
        primary: "bg-violet-600 text-white hover:bg-violet-700 neon-border shadow-violet-500/20",
        secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
        outline: "bg-transparent border border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base font-bold",
    };

    return (
        <button
            className={cn(
                "rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest font-black flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
