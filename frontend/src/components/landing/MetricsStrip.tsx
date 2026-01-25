'use client';

import { Activity, Wifi, Clock, Shield } from 'lucide-react';

const METRICS = [
    {
        icon: Activity,
        value: '1.2M+',
        label: 'Events/sec',
        description: 'Processing capacity',
    },
    {
        icon: Wifi,
        value: '500+',
        label: 'Sensors Online',
        description: 'Active endpoints',
    },
    {
        icon: Clock,
        value: '<2min',
        label: 'MTTR',
        description: 'Mean time to respond',
    },
    {
        icon: Shield,
        value: '99.8%',
        label: 'Detection Rate',
        description: 'Threat accuracy',
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
