import { Shield, EyeOff, Lock } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto py-32 md:py-48 max-w-4xl">
                <div className="text-center mb-24">
                    <h1 className="text-5xl font-black text-nokod-black tracking-tighter md:text-7xl uppercase">Privacy <br /><span className="text-slate-400">Policy.</span></h1>
                    <p className="mt-8 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Last Updated: January 10, 2026</p>
                </div>

                <div className="space-y-16">
                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-10 items-start">
                        <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center shrink-0 border border-slate-100">
                            <Shield className="h-8 w-8 text-nokod-purple" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-nokod-black mb-4 tracking-tight uppercase">01. Data Governance</h2>
                            <p className="leading-relaxed text-slate-500 font-medium text-lg">
                                Bouclier collects network telemetry, security events, and user activity strictly for the purpose of threat detection and infrastructure defense. Unlike industry giants, we do not monetize your data; your security telemetry remains your asset.
                            </p>
                        </div>
                    </section>

                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100 flex flex-col md:flex-row gap-10 items-start">
                        <div className="h-16 w-16 rounded-3xl bg-slate-900 shadow-xl flex items-center justify-center shrink-0">
                            <EyeOff className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-nokod-black mb-4 tracking-tight uppercase">02. AI Isolation</h2>
                            <p className="leading-relaxed text-slate-500 font-medium text-lg">
                                Sentinel AI processes your logs locally or within your private instance using RAG (Retrieval-Augmented Generation). Your proprietary vulnerability data and internal network maps are never leaked into global training sets.
                            </p>
                        </div>
                    </section>

                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-10 items-start">
                        <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center shrink-0 border border-slate-100">
                            <Lock className="h-8 w-8 text-nokod-purple" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-nokod-black mb-4 tracking-tight uppercase">03. Encryption Standards</h2>
                            <p className="leading-relaxed text-slate-500 font-medium text-lg">
                                We employ AES-256-GCM encryption for all data at rest and TLS 1.3 for data in transit. In air-gapped deployments, you maintain full control over the encryption keys and hardware security modules (HSM).
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-24 p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-nokod-purple/10 blur-[60px] rounded-full" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Your Privacy is our Promise.</p>
                    <p className="text-lg font-bold text-nokod-black">Questions? Contact <a href="mailto:privacy@bouclier.com" className="text-nokod-purple underline">privacy@bouclier.com</a></p>
                </div>
            </div>
        </div>
    );
}
