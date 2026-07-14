'use client';

import { Activity, Wifi, Clock, Shield } from 'lucide-react';

const METRICS = [
    {
        icon: Activity,
        value: '327K+',
        label: 'IP Scans/mo',
        description: 'Enterprise throughput',
    },
    {
        icon: Wifi,
        value: '100+',
        label: 'Global Exit Nodes',
        description: 'Distributed scanning',
    },
    {
        icon: Clock,
        value: 'Real-time',
        label: 'Streaming API',
        description: 'Sub-second intelligence',
    },
    {
        icon: Shield,
        value: '99.9%',
        label: 'Uptime SLA',
        description: 'Enterprise reliability',
    },
];

export function MetricsStrip() {
    return (
        <section className="py-16 bg-gradient-to-r from-bg-2 to-bg-3 border-y border-border-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {METRICS.map((metric, index) => (
                        <div
                            key={metric.label}
                            className="text-center group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-p-500/10 border border-p-500/20 mb-4 group-hover:bg-p-500/20 transition-colors">
                                <metric.icon className="w-6 h-6 text-p-400" />
                            </div>

                            {/* Value */}
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1 group-hover:text-p-400 transition-colors">
                                {metric.value}
                            </div>

                            {/* Label */}
                            <div className="text-sm font-medium text-text-2 mb-1">{metric.label}</div>

                            {/* Description */}
                            <div className="text-xs text-text-3">{metric.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
