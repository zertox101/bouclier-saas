import ContactForm from "@/components/marketing/ContactForm";
import { Mail, MessageSquare, Phone, MapPin, ShieldCheck, Zap } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto py-32 lg:py-48">
                <div className="grid gap-24 lg:grid-cols-2 lg:items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-nokod-purple/10 px-4 py-1.5 mb-8">
                            <Zap className="h-3.5 w-3.5 text-nokod-purple" />
                            <span className="text-[10px] font-black text-nokod-purple uppercase tracking-[0.2em]">Live Connection</span>
                        </div>
                        <h1 className="text-5xl font-black text-nokod-black mb-8 tracking-tighter md:text-7xl">Let's build <br /><span className="text-slate-400">your defense.</span></h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed mb-16 max-w-lg">
                            Have questions about our enterprise features, licensing, or private cloud architecture? Reach out to our engineers.
                        </p>

                        <div className="grid gap-12 sm:grid-cols-2">
                            {[
                                { title: "Sales Support", details: "sales@bouclier.com", icon: Mail },
                                { title: "Technical Desk", details: "+1 (888) SEC-SOC1", icon: Phone },
                                { title: "Global Hub", details: "Cyber District, Paris", icon: MapPin },
                                { title: "Live Response", details: "Average under 5m", icon: MessageSquare }
                            ].map(item => (
                                <div key={item.title} className="flex flex-col gap-4 group">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-nokod-black transition-colors group-hover:bg-nokod-black group-hover:text-white group-hover:shadow-xl shadow-slate-200">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-nokod-black text-xs uppercase tracking-widest mb-1">{item.title}</h4>
                                        <p className="text-slate-500 font-bold text-sm">{item.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-nokod-purple/5 blur-[120px] rounded-full -z-10" />
                        <div className="rounded-[4rem] border border-slate-100 bg-white p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-3 mb-10">
                                <ShieldCheck className="h-5 w-5 text-nokod-purple" />
                                <h3 className="text-2xl font-black text-nokod-black tracking-tight uppercase">Send Transmission</h3>
                            </div>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Presence */}
            <section className="py-32 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto text-center">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Global Infrastructure Presence</h2>
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-12 grayscale opacity-40">
                        {["North America", "European Union", "Asia Pacific", "Middle East"].map(region => (
                            <div key={region} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-nokod-black" />
                                <span className="text-sm font-black text-nokod-black uppercase tracking-widest">{region}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
