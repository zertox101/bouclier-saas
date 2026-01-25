'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Link from 'next/link';

export function WelcomeModal() {
    const [hasVisited, setHasVisited] = useLocalStorage('bouclier-visited', false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show modal only on first visit
        if (!hasVisited) {
            setIsOpen(true);
        }
    }, [hasVisited]);

    const handleClose = () => {
        setIsOpen(false);
        setHasVisited(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in uppercase tracking-tighter">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-bg-0/95 backdrop-blur-xl"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-bg-1 border border-white/10 rounded-[48px] p-1 shadow-2xl overflow-hidden group max-w-xl w-full">
                <div className="absolute inset-0 zellige-pattern opacity-10" />

                <div className="relative bg-bg-1/40 backdrop-blur-2xl rounded-[44px] p-12 border border-white/5 space-y-10 overflow-hidden">
                    <div className="scanline" />

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-8 right-8 text-text-3 hover:text-white transition-all hover:rotate-90 duration-300 z-50"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Content */}
                    <div className="text-center space-y-10 relative z-10">
                        {/* Icon */}
                        <div className="relative inline-flex mb-4 group/icon">
                            <div className="absolute -inset-4 bg-p-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                            <div className="relative w-24 h-24 rounded-[32px] bg-white text-black shadow-2xl flex items-center justify-center group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-700">
                                <Shield className="w-12 h-12" />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="h-1.5 w-1.5 rounded-full bg-m-emerald shadow-[0_0_10px_#10B981]" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-p-400">BOUCLIER_v2.4_ALPHA</span>
                            </div>
                            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter italic">
                                MARHBABA <span className="text-p-400">BIK</span>.
                            </h2>
                            <p className="text-text-3 font-bold text-lg max-w-sm mx-auto tracking-normal opacity-80">
                                Autonomous Security Sovereignty for the Modern Enterprise.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/dashboard" className="flex-1" onClick={handleClose}>
                                <Button
                                    size="lg"
                                    className="w-full h-16 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-p-400 hover:text-black transition-all shadow-xl shadow-white/5"
                                >
                                    <ExternalLink className="mr-3 h-5 w-5" />
                                    Launch Core
                                </Button>
                            </Link>
                            <Link href="/docs" className="flex-1" onClick={handleClose}>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full h-16 rounded-2xl border-white/5 bg-white/5 text-text-1 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20 transition-all"
                                >
                                    <BookOpen className="mr-3 h-5 w-5" />
                                    Read Intel
                                </Button>
                            </Link>
                        </div>

                        {/* Skip */}
                        <button
                            onClick={handleClose}
                            className="text-[10px] font-black text-text-3 hover:text-p-400 transition-all uppercase tracking-widest pt-4"
                        >
                            ACKNOWLEDGE_SYSTEM_ACCESS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
