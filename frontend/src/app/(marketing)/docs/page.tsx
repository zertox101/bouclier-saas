'use client';

import {
    Terminal, Shield, Activity, Zap, BookOpen, Code,
    ChevronRight, Play, ArrowRight, Search, Globe, Cpu,
    Database, Lock, FileCode2, Network, Brain, Key,
    BookMarked, Layers, Radar, ServerCrash, Wifi, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { motion } from 'framer-motion';

const CATEGORIES = [
    {
        title: 'Quick Deployment',
        slug: 'installation',
        description: 'Docker-based deployment of sensors & core Bouclier SaaS platform.',
        icon: Zap,
        accent: '#38BDF8',
        tag: 'SETUP',
        image: '/images/docs/install.png'
    },
    {
        title: 'SOC Operations',
        slug: 'dashboard',
        description: 'Dashboard mastery, alert triage pipeline, and AI-driven response.',
        icon: Shield,
        accent: '#10B981',
        tag: 'OPERATIONS',
        image: '/images/docs/dashboard.png'
    },
    {
        title: 'Operation Expert',
        slug: 'expert',
        description: 'Advanced threat analysis, AI reasoning logs, and forensic data.',
        icon: Brain,
        accent: '#F59E0B',
        tag: 'EXPERT',
        image: '/images/docs/expert.png'
    },
    {
        title: 'Dataset Intelligence',
        slug: 'datasets',
        description: 'Comprehensive catalog of cybersecurity datasets for AI validation.',
        icon: Database,
        accent: '#10B981',
        tag: 'INTEL',
        image: '/images/docs/datasets.png'
    },
    {
        title: 'Global Intelligence',
        slug: 'gotham',
        description: 'Gaia 3D threat mapping and Sentinel AI predictive analysis.',
        icon: Globe,
        accent: '#8B5CF6',
        tag: 'GOTHAM',
        image: '/images/docs/threats.png'
    },
    {
        title: 'Intelligence Graph',
        slug: 'graph',
        description: 'Visualizing IP, domain, and malware sample relationships.',
        icon: Activity,
        accent: '#38BDF8',
        tag: 'GRAPH',
        image: '/images/docs/graph.png'
    },
];

const QUICK_LINKS = [
    { title: 'Quick Start Guide', href: '/docs/quick-start', icon: Play },
    { title: 'Docker Deployment', href: '/docs/installation', icon: HardDrive },
    { title: 'Alert Webhooks', href: '/docs/alerts', icon: Radar },
    { title: 'Nuclei Templates', href: '/docs/nuclei', icon: ServerCrash },
    { title: 'API Reference', href: '/docs/api', icon: Code },
    { title: 'Security Policy', href: '/docs/security', icon: Lock },
];

export default function DocsPage() {
    return (
        <div className="flex min-h-screen bg-[#030508]">
            <DocsSidebar />

            <main className="flex-1 py-12 px-8 lg:px-16 max-w-6xl mx-auto overflow-y-auto h-screen scrollbar-hide">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-[2px] text-sky-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                        <Database className="h-3 w-3" />
                        Bouclier Knowledge Base v2.6
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                        Platform <span className="text-sky-400">Docs.</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl leading-relaxed mb-10 font-medium">
                        Technical guides, API references & security playbooks for the Bouclier SaaS platform —
                        <span className="text-slate-400"> Université Ibn Tofail Cyber Lab.</span>
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full bg-[#0D1017] border border-white/5 rounded-[4px] pl-12 pr-24 py-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-sky-500/30 transition-colors font-mono"
                        />
                        <div className="absolute right-3 inset-y-3 px-3 bg-black/50 rounded-[2px] border border-white/5 flex items-center gap-1 text-[8px] font-black text-slate-600 select-none">
                            <kbd>CTRL</kbd>+<kbd>K</kbd>
                        </div>
                    </div>
                </motion.div>

                {/* Visual Showcase */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="group relative rounded-xl border border-white/5 bg-[#0D1017] p-2 hover:border-sky-500/20 transition-all">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black/50 relative">
                            <img src="/images/docs/dashboard.png" alt="Dashboard" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">SOC Dashboard</span>
                            </div>
                        </div>
                    </div>
                    <div className="group relative rounded-xl border border-white/5 bg-[#0D1017] p-2 hover:border-sky-500/20 transition-all">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black/50 relative">
                            <img src="/images/docs/datasets.png" alt="Datasets" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Intelligence Hub</span>
                            </div>
                        </div>
                    </div>
                    <div className="group relative rounded-xl border border-white/5 bg-[#0D1017] p-2 hover:border-sky-500/20 transition-all">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black/50 relative">
                            <img src="/images/docs/threats.png" alt="Threats" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Map</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Documentation Modules</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {CATEGORIES.map((cat, idx) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07 }}
                        >
                            <Link
                                href={`/docs/${cat.slug}`}
                                className="group block p-6 bg-[#0D1017] border border-white/5 rounded-[4px] hover:border-sky-500/20 transition-all relative overflow-hidden"
                            >
                                {/* Accent line */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)` }}
                                />

                                {/* Tag */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 border border-white/5 px-2 py-0.5 rounded-[1px]">
                                        {cat.tag}
                                    </span>
                                    <cat.icon className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors" style={{ color: `${cat.accent}80` }} />
                                </div>
                                
                                {/* Thumbnail */}
                                {cat.image && (
                                    <div className="mb-4 aspect-video rounded-[2px] overflow-hidden border border-white/5 bg-black/40">
                                        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}

                                <h3 className="text-sm font-black text-white uppercase tracking-wide mb-2 group-hover:text-sky-300 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-[11px] font-medium text-slate-600 leading-relaxed mb-4">
                                    {cat.description}
                                </p>

                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 group-hover:text-sky-400 transition-colors uppercase tracking-widest">
                                    <span>Read docs</span>
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-5 bg-sky-500 rounded-full" />
                        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Quick Access</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                className="flex items-center gap-3 p-4 bg-[#0D1017] border border-white/5 rounded-[4px] text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-sky-400 hover:border-sky-500/20 transition-all group"
                            >
                                <link.icon className="w-3.5 h-3.5 shrink-0 text-slate-700 group-hover:text-sky-500 transition-colors" />
                                <span className="flex-1">{link.title}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA Banner */}
                <motion.div
                    whileHover={{ scale: 1.005 }}
                    className="p-10 bg-[#0D1017] border border-sky-500/20 rounded-[4px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="h-5 w-5 text-sky-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Need Support?</h3>
                        </div>
                        <p className="text-slate-500 text-sm max-w-md">
                            Dedicated response team available for deployment assistance and technical escalation.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className="shrink-0 px-8 py-3 bg-sky-500/10 border border-sky-500/30 rounded-[4px] text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-500/20 transition-all flex items-center gap-2"
                    >
                        <Terminal className="h-3.5 w-3.5" />
                        Open Ticket
                    </Link>
                </motion.div>

                <footer className="mt-20 py-10 flex flex-col items-center opacity-20">
                    <div className="h-px w-20 bg-slate-600 mb-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.8em] text-slate-500">
                        Bouclier SaaS — Ibn Tofail University
                    </span>
                </footer>
            </main>
        </div>
    );
}
