"use client";

import { useMemo } from "react";

interface CriticalityData {
    critical: number;
    high: number;
    medium: number;
    low?: number;
}

interface CriticalityDonutProps {
    data: CriticalityData;
    size?: number;
    showLegend?: boolean;
}

export default function CriticalityDonut({
    data,
    size = 80,
    showLegend = true,
}: CriticalityDonutProps) {
    const total = useMemo(() => {
        return data.critical + data.high + data.medium + (data.low || 0);
    }, [data]);

    const percentages = useMemo(() => {
        if (total === 0) return { critical: 0, high: 0, medium: 0, low: 0 };
        return {
            critical: Math.round((data.critical / total) * 100),
            high: Math.round((data.high / total) * 100),
            medium: Math.round((data.medium / total) * 100),
            low: Math.round(((data.low || 0) / total) * 100),
        };
    }, [data, total]);

    // Calculate arc segments
    const segments = useMemo(() => {
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        let offset = 0;
        const result = [];

        const items = [
            { key: "critical", value: data.critical, color: "#ef4444" },
            { key: "high", value: data.high, color: "#fb923c" },
            { key: "medium", value: data.medium, color: "#facc15" },
            { key: "low", value: data.low || 0, color: "#22c55e" },
        ];

        for (const item of items) {
            if (item.value > 0) {
                const percentage = item.value / total;
                const dashLength = circumference * percentage;
                result.push({
                    ...item,
                    dashArray: `${dashLength} ${circumference - dashLength}`,
                    dashOffset: -offset,
                    radius,
                    strokeWidth,
                });
                offset += dashLength;
            }
        }

        return result;
    }, [data, total, size]);

    return (
        <div className="flex items-center gap-3">
            {/* Donut Chart */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                    style={{ width: size, height: size }}
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={(size - 8) / 2}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        strokeWidth={8}
                    />

                    {/* Segments */}
                    {segments.map((segment) => (
                        <circle
                            key={segment.key}
                            cx={size / 2}
                            cy={size / 2}
                            r={segment.radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={segment.strokeWidth}
                            strokeDasharray={segment.dashArray}
                            strokeDashoffset={segment.dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">{total}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">Events</span>
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[10px] text-slate-400">Critique</span>
                        <span className="text-[10px] font-medium text-slate-300">{percentages.critical}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-orange-400" />
                        <span className="text-[10px] text-slate-400">Élevé</span>
                        <span className="text-[10px] font-medium text-slate-300">{percentages.high}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span className="text-[10px] text-slate-400">Moyen</span>
                        <span className="text-[10px] font-medium text-slate-300">{percentages.medium}%</span>
                    </div>
                    {(data.low || 0) > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-400" />
                            <span className="text-[10px] text-slate-400">Faible</span>
                            <span className="text-[10px] font-medium text-slate-300">{percentages.low}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
