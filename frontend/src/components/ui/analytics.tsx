import React from 'react';
import { GlassCard } from './core';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
    title: string;
    value: string | number;
    delta?: number;
    unit?: string;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export const KpiCard = ({ title, value, delta, unit, description, trend }: KpiCardProps) => {
    return (
        <GlassCard className="flex flex-col justify-between min-h-[140px]">
            <div>
                <p className="text-caption uppercase tracking-widest text-text-3 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-text-1 font-mono tracking-tighter">{value}</h3>
                    {unit && <span className="text-caption text-text-3 font-bold">{unit}</span>}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                {delta !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold",
                        delta > 0 ? "bg-success/10 text-success" : delta < 0 ? "bg-danger/10 text-danger" : "bg-bg-3 text-text-3"
                    )}>
                        {delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {Math.abs(delta)}%
                    </div>
                )}
                {description && <span className="text-[10px] text-text-3 opacity-60 uppercase font-bold">{description}</span>}
            </div>
        </GlassCard>
    );
};
