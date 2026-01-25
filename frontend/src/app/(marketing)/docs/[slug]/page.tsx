'use client';

import { useParams } from 'next/navigation';
import {
    Zap, Shield, Activity, Terminal, BookOpen,
    ChevronRight, ArrowRight, Play, Server,
    Lock, Search, Globe, Cpu, Database, Code
} from 'lucide-react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const DOC_CONTENT: Record<string, any> = {
    'quick-start': {
        title: 'Quick Start Guide',
        description: 'Get up and running with CyberDetect in less than 5 minutes.',
        icon: Zap,
        sections: [
            {
                title: '1. Connect Your Infrastructure',
                content: 'Navigate to the Deployment tab and download the sensor for your operating system. We support Linux (Ubuntu/Debian), Windows, and Docker containers.'
            },
            {
                title: '2. Verify Uplink Status',
                content: 'Once the sensor is running, check the "Operational Status" in the Overview dashboard. You should see your node appearing in the Global Threat Sphere.'
            },
            {
                title: '3. Run Your First Scan',
                content: 'Go to the Web Scanner module, enter a target URL (e.g., your staging environment), and hit "Initialize Engine". CyberDetect will begin identifying vulnerabilities.'
            }
        ]
    },
    'installation': {
        title: 'Installation Guide',
        description: 'Detailed instructions for deploying CyberDetect across different environments.',
        icon: Server,
        sections: [
            {
                title: 'Docker Deployment',
                content: 'The fastest way to deploy. Use our provided docker-compose.yml to spin up the entire stack including the scanner engines (ZAP & Nuclei) and the AI analysis engine.'
            },
            {
                title: 'Network Sensors',
                content: 'For deep packet inspection, install our lightweight sensors on your network gateways. They will stream real-time telemetry back to the Command Center via encrypted SSE tunnels.'
            },
            {
                title: 'Cloud Integration',
                content: 'Connect your AWS/Azure/GCP environments using our pre-built IAM roles to monitor cloud assets and identify misconfigurations.'
            }
        ]
    },
    'dashboard': {
        title: 'SOC Dashboard',
        description: 'Mastering the Command Center and real-time visualization tools.',
        icon: Shield,
        sections: [
            {
                title: 'Live Threat Sphere',
                content: 'A high-fidelity 3D visualization of global attack traffic. Points on the globe represent detected threats, while arcs show the flow of malicious traffic intercepted by your sensors.'
            },
            {
                title: 'Neural Signals',
                content: 'The "Neural Link" station displays a low-latency stream of system events. Our AI engine categorizes these events into risk levels automatically.'
            },
            {
                title: 'System Risk Score',
                content: 'A real-time calculation based on the volume and severity of intercepted attacks. Keeping this score low is the primary objective of your SOC team.'
            }
        ]
    },
    'flipper': {
        title: 'Flipper Command Center',
        description: 'Advanced hardware-assisted security testing and emulation.',
        icon: Zap,
        sections: [
            {
                title: 'WiFi Spectrum Analysis',
                content: 'Utilize the Alfa WiFi adapter to perform deep spectrum analysis, deauthentication attacks, and WPA handsake captures directly from the interface.'
            },
            {
                title: 'Protocol Emulation',
                content: 'Emulate RFID, NFC, and Sub-GHz signals for physical security testing. Store and replay captures via the onboard SD card bridge.'
            },
            {
                title: 'BadUSB & HID Injection',
                content: 'Deploy custom DuckyScript payloads through the BadUSB interface for rapid system audit and credential harvesting simulations.'
            }
        ]
    },
    'alerts': {
        title: 'Signals & Alerts',
        description: 'Understanding the detection lifecycle and telemetry buffer.',
        icon: Activity,
        sections: [
            {
                title: 'High-Fidelity Detections',
                content: 'Our engine filters millions of raw events into actionable signals. Alerts are categorized by MITRE ATT&CK techniques to give you full context of the adversary behavior.'
            },
            {
                title: 'Telemetry Buffer',
                content: 'Access the raw, encrypted stream of events directly from the Alerts page. This terminal-like view allows for real-time monitoring of specific sensor nodes.'
            },
            {
                title: 'Triage Workflow',
                content: 'Assign alerts to analysts, mark them as false positives, or escalate them to incidents. Every action is logged for compliance and audit trails.'
            }
        ]
    },
    'nuclei': {
        title: 'Nuclei Vulnerability Scanner',
        description: 'Advanced template-based scanning for modern web applications.',
        icon: Terminal,
        sections: [
            {
                title: 'Automated Template Selection',
                content: 'CyberDetect automatically selects the most relevant Nuclei templates based on the technologies detected during the initial reconnaissance phase.'
            },
            {
                title: 'Custom Template Support',
                content: 'Upload your own YAML templates to the platform to detect proprietary vulnerabilities or specific misconfigurations in your unique environment.'
            },
            {
                title: 'Real-time Progress Tracking',
                content: 'Monitor the status of your Nuclei scans job-by-job. The results are normalized and streamed directly to your Vulnerability Matrix.'
            }
        ]
    },
    'api': {
        title: 'Platform API Reference',
        description: 'Automate your SOC and integrate third-party tools via REST.',
        icon: Code,
        sections: [
            {
                title: 'Authentication',
                content: 'Generate MIL-SPEC API keys from the Settings panel. All requests must be made over HTTPS with the X-API-KEY header.'
            },
            {
                title: 'Streaming Telemetry',
                content: 'Mirror our internal SSE tunnels to your own SIEM (Splunk, Elastic, Sentinel) using our specialized binary-stream endpoints.'
            },
            {
                title: 'Actionable Endpoints',
                content: 'Programmatically trigger scans, resolve alerts, or deploy new sensors across your cloud clusters using the orchestration API.'
            }
        ]
    }
};

export default function DocDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const content = DOC_CONTENT[slug] || {
        title: 'Documentation',
        description: 'This documentation page is currently being compiled by the CyberDetect intelligence team.',
        icon: BookOpen,
        sections: [
            {
                title: 'Coming Soon',
                content: 'We are rapidly updating our documentation to match the latest V2.4.0 SaaS features. Check back shortly for detailed guides on this module.'
            }
        ]
    };

    const Icon = content.icon;

    return (
        <div className="flex min-h-screen bg-bg-0">
            <DocsSidebar />

            <main className="flex-1 py-12 px-6 lg:px-12 max-w-5xl mx-auto overflow-y-auto h-screen no-scrollbar">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                            <Icon className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-p-400 mb-1 leading-none">Intelligence Ref_{slug.toUpperCase().replace('-', '_')}</span>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{content.title}.</h1>
                        </div>
                    </div>
                    <p className="text-lg text-text-2 font-medium max-w-2xl border-l-2 border-border-1 pl-6 mb-12 italic">
                        "{content.description}"
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {content.sections.map((section: any, idx: number) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-10 rounded-[32px] border border-border-1 hover:border-white/10 transition-colors group"
                        >
                            <div className="flex items-start gap-8">
                                <span className="text-4xl font-black text-white/5 group-hover:text-p-400/20 transition-colors font-mono tracking-tighter shrink-0 select-none">
                                    0{idx + 1}
                                </span>
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-p-500" />
                                        {section.title}
                                    </h2>
                                    <div className="text-text-2 text-sm leading-relaxed font-bold uppercase tracking-wide opacity-80 border-l border-white/5 pl-6 py-2">
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="mt-20 pt-12 border-t border-border-1 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-3">
                    <div className="flex items-center gap-6">
                        <span>Modified: 22_JAN_2026</span>
                        <span>Auth: AI_SENTINEL</span>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-5 py-2 rounded-xl bg-bg-2 hover:bg-bg-3 transition-colors border border-border-1">
                            Share Guide
                        </button>
                        <button className="px-5 py-2 rounded-xl bg-p-500 text-white shadow-xl shadow-p-500/20">
                            Was this helpful?
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
