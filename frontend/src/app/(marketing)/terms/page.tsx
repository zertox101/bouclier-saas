export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto py-32 md:py-48 max-w-4xl">
                <div className="text-center mb-24">
                    <h1 className="text-5xl font-black text-nokod-black tracking-tighter md:text-7xl uppercase">Terms of <br /><span className="text-slate-400">Service.</span></h1>
                    <p className="mt-8 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Latest Update: January 10, 2026</p>
                </div>

                <div className="space-y-16">
                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50">
                        <h2 className="text-2xl font-black text-nokod-black mb-6 tracking-tight uppercase">01. Acceptance of Terms</h2>
                        <p className="leading-relaxed text-slate-500 font-medium text-lg">
                            By accessing Bouclier's services, you agree to be bound by these Terms of Service and all applicable security laws and regulations. Our platform is designed for defensive security operations; any attempt to use Bouclier for unauthorized offensive activities is a direct violation of these terms.
                        </p>
                    </section>

                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100">
                        <h2 className="text-2xl font-black text-nokod-black mb-6 tracking-tight uppercase">02. Defensive Use License</h2>
                        <p className="leading-relaxed text-slate-500 font-medium text-lg">
                            Permission is granted to use Bouclier for legitimate security monitoring, threat hunting, and infrastructure defense. This is the grant of a license, not a transfer of title. We reserve the right to terminate access if the platform is identified as being used as a staging ground for malicious activities.
                        </p>
                    </section>

                    <section className="p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50">
                        <h2 className="text-2xl font-black text-nokod-black mb-6 tracking-tight uppercase">03. Data Integrity & Integrity</h2>
                        <p className="leading-relaxed text-slate-500 font-medium text-lg">
                            We prioritize your data security and platform integrity. You are responsible for the security of your ingestion keys and administrative accounts. Bouclier Corp is not liable for data loss resulting from improperly secured air-gapped deployments.
                        </p>
                    </section>
                </div>

                <div className="mt-24 p-12 rounded-[3rem] bg-nokod-black text-white text-center shadow-2xl shadow-black/20">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">Questions regarding our legal framework?</p>
                    <a href="mailto:legal@bouclier.com" className="text-2xl font-black tracking-tighter hover:text-nokod-purple transition-colors">legal@bouclier.com</a>
                </div>
            </div>
        </div>
    );
}
