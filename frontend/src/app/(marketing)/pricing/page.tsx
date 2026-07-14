"use client";

import { Shield, Server, GraduationCap, Cpu, Activity, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const SPECS = [
    {
        name: 'Undergraduate Node',
        description: 'Standard access for cybersecurity students.',
        features: [
            'Access to 5 virtualization nodes',
            'Standard intelligence feeds',
            'Basic adversarial emulation',
            '7 days telemetry retention',
            'Community support network'
        ]
    },
    {
        name: 'Researcher Node',
        description: 'Advanced capabilities for Master/PhD researchers.',
        highlighted: true,
        features: [
            'Access to 50+ virtualization nodes',
            'Advanced threat intelligence feeds',
            'Full Purple Team scenarios',
            '30 days telemetry retention',
            'Custom AI model deployment',
            'Priority compute scheduling'
        ]
    },
    {
        name: 'Faculty Command',
        description: 'Complete administrative access for professors.',
        features: [
            'Unlimited virtualization scaling',
            'Global threat map overview',
            'Custom lab scenario creation',
            'Unlimited telemetry retention',
            'API access for integrations',
            'Direct SOC pipeline control'
        ]
    }
];

export default function AcademicAccessPage() {
    return (
        <div className="min-h-screen bg-[#030508] py-24 font-sans selection:bg-amber-500/30 selection:text-amber-500 text-slate-300 relative overflow-hidden">
            <style>{`
                .gotham-bg {
                    background-image: 
                        linear-gradient(rgba(30, 41, 59, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30, 41, 59, 0.3) 1px, transparent 1px);
                    background-size: 50px 50px;
                    background-position: center center;
                }
                .gotham-panel {
                    background: rgba(8, 11, 18, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255,255,255,0.02);
                }
            `}</style>
            
            <div className="absolute inset-0 gotham-bg opacity-40 -z-20" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm">
                            <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-[0.2em] text-sky-400 uppercase">Projet Académique — Université Ibn Tofail</span>
                        </div>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-light text-white uppercase tracking-widest mb-4">
                        Academic <span className="font-bold text-sky-500">Infrastructure</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto uppercase tracking-wide">
                        This platform is strictly deployed for academic research, education, and cybersecurity training. Commercial usage is disabled.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto">
                    {SPECS.map((spec, i) => (
                        <motion.div
                            key={spec.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`gotham-panel rounded-lg p-8 relative overflow-hidden ${spec.highlighted ? 'border-sky-500/50 shadow-[0_0_30px_rgba(56,189,248,0.1)] transform scale-105 z-10' : ''}`}
                        >
                            {spec.highlighted && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-amber-500" />
                            )}
                            
                            <div className="mb-8">
                                <h3 className={`text-xl font-light tracking-widest uppercase mb-2 ${spec.highlighted ? 'text-white font-bold' : 'text-slate-300'}`}>
                                    {spec.name}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 min-h-[40px]">
                                    {spec.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {spec.features.map((feature, j) => (
                                    <div key={j} className="flex items-start gap-3">
                                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${spec.highlighted ? 'text-amber-500' : 'text-sky-500'}`} />
                                        <span className="text-sm font-mono text-slate-400">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/register" className={`w-full block text-center py-4 text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-all ${spec.highlighted ? 'bg-sky-500/20 border border-sky-500/50 text-sky-400 hover:bg-sky-500/30 hover:text-white' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
                                Request Allocation
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto gotham-panel rounded-lg p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]" />
                    <GraduationCap className="w-16 h-16 text-sky-500 mx-auto mb-6" strokeWidth={1} />
                    <h3 className="text-2xl font-light text-white uppercase tracking-widest mb-4">
                        Institutional Governance
                    </h3>
                    <p className="text-sm font-mono text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                        All operations conducted through the Bouclier platform are monitored and logged. Access is restricted exclusively to authorized students, researchers, and faculty members of Université Ibn Tofail.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                        <div className="flex items-center gap-2"><Server className="w-4 h-4" /> Lab Compute</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Ethical Hacking</div>
                        <div className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Neural SOC</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
