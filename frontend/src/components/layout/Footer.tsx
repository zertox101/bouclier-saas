'use client';

import Link from 'next/link';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

const FOOTER_LINKS = {
    product: [
        { href: '/features', label: 'Features' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/security', label: 'Security' },
        { href: '/integrations', label: 'Integrations' },
    ],
    docs: [
        { href: '/docs', label: 'Documentation' },
        { href: '/docs/api', label: 'API Reference' },
        { href: '/docs/guides', label: 'Guides' },
        { href: '/docs/purple-team', label: 'Purple Team' },
    ],
    company: [
        { href: '/about', label: 'About' },
        { href: '/blog', label: 'Blog' },
        { href: '/careers', label: 'Careers' },
        { href: '/contact', label: 'Contact' },
    ],
    legal: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/compliance', label: 'Compliance' },
        { href: '/security-policy', label: 'Security Policy' },
    ],
};

const SOCIAL_LINKS = [
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
];

export function Footer() {
    return (
        <footer className="border-t border-border-1 bg-bg-1/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <div className="relative">
                                <Shield className="h-7 w-7 text-white group-hover:text-p-400 transition-colors" />
                                <div className="absolute inset-0 blur-lg bg-p-500/20 group-hover:bg-p-500/40 transition-all" />
                            </div>
                            <span className="text-xl font-black text-white uppercase tracking-tighter">
                                Bouclier<span className="text-p-400">.</span>
                            </span>
                        </Link>
                        <p className="text-sm font-medium text-text-3 max-w-xs mb-8 leading-relaxed">
                            Unified Security Operations & Threat Intelligence.
                            Secure your digital perimeter with autonomous SOC orchestration.
                        </p>
                        <div className="flex items-center gap-4">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-text-3 hover:text-p-400 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-3 hover:text-p-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Docs Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Docs</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.docs.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-3 hover:text-p-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-3 hover:text-p-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-3 hover:text-p-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border-1">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} Bouclier. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-text-3">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                All systems operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
