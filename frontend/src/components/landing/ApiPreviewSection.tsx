"use client";

import { motion } from "framer-motion";
import { Copy, Terminal, Check } from "lucide-react";
import { useState } from "react";

const CODE_SNIPPET = `import requests

# Initialize Bouclier Enterprise Client
api_key = "BOUCLIER_EXP_8812_XX"
target = "10.0.8.42"

# Deploy Automated SQLmap Scan
response = requests.post(
    "https://api.bouclier.ma/v1/tools/run",
    json={
        "tool_id": "sqlmap_scan",
        "input": {"target": target, "level": 5}
    },
    headers={"Authorization": f"Bearer {api_key}"}
)

print(f"Scan Deployed: {response.json()['job_id']}")`;

export function ApiPreviewSection() {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(CODE_SNIPPET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-24 bg-bg-1/50 border-y border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-p-400 font-black uppercase tracking-widest text-[10px]">
                            <Terminal className="h-4 w-4" />
                            Security Operations as Code
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8 italic">
                            Built for <span className="text-p-400">Automatons.</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg">
                            Integrate Bouclier directly into your CI/CD pipelines or security automation playbooks.
                            Our REST API gives you full control over 78+ tactical tools with a single line of code.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {["Full REST API Access", "Webhook Alerts", "JSON telemetry export", "SDK for Python & JS"].map(item => (
                                <li key={item} className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-tight">
                                    <div className="h-1.5 w-1.5 rounded-full bg-p-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="px-8 py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-p-400 hover:text-white transition-all">
                            View API Documentation
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-p-500/10 rounded-[3rem] blur-2xl" />
                        <div className="relative bg-[#0d1117] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                                <div className="flex gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/40" />
                                    <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">secure_client_init.py</div>
                                <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors">
                                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="p-8 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                                <pre>
                                    <code>
                                        {CODE_SNIPPET}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
