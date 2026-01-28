'use client';

import React from 'react';
import { Check, X, Shield, Zap, Lock, Globe, Terminal, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PLANS = [
    { name: 'Starter', price: '$0', color: 'blue-500', desc: 'Personal protection' },
    { name: 'Team', price: '$49', color: 'p-500', desc: 'Standard Shield Fleet' },
    { name: 'Enterprise', price: 'Custom', color: 'amber-500', desc: 'Sovereign Admin Unit' },
];

const FEATURES = [
    {
        category: 'Threat Detection',
        icon: Shield,
        items: [
            { name: 'Real-time event monitoring', starter: true, team: true, enterprise: true },
            { name: 'Sensor deployment', starter: '5 nodes', team: '50 nodes', enterprise: 'Unlimited' },
            { name: 'Alert rules', starter: '10', team: '100', enterprise: 'Global' },
            { name: 'Data retention', starter: '7 days', team: '30 days', enterprise: 'Unlimited' },
        ],
    },
    {
        category: 'Adversary Emulation',
        icon: Zap,
        items: [
            { name: 'Attack scenarios', starter: false, team: true, enterprise: true },
            { name: 'MITRE ATT&CK mapping', starter: false, team: 'Basic', enterprise: 'Full Matrix' },
            { name: 'Custom playbooks', starter: false, team: '10', enterprise: 'Unlimited' },
            { name: 'Automated Red Teaming', starter: false, starter_val: 'None', team: false, team_val: 'Coming Soon', enterprise: true },
        ],
    },
    {
        category: 'Tactical Arsenal',
        icon: Terminal,
        items: [
            { name: 'Nmap reconnaissance', starter: true, team: true, enterprise: true },
            { name: 'Nuclei templates', starter: 'Basic', team: 'Advanced', enterprise: 'Elite' },
            { name: 'OWASP ZAP integration', starter: false, team: true, enterprise: true },
            { name: 'Custom tool ingestion', starter: false, team: false, enterprise: true },
        ],
    },
    {
        category: 'Infrastructure',
        icon: Globe,
        items: [
            { name: 'API Uplinks', starter: '1', team: '10', enterprise: 'Unlimited' },
            { name: 'Multi-region support', starter: false, team: false, enterprise: true },
            { name: 'SLA Guarantee', starter: '-', team: '99.5%', enterprise: '99.99%' },
            { name: 'Priority Support', starter: false, team: true, enterprise: true },
        ],
    },
];

function FeatureValue({ value, isMain = false }: { value: boolean | string; isMain?: boolean }) {
    if (typeof value === 'boolean') {
        return value ? (
            <div className="flex justify-center">
                <div className={cn(
                    "p-1 rounded-full",
                    isMain ? "bg-p-500/20 text-p-400" : "bg-white/5 text-white/40"
                )}>
                    <Check className="h-4 w-4" />
                </div>
            </div>
        ) : (
            <div className="flex justify-center opacity-20">
                <X className="h-4 w-4 text-white" />
            </div>
        );
    }
    return <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        isMain ? "text-p-400" : "text-text-3"
    )}>{value}</span>;
}

export function FeatureComparison() {
    return (
        <div className="w-full relative group/table">
            {/* Glossy Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-p-500/5 to-transparent rounded-3xl opacity-50 pointer-events-none" />

            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-bg-1/40 backdrop-blur-3xl shadow-2xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/2">
                            <th className="text-left py-8 px-8 align-bottom">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-p-500/10 rounded-lg">
                                        <Info className="w-4 h-4 text-p-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Feature Comparison</span>
                                </div>
                            </th>
                            {PLANS.map((plan) => (
                                <th key={plan.name} className="py-8 px-4 text-center">
                                    <div className="inline-flex flex-col items-center">
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-lg border",
                                            plan.name === 'Team' ? "bg-p-600/20 border-p-500/30 text-p-400 shadow-[0_0_15px_rgba(167,139,250,0.1)]" : "bg-white/5 border-white/10 text-white/50"
                                        )}>
                                            {plan.name}
                                        </div>
                                        <div className="text-2xl font-black text-white italic">{plan.price}</div>
                                        <div className="text-[8px] font-bold text-text-3 uppercase mt-1 opacity-50">{plan.desc}</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {FEATURES.map((cat) => (
                            <React.Fragment key={cat.category}>
                                <tr className="bg-white/[0.01]">
                                    <td colSpan={4} className="py-4 px-8">
                                        <div className="flex items-center gap-2">
                                            <cat.icon className="w-3.5 h-3.5 text-p-400" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-p-400 italic">{cat.category}</span>
                                        </div>
                                    </td>
                                </tr>
                                {cat.items.map((item) => (
                                    <tr
                                        key={item.name}
                                        className="hover:bg-white/[0.03] transition-all group/row"
                                    >
                                        <td className="py-4 px-10">
                                            <span className="text-xs font-bold text-text-2 group-hover/row:text-white transition-colors">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <FeatureValue value={(item as any).starter_val || item.starter} />
                                        </td>
                                        <td className="py-4 px-4 text-center bg-p-500/[0.02]">
                                            <FeatureValue value={(item as any).team_val || item.team} isMain />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <FeatureValue value={(item as any).enterprise_val || item.enterprise} />
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Glowing Border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-p-500/20 via-transparent to-p-500/20 rounded-3xl opacity-0 group-hover/table:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
