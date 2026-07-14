'use client';

import { motion } from 'framer-motion';

const INTEGRATIONS = [
    { name: 'Shodan', label: '327k+ IP Enterprise Search', color: 'bg-[#cf142b] text-white' },
    { name: 'HashiCorp', label: 'Vault & Consul Integration', color: 'bg-white text-black' },
    { name: 'Microsoft', label: 'Azure Active Directory', color: 'bg-[#00a4ef] text-white' },
    { name: 'Nutanix', label: 'Hybrid Cloud Protection', color: 'bg-[#502e91] text-white' },
];

export function IntegrationGrid() {
    return (
        <section className="py-32 bg-bg-0 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-p-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-p-500 to-info mb-8 shadow-2xl shadow-p-500/20"
                    >
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Better together.</h2>
                    <p className="text-text-3 font-medium text-lg max-w-2xl mx-auto">
                        Bouclier integrates seamlessly with your existing infrastructure and security stack.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {INTEGRATIONS.map((item, i) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-bg-2/30 border border-white/5 rounded-3xl p-8 hover:border-p-500/30 transition-all group group cursor-pointer"
                        >
                            <div className={`mt-4 mb-8 h-12 w-fit px-6 flex items-center justify-center rounded-xl font-black uppercase text-sm tracking-widest ${item.color} shadow-xl group-hover:scale-105 transition-transform`}>
                                {item.name}
                            </div>
                            <div className="text-left space-y-2">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">{item.name} & Bouclier</h4>
                                <p className="text-xs text-text-3 font-medium">{item.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
