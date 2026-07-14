"use client";

import { useMemo } from 'react';

interface MetricSparklineProps {
    data: number[];
    color: string;
}

export function MetricSparkline({ data, color }: MetricSparklineProps) {
    const points = useMemo(() => {
        if (!data.length) return "";
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const width = 100;
        const height = 30;

        return data.map((val, i) => {
            const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
            const y = range !== 0 ? height - ((val - min) / range) * height : height / 2;
            return `${x},${y}`;
        }).join(" ");
    }, [data]);

    const safeColor = color.replace('#', '');

    return (
        <svg viewBox="0 0 100 30" className="w-24 h-8 overflow-visible">
            <defs>
                <linearGradient id={`grad-${safeColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={`M ${points} L 100,30 L 0,30 Z`}
                fill={`url(#grad-${safeColor})`}
            />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="drop-shadow-[0_0_8px_rgba(var(--neon-glow),0.5)]"
            />
        </svg>
    );
}
