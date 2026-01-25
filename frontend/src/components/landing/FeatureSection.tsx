'use client';

import { Activity, Target, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FEATURES = [
    {
        icon: Activity,
        title: 'SOC Dashboard',
        description: 'Real-time monitoring with live event streams, alerts, and sensor health tracking.',
        highlights: [
            'Sub-100ms detection latency',
            'Automated threat correlation',
            'AI-powered anomaly detection',
        ],
        gradient: 'from-p-500 to-p-600',
    },
    {
        icon: Target,
        title: 'Purple Team Scenarios',
        description: 'Emulate real-world attacks to test your defenses and validate detection rules.',
        highlights: [
            'MITRE ATT&CK coverage',
            'Custom scenario builder',
            'Automated playbook execution',
        ],
        gradient: 'from-info to-cyan-500',
    },
    {
        icon: Wrench,
        title: 'Security Tool Execution',
        description: 'Run industry-standard security tools directly from the platform.',
        highlights: [
            'Nmap, Nuclei, OWASP ZAP',
            'Centralized job management',
            'Audit logging & compliance',
        ],
        gradient: 'from-purple-500 to-pink-500',
    },
];

export function FeatureSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-p-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-info/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Everything you need for
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-p-400 to-info"> modern security operations</span>
                    </h2>
                    <p className="text-lg text-text-2">
                        A unified platform that combines detection, testing, and tooling in one place.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {FEATURES.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="glass-card rounded-2xl p-8 hover:scale-105 transition-all duration-300 group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <feature.icon className="w-full h-full text-white" />
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                            <p className="text-text-2 mb-6">{feature.description}</p>

                            {/* Highlights */}
                            <ul className="space-y-2 mb-6">
                                {feature.highlights.map((highlight) => (
                                    <li key={highlight} className="flex items-start gap-2 text-sm text-text-3">
                                        <span className="text-p-400 mt-0.5">✓</span>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>

                            {/* Learn More Link */}
                            <Link href={`/features/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                <Button variant="ghost" size="sm" className="text-p-400 hover:text-p-500 p-0 h-auto group/btn">
                                    Learn more
                                    <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
