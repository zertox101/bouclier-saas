import { Terminal, Shield, Zap, Search } from "lucide-react";

const cases = [
    {
        title: "Incident Response",
        role: "Threat Hunter",
        description: "Pivot from a suspicious alert to a full packet stream in two clicks. Use the 3D map to identify lateral movement patterns across segments.",
        icon: Search,
    },
    {
        title: "Continuous Monitoring",
        role: "SOC Analyst",
        description: "Automate the grunt work. Let Sentinel AI triage low-severity noise while you focus on correlating high-value signals and refining detection rules.",
        icon: Zap,
    },
    {
        title: "Vulnerability Management",
        role: "Security Engineer",
        description: "Stop relying on static reports. See exactly which exposed assets are being targeted in real-time and prioritize patching based on live exploit attempts.",
        icon: Shield,
    }
];

export default function UseCases() {
    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-nokod-black md:text-6xl tracking-tighter">Built for <br /><span className="text-slate-400">Security Experts.</span></h2>
                    <p className="mt-6 text-lg text-slate-500 max-w-xl font-medium italic">Realistic workflows designed by security professionals, for security professionals.</p>
                </div>

                <div className="grid gap-0 md:grid-cols-3 border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100">
                    {cases.map((c, i) => (
                        <div key={c.title} className={`group relative p-12 transition-all hover:bg-slate-50 ${i !== 2 ? 'border-b md:border-b-0 md:border-r border-slate-100' : ''}`}>
                            <div className="mb-10 flex justify-between items-start">
                                <div className="h-12 w-12 rounded-2xl bg-nokod-black flex items-center justify-center text-white">
                                    <c.icon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{c.role}</span>
                            </div>
                            <h3 className="text-2xl font-black text-nokod-black mb-4 tracking-tight">{c.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {c.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
