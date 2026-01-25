import { ShieldCheck, Lock, EyeOff, Scale } from "lucide-react";

export default function TrustPrivacy() {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Mesh Glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 h-[400px] w-[400px] bg-nokod-blue/5 blur-[100px] rounded-full" />

            <div className="container mx-auto">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-6 p-8 rounded-4xl bg-slate-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3 text-nokod-purple">
                            <Lock className="h-6 w-6" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Self-Hosted Option</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Your telemetry never leaves your perimeter unless you want it to. We offer full air-gapped deployment support for sensitive environments.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 p-8 rounded-4xl bg-slate-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3 text-nokod-purple">
                            <EyeOff className="h-6 w-6" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">No Data Harvesting</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            We don't train global models on your private security logs. Your Sentinel AI instances are isolated and use RAG on your local index.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 p-8 rounded-4xl bg-slate-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3 text-nokod-purple">
                            <ShieldCheck className="h-6 w-6" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Zero Trust by Design</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Every internal API call is authenticated via mTLS. No "soft" internal network. We assume breach in our own architectural patterns.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 p-8 rounded-4xl bg-slate-50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3 text-nokod-purple">
                            <Scale className="h-6 w-6" />
                            <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Honest Compliance</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            We are currently in the process of SOC2 Type II certification. We don't hide behind fake badges; we provide raw audit logs for your DPAs.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
