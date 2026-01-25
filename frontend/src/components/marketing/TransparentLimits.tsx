import { Info, AlertTriangle } from "lucide-react";

export default function TransparentLimits() {
    return (
        <section className="py-32 bg-slate-50">
            <div className="container mx-auto">
                <div className="rounded-[4rem] border border-slate-200 bg-white p-12 md:p-20 relative overflow-hidden">
                    {/* Accent decoration */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-slate-50 flex items-center justify-center">
                        <AlertTriangle className="h-20 w-20 text-slate-100" />
                    </div>

                    <div className="max-w-2xl relative z-10">
                        <h2 className="text-4xl font-black text-nokod-black mb-8 tracking-tighter">Transparent Limits <br /><span className="text-slate-400">(What is not included)</span></h2>
                        <p className="text-slate-500 mb-12 leading-relaxed font-medium">
                            We focus on high-fidelity network telemetry first. To ensure Bouclier is production-ready for its core primitives, we have explicitly excluded the following from the MVP:
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                "Native MacOS/Windows EDR agents",
                                "SOAR workflow orchestration",
                                "Hardware acceleration for 100G",
                                "Federated cross-tenant searching",
                                "Cold log archiving (S3/Glacier)",
                                "Full Identity Provider (IdP) sync"
                            ].map(item => (
                                <div key={item} className="flex gap-4 items-center">
                                    <div className="h-2 w-2 shrink-0 rounded-full bg-slate-200" />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex gap-4 items-center max-w-lg">
                            <Info className="h-5 w-5 text-nokod-purple shrink-0" />
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                Our roadmap is public. We prioritize stability over feature bloat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
