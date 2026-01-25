'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-1 bg-bg-0/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="relative">
                            <Shield className="h-7 w-7 text-white group-hover:text-p-400 transition-colors" />
                            <div className="absolute inset-0 blur-lg bg-p-500/20 group-hover:bg-p-500/40 transition-all" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                                Bouclier<span className="text-p-400">.</span>
                            </span>
                            <span className="text-[7px] font-black text-m-emerald uppercase tracking-[0.4em] mt-0.5">MA_SOVEREIGN</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-p-400 ${pathname === link.href ? 'text-p-400' : 'text-text-2'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/login">
                            <span className="text-xs font-black uppercase tracking-widest text-text-3 hover:text-white transition-colors cursor-pointer">
                                Login
                            </span>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                size="sm"
                                className="h-10 px-6 rounded-full bg-white text-black hover:bg-p-400 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] shadow-xl"
                            >
                                Start Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-text-1 hover:text-p-400 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border-1 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-p-400 ${pathname === link.href ? 'text-p-400' : 'text-text-2'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-border-1">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" size="sm" className="w-full text-text-2 hover:text-white">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-p-500 to-p-600 hover:from-p-600 hover:to-p-700 text-white"
                                    >
                                        Start Trial
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
