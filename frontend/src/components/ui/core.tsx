import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Activity, ShieldAlert, Zap, Lock } from "lucide-react";

// --- GlassCard ---
export const GlassCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { hoverEffect?: boolean }
>(({ className, hoverEffect = true, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative overflow-hidden rounded-xl border border-border-1 bg-bg-2/60 p-6 backdrop-blur-[14px] shadow-lg transition-all duration-300",
            hoverEffect && "hover:border-p-600/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
GlassCard.displayName = "GlassCard";

// --- NeonButton ---
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-1 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary:
                    "bg-p-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:bg-p-500 hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] border border-transparent",
                ghost:
                    "bg-transparent text-text-2 hover:bg-bg-3 hover:text-white border border-transparent",
                outline:
                    "bg-transparent border border-p-600 text-p-400 hover:bg-p-600/10 hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]",
                danger:
                    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]",
                success:
                    "bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

export const NeonButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
NeonButton.displayName = "NeonButton";

// --- SeverityBadge ---
const severityConfig = {
    critical: "bg-danger/10 text-danger border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    info: "bg-bg-3 text-text-3 border-border-1",
    secure: "bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]",
};

export const SeverityBadge = ({
    severity,
    className,
}: {
    severity: keyof typeof severityConfig | string;
    className?: string;
}) => {
    const sev = (severity || "info").toLowerCase() as keyof typeof severityConfig;
    const style = severityConfig[sev] || severityConfig.info;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                style,
                className
            )}
        >
            {severity}
        </span>
    );
};

// --- SseStatusIndicator ---
export const SseStatusIndicator = ({
    status,
    lastEvent,
}: {
    status: "connected" | "connecting" | "disconnected" | "error" | "reconnecting" | "demo";
    lastEvent?: Date;
}) => {
    const config = {
        connected: { color: "bg-success", text: "text-success", label: "LIVE" },
        connecting: { color: "bg-warning", text: "text-warning", label: "SYNC" },
        reconnecting: { color: "bg-warning", text: "text-warning", label: "SYNC" },
        disconnected: { color: "bg-border-2", text: "text-text-3", label: "OFFLINE" },
        error: { color: "bg-danger", text: "text-danger", label: "ERROR" },
        demo: { color: "bg-p-400", text: "text-p-400", label: "SIMULATION" },
    };
    const active = config[status] || config.disconnected;

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-bg-1 border border-border-1 shadow-inner">
            <div className="relative flex h-2 w-2">
                {(status === "connected" || status === "demo") && (
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", active.color)}></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", active.color)}></span>
            </div>
            <span className={cn("text-[10px] font-black tracking-widest", active.text)}>
                {active.label}
            </span>
            {status === "connected" && (
                <span className="text-[10px] text-text-3 font-mono opacity-50 ml-1 border-l border-border-2 pl-2">
                    {lastEvent ? "0ms" : "IDLE"}
                </span>
            )}
        </div>
    );
};

// --- KpiCard ---
export const KpiCard = ({
    title,
    value,
    delta,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string | number;
    delta?: string;
    icon?: any;
    trend?: "up" | "down" | "neutral";
}) => {
    const trendColor =
        trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-text-3";

    return (
        <GlassCard className="p-5 flex flex-col justify-between h-full group hover:bg-bg-2/80">
            <div className="flex justify-between items-start mb-2">
                <span className="text-text-3 text-xs font-bold uppercase tracking-wider">{title}</span>
                {Icon && <Icon className="w-4 h-4 text-p-400 opacity-70 group-hover:opacity-100 group-hover:text-neon-1 transition-all" />}
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl lg:text-3xl font-bold text-text-1 tracking-tight">{value}</div>
                {delta && (
                    <div className={cn("text-xs font-mono px-1.5 py-0.5 rounded bg-bg-3 border border-border-1", trendColor)}>
                        {delta}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export const SectionHeader = ({ title, description, action }: { title: string, description?: string, action?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-bold text-text-1 tracking-tight mb-1">{title}</h2>
            {description && <p className="text-text-2 text-sm max-w-2xl">{description}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
)
