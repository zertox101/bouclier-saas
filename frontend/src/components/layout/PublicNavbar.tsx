'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '/product', label: 'Product' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/docs', label: 'Docs' },
    { href: '/security', label: 'Security' },
];

export function PublicNavbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#020205]/40 backdrop-blur-3xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo - Premium Style */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="p-2 rounded-xl bg-[rgb(var(--neon-1))]/10 border border-[rgb(var(--neon-1))]/20 group-hover:bg-[rgb(var(--neon-1))]/20 transition-all">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute inset-0 blur-xl bg-[rgb(var(--neon-1))]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white uppercase tracking-tighter leading-none italic">
                                BOUCLIER<span className="text-[rgb(var(--neon-1))] not-italic">.</span>
                            </span>
                            <span className="text-[8px] font-black text-[#666] uppercase tracking-[0.4em] mt-1 font-mono">LEVEL_10_PROTOCOLS</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Discrete & High-end */}
                    <div className="hidden md:flex items-center gap-10">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-white relative group pb-1",
                                    pathname === link.href ? "text-white" : "text-[#888]"
                                )}
                            >
                                {link.label}
                                <span className={cn(
                                    "absolute bottom-0 left-0 h-px bg-[rgb(var(--neon-1))] transition-all duration-300",
                                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/login">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666] hover:text-white transition-colors cursor-pointer">
                                Authenticate
                            </span>
                        </Link>
                        <Link href="/dashboard">
                            <button className="h-10 px-8 bg-white text-black font-black uppercase tracking-[0.1em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                Enter Operations
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Dark Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-20 bg-[#020205] z-50 p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-6">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xl font-black uppercase tracking-widest text-[#888]"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                        <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                            <button className="w-full h-14 border border-white/10 text-white font-black uppercase tracking-widest">Login</button>
                        </Link>
                        <Link href="/dashboard" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                            <button className="w-full h-14 bg-white text-black font-black uppercase tracking-widest">Start Trial</button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
