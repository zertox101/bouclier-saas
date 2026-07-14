'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BookOpen,
    ChevronRight,
    Terminal,
    Shield,
    Activity,
    Zap,
    Database,
    Globe
} from 'lucide-react';

const DOCS_NAV = [
    {
        title: 'Getting Started',
        icon: Zap,
        items: [
            { title: 'Introduction', href: '/docs' },
            { title: 'Quick Start', href: '/docs/quick-start' },
            { title: 'Installation', href: '/docs/installation' },
        ],
    },
    {
        title: 'Core Operations',
        icon: Shield,
        items: [
            { title: 'SOC Dashboard', href: '/docs/dashboard' },
            { title: 'Operation Expert', href: '/docs/expert' },
            { title: 'Signals & Alerts', href: '/docs/alerts' },
        ],
    },
    {
        title: 'Intelligence Data',
        icon: Database,
        items: [
            { title: 'Tactical Datasets', href: '/docs/datasets' },
            { title: 'AI Model Training', href: '/docs/training' },
            { title: 'Feature Extraction', href: '/docs/features' },
        ],
    },
    {
        title: 'Gotham Suite',
        icon: Globe,
        items: [
            { title: 'Gaia 3D World Map', href: '/docs/gaia' },
            { title: 'OSINT Explorer', href: '/docs/osint' },
            { title: 'Sentinel AI', href: '/docs/sentinel' },
        ],
    },
    {
        title: 'Offensive Arsenal',
        icon: Terminal,
        items: [
            { title: 'Kali Integration', href: '/docs/kali' },
            { title: 'Red Team Ops', href: '/docs/red-team' },
            { title: 'Nmap Scanning', href: '/docs/nmap' },
            { title: 'Nuclei Scanner', href: '/docs/nuclei' },
        ],
    },
    {
        title: 'Reference',
        icon: BookOpen,
        items: [
            { title: 'API Reference', href: '/docs/api' },
            { title: 'Security Policy', href: '/docs/security' },
        ],
    },
];

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r border-border-1 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar py-8 px-4 hidden lg:block bg-bg-1/50">
            <div className="space-y-8">
                {DOCS_NAV.map((section) => (
                    <div key={section.title}>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <section.icon className="h-4 w-4 text-p-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">{section.title}</h4>
                        </div>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                                ? 'bg-p-500/10 text-p-400 font-medium'
                                                : 'text-text-2 hover:text-white hover:bg-bg-3/50'
                                                }`}
                                        >
                                            {item.title}
                                            <ChevronRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'opacity-100 translate-x-0' : '-translate-x-2 group-hover:translate-x-0'}`} />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </aside>
    );
}
