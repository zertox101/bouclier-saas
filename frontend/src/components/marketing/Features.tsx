import { Activity, Globe, Lock, Search, Shield, Zap } from "lucide-react";

const features = [
    {
        title: "Real-time Traffic Map",
        description: "Visualize network threats on a high-fidelity 3D globe. Track attack vectors from origin to destination as they happen.",
        icon: Globe,
    },
    {
        title: "Deep Packet Inspection",
        description: "Wireshark-grade analysis directly in your browser. Inspect protocols, payloads, and headers with nanosecond precision.",
        icon: Activity,
    },
    {
        title: "Sentinel AI Analyst",
        description: "Native RAG-powered security assistant. Ask complex questions about your infrastructure and get prioritized remediation steps.",
        icon: Search,
    },
    {
        title: "Adversary Emulation",
        description: "Go beyond simulation. Emulate real-world APTs and Ransomware strains in real-time to validate your EDR and SIEM effectiveness.",
        icon: Zap,
    },
    {
        title: "Military-Grade Encryption",
        description: "End-to-end encryption for all telemetry and data at rest. SOC2 ready audit trails and tamper-proof log storage.",
        icon: Lock,
    },
    {
        title: "Automated Incident Response",
        description: "Trigger security playbooks automatically. Block IPs, isolate containers, or alert stakeholders in seconds.",
        icon: Zap,
    }
];

export default function Features() {
    return (
        <section className="py-32 bg-white relative">
            <div className="container mx-auto">
                <div className="max-w-3xl mb-16">
                    <h2 className="text-4xl font-black text-nokod-black md:text-6xl tracking-tighter">Everything you need <br /><span className="text-slate-400">to move fast.</span></h2>
                    <p className="mt-6 text-lg text-slate-500 max-w-xl font-medium">
                        Bouclier centralizes your fragmented security stack into a single, cohesive source of truth. No clutter, just visibility.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-4xl bg-[#F8FAFC] p-10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100"
                        >
                            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm transition-transform group-hover:scale-110">
                                <feature.icon className="h-6 w-6 text-nokod-purple" />
                            </div>
                            <h3 className="text-xl font-bold text-nokod-black mb-4">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
