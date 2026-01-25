'use client';

import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color: string;
}

export function KPICard({ title, value, change, trend, icon: Icon, color }: KPICardProps) {
    return (
        <div className="glass-card rounded-2xl p-6 hover:border-p-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
                    <Icon className={`h-6 w-6 text-${color}`} />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-success/10 text-success' :
                        trend === 'down' ? 'bg-danger/10 text-danger' :
                            'bg-text-3/10 text-text-3'
                    }`}>
                    {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{change}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-text-3 uppercase tracking-wider mb-1">{title}</h3>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            </div>
        </div>
    );
}
