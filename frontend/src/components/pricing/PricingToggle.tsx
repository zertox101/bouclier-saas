'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface PricingToggleProps {
    value: 'monthly' | 'yearly';
    onChange: (value: 'monthly' | 'yearly') => void;
}

export function PricingToggle({ value, onChange }: PricingToggleProps) {
    return (
        <div className="flex items-center justify-center gap-4 mb-12">
            <button
                onClick={() => onChange('monthly')}
                className={`text-sm font-medium transition-colors ${value === 'monthly' ? 'text-white' : 'text-text-3'
                    }`}
            >
                Monthly
            </button>

            <button
                onClick={() => onChange(value === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-p-500 focus:ring-offset-2 focus:ring-offset-bg-0"
                style={{
                    backgroundColor: value === 'yearly' ? 'rgb(139, 92, 246)' : 'rgb(59, 42, 102)',
                }}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>

            <button
                onClick={() => onChange('yearly')}
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${value === 'yearly' ? 'text-white' : 'text-text-3'
                    }`}
            >
                Yearly
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                    Save 20%
                </span>
            </button>
        </div>
    );
}
