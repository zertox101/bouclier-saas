'use client';

import { Quote } from 'lucide-react';

export function CustomerStory() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-p-500/10 rounded-full blur-[100px]" />

                        {/* Quote Icon */}
                        <div className="relative mb-6">
                            <Quote className="w-12 h-12 text-p-400/30" />
                        </div>

                        {/* Testimonial */}
                        <blockquote className="relative z-10">
                            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                                "CyberDetect transformed our security operations. The Purple Team scenarios
                                helped us identify gaps we didn't know existed, and the real-time dashboard
                                gives us complete visibility across our entire infrastructure."
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-p-500 to-info flex items-center justify-center text-white font-bold text-lg">
                                    JD
                                </div>
                                <div>
                                    <div className="text-white font-semibold">Jane Doe</div>
                                    <div className="text-text-3 text-sm">CISO, Enterprise Corp</div>
                                </div>
                            </div>
                        </blockquote>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-border-1">
                            <div>
                                <div className="text-2xl font-bold text-p-400 mb-1">85%</div>
                                <div className="text-xs text-text-3">Faster Detection</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-p-400 mb-1">60%</div>
                                <div className="text-xs text-text-3">Cost Reduction</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-p-400 mb-1">99.9%</div>
                                <div className="text-xs text-text-3">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
