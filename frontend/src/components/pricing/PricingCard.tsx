'use client';

import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PricingCardProps {
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    highlighted?: boolean;
    billingPeriod: 'monthly' | 'yearly';
    ctaText?: string;
    ctaHref?: string;
}

export function PricingCard({
    name,
    description,
    price,
    features,
    highlighted = false,
    billingPeriod,
    ctaText = 'Get Started',
    ctaHref = '/dashboard',
}: PricingCardProps) {
    const displayPrice = billingPeriod === 'monthly' ? price.monthly : price.yearly;
    const isEnterprise = price.monthly === 0;

    return (
        <div
            className={`glass-card rounded-2xl p-8 relative ${highlighted
                    ? 'border-2 border-p-500 shadow-xl shadow-p-500/20 scale-105'
                    : 'border border-border-1'
                }`}
        >
            {/* Popular Badge */}
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-p-500 to-p-600 text-white shadow-lg">
                        Most Popular
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
                <p className="text-text-3 text-sm">{description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
                {isEnterprise ? (
                    <div className="text-4xl font-bold text-white">Custom</div>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">${displayPrice}</span>
                        <span className="text-text-3">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                )}
            </div>

            {/* CTA */}
            <Link href={ctaHref} className="block mb-8">
                <Button
                    size="lg"
                    className={`w-full ${highlighted
                            ? 'bg-gradient-to-r from-p-500 to-p-600 hover:from-p-600 hover:to-p-700 text-white shadow-lg shadow-p-500/30'
                            : 'bg-bg-2 hover:bg-bg-3 text-white border border-border-2'
                        }`}
                >
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>

            {/* Features */}
            <ul className="space-y-3">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-p-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-2">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
