'use client';

import { motion } from 'framer-motion';
import { Check, Shield, Zap, Database, Globe, Cpu, Lock, Star } from 'lucide-react';

const PLANS = [
    {
        name: 'Individual',
        price: '59',
        description: 'Perfect for researchers and individual security professionals.',
        features: [
            'Scan up to 10,000 IPs / mo',
            'Basic Network Monitoring',
            'Standard search filters',
            'Community Support',
            'Vulnerability search: Low priority',
            'Manual IP Lookups'
        ],
        cta: 'Start Free Trial',
        highlight: false,
        tag: 'Early Bird',
        showBadge: true
    },
    {
        name: 'Corporate', // This is the requested "real/shodan-like" tier
        price: '899',
        description: 'Unleash the full power of the Bouclier engine for enterprise-wide visibility.',
        features: [
            'Scan up to 327,680 IPs / mo',
            'Network Monitoring for 327,680 IPs',
            'Access to all premium filters',
            'Paging through all results',
            'Basic access to Streaming API',
            'Advanced Vulnerability Search',
            'Batch IP Lookups & Tag Search',
            'InternetDB API Commercial Use',
            'Premium Support (24/7)',
            'Complementary Upgrades'
        ],
        cta: 'Deploy Enterprise',
        highlight: true,
        tag: 'Most Powerful'
    },
    {
        name: 'Small Team',
        price: '299',
        description: 'Enhanced intelligence for dedicated security teams.',
        features: [
            'Scan up to 50,000 IPs / mo',
            'Monitoring for 20,000 IPs',
            'Advanced search filters',
            'Standard Streaming API',
            'Commercial Use License',
            'Email Support'
        ],
        cta: 'Upgrade Team',
        highlight: false
    }
];

export function PricingSection() {
    return (
        <section className="py-32 bg-bg-0 relative overflow-hidden" id="pricing">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-p-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-p-500/10 border border-p-500/20 text-p-400 text-xs font-black uppercase tracking-widest"
                    >
                        <Star className="w-3 h-3 fill-p-400" />
                        Enterprise Intelligence
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none"
                    >
                        PREMIUM <span className="text-p-400">ACCESS.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-text-3 font-medium text-xl max-w-2xl mx-auto"
                    >
                        Advanced surface monitoring and vulnerability scanning at scale.
                        Real-time intelligence for the modern enterprise.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative flex flex-col p-10 rounded-[48px] border transition-all duration-500 group ${plan.highlight
                                ? 'bg-bg-1 border-p-500/50 shadow-[0_0_50px_rgba(139,92,246,0.15)] scale-105 z-20'
                                : 'bg-bg-2/30 border-white/5 hover:border-white/10 hover:bg-bg-2/50'
                                }`}
                        >
                            {(plan.highlight || plan.showBadge) && (
                                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${plan.highlight
                                        ? 'bg-gradient-to-r from-p-600 to-p-400 text-white shadow-p-500/20'
                                        : 'bg-bg-3 border border-white/10 text-text-3'
                                    }`}>
                                    {plan.tag}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
                                <p className="text-sm text-text-3 font-medium min-h-[40px] leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white tracking-tighter">${plan.price}</span>
                                <span className="text-text-3 font-bold uppercase text-[10px] tracking-widest">/ Month</span>
                            </div>

                            <div className="space-y-5 flex-1 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className={`mt-1 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-p-500/20' : 'bg-white/5'
                                            }`}>
                                            <Check className={`w-3 h-3 ${plan.highlight ? 'text-p-400' : 'text-text-3'}`} />
                                        </div>
                                        <span className={`text-[13px] font-bold uppercase tracking-wide leading-tight ${plan.highlight ? 'text-text-1' : 'text-text-2'
                                            }`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 ${plan.highlight
                                ? 'bg-p-500 text-white hover:bg-p-600 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] shadow-[0_5px_15px_rgba(139,92,246,0.2)]'
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                                }`}>
                                {plan.cta}
                            </button>

                            {/* Decorative background for the highlight card */}
                            {plan.highlight && (
                                <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    <Shield className="w-32 h-32 text-p-500" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer disclaimer */}
                <div className="mt-20 text-center">
                    <p className="text-[10px] font-black text-text-3 uppercase tracking-widest opacity-50">
                        * All plans include Grandfathered Pricing and commercial use rights. Subject to Terms of Service.
                    </p>
                </div>
            </div>
        </section>
    );
}
