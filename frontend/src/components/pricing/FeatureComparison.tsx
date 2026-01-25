'use client';

import { Check, X } from 'lucide-react';

const PLANS = ['Starter', 'Team', 'Enterprise'];

const FEATURES = [
    {
        category: 'Core Features',
        items: [
            { name: 'Real-time event monitoring', starter: true, team: true, enterprise: true },
            { name: 'Sensor deployment', starter: '5', team: '50', enterprise: 'Unlimited' },
            { name: 'Alert rules', starter: '10', team: '100', enterprise: 'Unlimited' },
            { name: 'Data retention', starter: '7 days', team: '30 days', enterprise: 'Custom' },
        ],
    },
    {
        category: 'Purple Team',
        items: [
            { name: 'Attack scenarios', starter: false, team: true, enterprise: true },
            { name: 'MITRE ATT&CK coverage', starter: false, team: 'Basic', enterprise: 'Full' },
            { name: 'Custom playbooks', starter: false, team: '10', enterprise: 'Unlimited' },
        ],
    },
    {
        category: 'Security Tools',
        items: [
            { name: 'Nmap scanning', starter: true, team: true, enterprise: true },
            { name: 'Nuclei templates', starter: 'Basic', team: 'Advanced', enterprise: 'Full' },
            { name: 'OWASP ZAP integration', starter: false, team: true, enterprise: true },
            { name: 'Custom tool integration', starter: false, team: false, enterprise: true },
        ],
    },
    {
        category: 'Support & SLA',
        items: [
            { name: 'Email support', starter: true, team: true, enterprise: true },
            { name: 'Priority support', starter: false, team: true, enterprise: true },
            { name: 'Dedicated account manager', starter: false, team: false, enterprise: true },
            { name: 'SLA guarantee', starter: false, team: '99.5%', enterprise: '99.9%' },
        ],
    },
];

function FeatureValue({ value }: { value: boolean | string }) {
    if (typeof value === 'boolean') {
        return value ? (
            <Check className="h-5 w-5 text-success mx-auto" />
        ) : (
            <X className="h-5 w-5 text-text-3 mx-auto opacity-30" />
        );
    }
    return <span className="text-sm text-text-2">{value}</span>;
}

export function FeatureComparison() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-border-1">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-text-2">Features</th>
                        {PLANS.map((plan) => (
                            <th key={plan} className="text-center py-4 px-6 text-sm font-semibold text-white">
                                {plan}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {FEATURES.map((category, categoryIndex) => (
                        <>
                            <tr key={category.category} className="border-t border-border-1">
                                <td
                                    colSpan={4}
                                    className="py-4 px-6 text-sm font-semibold text-p-400 bg-bg-2/30"
                                >
                                    {category.category}
                                </td>
                            </tr>
                            {category.items.map((item, itemIndex) => (
                                <tr
                                    key={`${categoryIndex}-${itemIndex}`}
                                    className="border-b border-border-1/50 hover:bg-bg-2/20 transition-colors"
                                >
                                    <td className="py-3 px-6 text-sm text-text-2">{item.name}</td>
                                    <td className="py-3 px-6 text-center">
                                        <FeatureValue value={item.starter} />
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <FeatureValue value={item.team} />
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <FeatureValue value={item.enterprise} />
                                    </td>
                                </tr>
                            ))}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
