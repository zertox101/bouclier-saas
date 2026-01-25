"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "Do I need to install anything on my servers?",
        answer: "No. While we offer a lightweight agent for deep visibility, you can use our agentless collector which relies on VPC Flow Logs and SNMP to monitor your infrastructure.",
    },
    {
        question: "Is Bouclier GDPR and SOC2 compliant?",
        answer: "Yes. Bouclier is designed with privacy-first principles. All logs are stored in your selected region and we offer built-in audit trails for compliance.",
    },
    {
        question: "Can I integrate it with my current SIEM?",
        answer: "Absolutely. We offer native export to Splunk, ElasticSearch, and generic Webhooks to ensure your existing SOC workflow remains uninterrupted.",
    },
    {
        question: "Does the AI assistant have access to my sensitive data?",
        answer: "The AI Analyst (Sentinel) uses a Retrieval-Augmented Generation (RAG) approach that indexes your logs locally. Your sensitive data never leaves your environment.",
    },
    {
        question: "What is the difference between Emulation and Simulation?",
        answer: "Simulation uses synthetic traffic to test alerts. Our Adversary Emulation executes real TTPs (like specific malware behaviors and network patterns) to validate your security posture against actual threats.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 bg-slate-50">
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-4xl font-black text-center text-nokod-black mb-20 tracking-tighter">Frequently Asked <br /><span className="text-slate-400">Questions.</span></h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-3xl border border-slate-200 bg-white overflow-hidden transition-all duration-500"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="flex w-full items-center justify-between p-8 text-left"
                            >
                                <span className="font-bold text-lg text-slate-800 tracking-tight">{faq.question}</span>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 ${openIndex === index ? 'bg-nokod-black text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {openIndex === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-8 font-medium text-slate-500 leading-relaxed text-sm max-w-2xl">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
