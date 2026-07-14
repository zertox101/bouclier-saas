"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  danger: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  info: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  neutral: {
    bg: "bg-white/5 border-white/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
};

export function StatusBadge({
  label,
  variant = "info",
  pulse = false,
  className,
}: StatusBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm",
        styles.bg,
        className
      )}
    >
      <div className="relative">
        <div className={cn("w-2 h-2 rounded-full", styles.dot)} />
        {pulse && (
          <div
            className={cn(
              "absolute inset-0 w-2 h-2 rounded-full animate-ping",
              styles.dot,
              "opacity-75"
            )}
          />
        )}
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", styles.text)}>
        {label}
      </span>
    </div>
  );
}
