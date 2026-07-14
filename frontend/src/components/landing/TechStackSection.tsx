"use client";

import { motion } from "framer-motion";
import { Cpu, Code2, Shield, Zap, Box, Database, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const TECH_ITEMS = [
    {
        title: "Frontend Architecture",
        description: "Next.js 14 App Router for ultra-low latency navigation and real-time state synchronization.",
        icon: Code2,
        color: "text-cyan-400",
        tags: ["React", "Next.js", "Tailwind", "Framer Motion"]
    },
    {
        title: "Security Core API",
        description: "Asynchronous Python (FastAPI) engine managing thousands of concurrent scan operations.",
        icon: Cpu,
        color: "text-p-400",
        tags: ["Python 3.12", "FastAPI", "Uvicorn", "AsyncIO"]
    },
    {
        title: "Container Orchestration",
        description: "Isolated Kali Linux sandboxes with privileged network access for raw packet manipulation.",
        icon: Box,
        color: "text-blue-500",
        tags: ["Docker", "Kubernetes Ready", "Virtual Networking"]
    },
    {
        title: "Neural Intelligence",
        description: "Llama 3 powered AI engine (Ollama) providing sub-second automated vulnerability triage.",
        icon: Zap,
        color: "text-amber-400",
        tags: ["Ollama", "Sentinel AI", "Large Language Models"]
    },
    {
        title: "Telemetry & Cache",
        description: "Redis Pub/Sub architecture for real-time console streaming and signal buffering.",
        icon: Database,
        color: "text-emerald-400",
        tags: ["PostgreSQL", "Redis", "Prisma ORM"]
    },
    {
        title: "Enterprise Defense",
        description: "AES-256 data encryption with multi-tenant isolation and per-job audit logging.",
        icon: Shield,
        color: "text-red-400",
        tags: ["Encryption", "Security Audit", "RBAC"]
    }
];

export function TechStackSection() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-p-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-p-400 mb-6"
                    >
                        The Architecture
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 italic">
                        Enterprise-Grade <span className="text-p-400">Engineering.</span>
                    </h2>
                    <p className="max-w-2xl text-slate-400 text-sm font-medium leading-relaxed">
                        Bouclier is built on a distributed micro-services architecture designed for extreme security,
                        unmatched speed, and horizontal scalability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TECH_ITEMS.map((item, idx) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-white/20 hover:bg-slate-900/80 transition-all"
                        >
                            <div className={cn("h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", item.color)}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3 italic">{item.title}</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                                {item.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
