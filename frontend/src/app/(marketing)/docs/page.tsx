'use client';

import {
    Terminal,
    Shield,
    Activity,
    Zap,
    BookOpen,
    Code,
    ChevronRight,
    Play,
    ArrowRight,
    Search,
    Globe,
    Cpu,
    Database,
    Lock
} from 'lucide-react';
import Link from 'next/link';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { motion } from 'framer-motion';

const CATEGORIES = [
    {
        title: 'Installation',
        slug: 'installation',
        description: 'Learn how to deploy CyberDetect sensors and the core platform on your infrastructure.',
        icon: Zap,
        color: 'text-p-400',
        bgColor: 'bg-p-400/10',
    },
    {
        title: 'SOC Operations',
        slug: 'dashboard',
        description: 'Master the dashboard, alert triage, and incident response workflows.',
        icon: Shield,
        color: 'text-success',
        bgColor: 'bg-success/10',
    },
    {
        title: 'Web Scanner',
        slug: 'zap',
        description: 'Configure automated web vulnerability scans with ZAP and Nuclei engines.',
        icon: Globe,
        color: 'text-info',
        bgColor: 'bg-info/10',
    },
    {
        title: 'Hardware Hacking',
        slug: 'flipper',
        description: 'Command center for Flipper Zero, RFID, NFC, and WiFi spectrum analysis.',
        icon: Cpu,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
    },
];

const QUICK_LINKS = [
    { title: 'Quick Start Guide', href: '/docs/quick-start' },
    { title: 'Docker Deployment', href: '/docs/installation' },
    { title: 'Alert Notifications', href: '/docs/alerts' },
    { title: 'Nuclei Templates', href: '/docs/nuclei' },
    { title: 'API Reference', href: '/docs/api' },
    { title: 'Security Policy', href: '/docs/security' },
];

export default function DocsPage() {
    return (
        <div className="flex min-h-screen bg-bg-0">
            <DocsSidebar />

            <main className="flex-1 py-12 px-6 lg:px-12 max-w-5xl mx-auto overflow-y-auto h-screen no-scrollbar">
                {/* Search Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-p-500/10 border border-p-500/20 text-p-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Database className="h-3 w-3" /> Knowledge Base v2.4
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Documentation <span className="text-p-400">Hub.</span>
                    </h1>
                    <p className="text-xl text-text-2 font-medium max-w-2xl leading-relaxed mb-10">
                        Explore technical guides, API references, and security playbooks to master the CyberDetect SaaS platform.
                    </p>

                    <div className="relative group max-w-xl">
                        <div className="absolute inset-y-0 left-6 flex items-center text-text-3 group-focus-within:text-p-400 transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH INTELLIGENCE DATABASE..."
                            className="w-full bg-bg-1/50 border border-border-1 rounded-2xl pl-16 pr-6 py-5 text-[10px] font-black tracking-[0.2em] text-white focus:outline-none focus:border-p-500/30 transition-all uppercase placeholder:opacity-30"
                        />
                        <div className="absolute right-4 inset-y-4 px-3 bg-bg-2 rounded-lg border border-border-1 flex items-center gap-1.5 text-[8px] font-black text-text-3 select-none">
                            <kbd>CTRL</kbd> + <kbd>K</kbd>
                        </div>
                    </div>
                </motion.div>

                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {CATEGORIES.map((category, idx) => (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link
                                href={`/docs/${category.slug}`}
                                className="glass-card p-10 rounded-[32px] border border-border-1 hover:border-p-500/30 transition-all group block h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <category.icon className="h-32 w-32" />
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${category.bgColor} ${category.color} flex items-center justify-center mb-8 border border-white/5`}>
                                    <category.icon className="h-7 w-7 shadow-[0_0_15px_rgba(inherit,0.2)]" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-p-400 transition-colors uppercase tracking-tight">
                                    {category.title}
                                </h3>
                                <p className="text-text-2 text-sm leading-relaxed mb-8 font-bold uppercase tracking-tight opacity-70">
                                    {category.description}
                                </p>
                                <div className="flex items-center gap-2 text-p-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Initialize Protocol
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Links Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-px bg-p-500" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">
                            Subroutine Navigation
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                className="bg-bg-1/30 p-6 rounded-2xl border border-border-1 text-[10px] font-black uppercase tracking-widest text-text-3 hover:bg-bg-2 hover:text-p-400 hover:border-p-500/20 transition-all flex items-center justify-between group"
                            >
                                {link.title}
                                <ChevronRight className="h-4 w-4 text-text-3 group-hover:text-p-400 transition-all group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="glass-card rounded-[40px] p-12 bg-gradient-to-br from-p-500/10 via-bg-1 to-info/5 border border-p-500/20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group/cta"
                >
                    <div className="absolute inset-0 bg-grid-white opacity-[0.02] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Activity className="h-6 w-6 text-p-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Operational Support?</h3>
                        </div>
                        <p className="text-text-2 text-sm font-bold uppercase tracking-wide max-w-md">Our global response team is available 24/7 for deployment assistance and technical escalation.</p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <Link
                            href="/contact"
                            className="px-10 py-5 rounded-2xl bg-white text-bg-0 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-p-400 hover:text-white transition-all shadow-2xl flex items-center gap-3"
                        >
                            <Terminal className="h-4 w-4" /> Open Support Ticket
                        </Link>
                    </div>
                </motion.div>

                <footer className="mt-24 py-12 flex flex-col items-center opacity-30">
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-text-3 to-transparent mb-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.8em]">End of Transmission</span>
                </footer>
            </main>
        </div>
    );
}
