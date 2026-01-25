import { ArrowRight } from "lucide-react";

const steps = [
    {
        num: "01",
        title: "Deploy & Connect",
        description: "Install our lightweight agent or connect your cloud infrastructure via read-only APIs in less than 5 minutes.",
    },
    {
        num: "02",
        title: "Ingest & Analyze",
        description: "Our high-performance backend processes up to 1M events/sec, enriching telemetry with GeoIP and AI signatures.",
    },
    {
        num: "03",
        title: "Detect & Remediate",
        description: "Identify threats on the 3D globe and deploy automated playbooks to neutralize attacks before they cause damage.",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-32 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row gap-20 items-center">
                    <div className="flex-1">
                        <h2 className="text-4xl font-black text-nokod-black md:text-6xl tracking-tighter">Deployment is <br /><span className="text-slate-400">Seamless.</span></h2>
                        <p className="mt-8 text-lg text-slate-500 max-w-md leading-relaxed font-medium">
                            We've engineered Bouclier to be zero-friction. No complex handshakes, no downtime, just instant visibility.
                        </p>
                        <div className="mt-12">
                            <button className="flex items-center gap-3 group text-nokod-black font-black uppercase tracking-[0.2em] text-xs">
                                View Setup Guide
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2 text-nokod-purple" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-16">
                        {steps.map((step) => (
                            <div key={step.num} className="flex gap-8 group">
                                <div className="text-5xl font-black text-slate-200 group-hover:text-nokod-purple/20 transition-colors leading-none tracking-tighter">
                                    {step.num}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-nokod-black mb-3">{step.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
