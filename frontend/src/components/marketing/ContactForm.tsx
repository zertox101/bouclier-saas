"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mimic API delay
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500 bg-slate-50 rounded-[3rem] border border-slate-100">
                <div className="mb-6 rounded-full bg-nokod-purple/10 p-6 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-nokod-purple" />
                </div>
                <h2 className="text-3xl font-black text-nokod-black tracking-tighter uppercase">Signal Received.</h2>
                <p className="mt-4 text-slate-500 font-medium max-w-xs mx-auto">Our security consultants will get back to you within 24 hours.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-nokod-purple hover:text-nokod-black transition-colors"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                    <input
                        required
                        type="text"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-nokod-black outline-none transition-all focus:border-nokod-purple/30 focus:bg-white focus:shadow-xl focus:shadow-slate-100 font-medium"
                        placeholder="John Wick"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Business Email</label>
                    <input
                        required
                        type="email"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-nokod-black outline-none transition-all focus:border-nokod-purple/30 focus:bg-white focus:shadow-xl focus:shadow-slate-100 font-medium"
                        placeholder="john@continental.com"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inquiry Type</label>
                <select className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-nokod-black outline-none transition-all focus:border-nokod-purple/30 focus:bg-white focus:shadow-xl focus:shadow-slate-100 font-bold appearance-none">
                    <option>General Inquiry</option>
                    <option>Sales & Licensing</option>
                    <option>Partnership</option>
                    <option>Technical Support</option>
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message</label>
                <textarea
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-nokod-black outline-none transition-all focus:border-nokod-purple/30 focus:bg-white focus:shadow-xl focus:shadow-slate-100 font-medium"
                    placeholder="Describe your security challenge..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-nokod-black p-6 font-black uppercase tracking-[0.1em] text-white transition-all hover:bg-slate-800 disabled:opacity-50 shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                    <>
                        Initiate Connection
                        <Send className="h-4 w-4" />
                    </>
                )}
            </button>
            <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest">By submitting, you agree to our privacy policy.</p>
        </form>
    );
}
