'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FinalCTA() {
    return (
        <section className="py-40 bg-bg-0 relative overflow-hidden text-center">
            {/* Immersive background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[300px] bg-p-500/10 rounded-full blur-[150px] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight uppercase tracking-tighter"
                    >
                        Start your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-p-400 to-info">Security Journey today.</span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/dashboard">
                            <Button
                                size="lg"
                                className="h-16 px-12 rounded-full bg-white text-black hover:bg-p-400 hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                            >
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-12 rounded-full border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all duration-300 font-black uppercase tracking-widest text-sm"
                            >
                                View Enterprise Pricing
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Gradient Fade to Footer */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-bg-1 to-transparent pointer-events-none" />
        </section>
    );
}
