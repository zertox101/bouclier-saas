'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
    {
        question: 'What is included in the free trial?',
        answer:
            'The free trial includes full access to all Team plan features for 14 days. No credit card required. You can deploy up to 10 sensors and create unlimited alert rules during the trial period.',
    },
    {
        question: 'Can I change plans later?',
        answer:
            "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits to your account.",
    },
    {
        question: 'What payment methods do you accept?',
        answer:
            'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise customers. Annual plans can also be paid via invoice.',
    },
    {
        question: 'Is my data secure?',
        answer:
            'Absolutely. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. All data is stored in SOC 2 Type II certified data centers with regular security audits.',
    },
    {
        question: 'What kind of support do you offer?',
        answer:
            'Starter plans include email support with 24-hour response time. Team plans get priority support with 4-hour response time. Enterprise customers receive dedicated account managers and 24/7 phone support.',
    },
    {
        question: 'Can I integrate with my existing tools?',
        answer:
            'Yes! CyberDetect integrates with popular SIEM platforms, ticketing systems, and communication tools via webhooks and APIs. Enterprise plans include custom integration development.',
    },
    {
        question: 'What is your refund policy?',
        answer:
            "We offer a 30-day money-back guarantee for all annual plans. If you're not satisfied within the first 30 days, we'll provide a full refund, no questions asked.",
    },
    {
        question: 'Do you offer discounts for non-profits or educational institutions?',
        answer:
            'Yes! We offer special pricing for non-profit organizations and educational institutions. Contact our sales team at sales@cyberdetect.com for more information.',
    },
];

export function PricingFAQ() {
    return (
        <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
                {FAQS.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="glass-card rounded-xl px-6 border border-border-1 hover:border-p-500/30 transition-colors"
                    >
                        <AccordionTrigger className="text-left text-white hover:text-p-400 py-4">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-text-2 pb-4">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
