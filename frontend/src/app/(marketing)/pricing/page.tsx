'use client';

import { useState } from 'react';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { FeatureComparison } from '@/components/pricing/FeatureComparison';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';

const PRICING_PLANS = [
    {
        name: 'Starter',
        description: 'Perfect for small teams getting started with SOC operations',
        price: {
            monthly: 99,
            yearly: 950, // ~20% discount
        },
        features: [
            'Up to 5 sensors',
            '10 alert rules',
            '7 days data retention',
            'Real-time monitoring',
            'Nmap & basic tools',
            'Email support',
        ],
        ctaText: 'Start Free Trial',
        ctaHref: '/dashboard',
    },
    {
        name: 'Team',
        description: 'Advanced features for growing security teams',
        price: {
            monthly: 299,
            yearly: 2870, // ~20% discount
        },
        features: [
            'Up to 50 sensors',
            '100 alert rules',
            '30 days data retention',
            'Purple Team scenarios',
            'MITRE ATT&CK coverage',
            'Nuclei & OWASP ZAP',
            '10 custom playbooks',
            'Priority support (4h SLA)',
        ],
        highlighted: true,
        ctaText: 'Start Free Trial',
        ctaHref: '/dashboard',
    },
    {
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        price: {
            monthly: 0,
            yearly: 0,
        },
        features: [
            'Unlimited sensors',
            'Unlimited alert rules',
            'Custom data retention',
            'Full MITRE ATT&CK',
            'Unlimited playbooks',
            'Custom tool integration',
            'Dedicated account manager',
            '24/7 phone support',
            '99.9% SLA guarantee',
        ],
        ctaText: 'Contact Sales',
        ctaHref: '/contact',
    },
];

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="min-h-screen py-24">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-p-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                        Simple, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-p-400 to-info">Transparent Intelligence.</span>
                    </h1>
                    <p className="text-text-3 font-medium text-lg max-w-2xl mx-auto">
                        Choose the enterprise tier that fits your security operations.
                        Every Bouclier deployment includes a 14-day full spectrum trial.
                    </p>
                </div>

                {/* Billing Toggle */}
                <PricingToggle value={billingPeriod} onChange={setBillingPeriod} />

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {PRICING_PLANS.map((plan) => (
                        <PricingCard
                            key={plan.name}
                            {...plan}
                            billingPeriod={billingPeriod}
                        />
                    ))}
                </div>

                {/* Feature Comparison */}
                <div className="mb-24">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Compare plans
                        </h2>
                        <p className="text-text-2">
                            Detailed breakdown of features across all plans
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-8 overflow-hidden">
                        <FeatureComparison />
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-24">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Frequently asked questions
                        </h2>
                        <p className="text-text-2">
                            Everything you need to know about our pricing and plans
                        </p>
                    </div>
                    <PricingFAQ />
                </div>

                {/* CTA Section */}
                <div className="glass-card rounded-2xl p-12 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Still have questions?
                    </h3>
                    <p className="text-text-2 mb-6">
                        Our team is here to help you find the right plan for your organization.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-p-500 to-p-600 hover:from-p-600 hover:to-p-700 text-white font-medium shadow-lg shadow-p-500/30 transition-all"
                    >
                        Contact Sales
                    </a>
                </div>
            </div>
        </div>
    );
}

