"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Terminal,
    Play,
    Award,
    Cpu,
    Shield,
    Lock,
    CheckCircle,
    Clock,
    AlertTriangle,
    GraduationCap,
    FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types based on backend/app/models/academy_sql.py (inferred)
interface Module {
    id: number;
    title: string;
    description: string;
    difficulty: 'Basic' | 'Intermediate' | 'Advanced';
    category: string;
}

interface Lab {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    enabled: boolean;
}

import { apiClient, ApiError } from '@/lib/api-client';

export default function AcademyPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [labs, setLabs] = useState<Lab[]>([]);
    const [activeTab, setActiveTab] = useState<'learn' | 'range'>('learn');
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
    const [sessionStatus, setSessionStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            await Promise.all([fetchCatalog(), fetchLabs()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const fetchCatalog = async () => {
        try {
            const data = await apiClient('/academy/catalog');
            setModules(data);
        } catch (e) {
            console.error("Failed to fetch catalog", e);
        }
    };

    const fetchLabs = async () => {
        try {
            const data = await apiClient('/academy/labs');
            setLabs(data);
        } catch (e) {
            console.error("Failed to fetch labs", e);
        }
    };

    const startLab = async (lab: Lab) => {
        setSessionStatus("initializing");
        try {
            const res = await apiClient(`/academy/labs/${lab.id}/start`, {
                method: 'POST',
                json: { cohort_id: 1 } // Default cohort for now
            });
            setSessionStatus("active");
            // Provisioning simulation (visual only, session is real in DB)
            setTimeout(() => setSessionStatus("ready"), 1500);
        } catch (e) {
            setSessionStatus("error");
            console.error("Lab start failed", e);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 relative z-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.2)]">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Training & Simulation</span>
                    </div>
                    <h1 className="text-display mb-1 text-white uppercase tracking-tighter italic">
                        Cyber <span className="text-orange-400">Academy</span>
                    </h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest max-w-xl opacity-60">
                        Interactive Range for Offensive & Defensive Skill Acquisition.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab('learn')}
                    className={cn(
                        "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                        activeTab === 'learn' ? "text-orange-400" : "text-text-3 hover:text-white"
                    )}
                >
                    <BookOpen className="h-4 w-4 inline-block mr-2 mb-0.5" />
                    Course Catalog
                    {activeTab === 'learn' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('range')}
                    className={cn(
                        "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                        activeTab === 'range' ? "text-orange-400" : "text-text-3 hover:text-white"
                    )}
                >
                    <FlaskConical className="h-4 w-4 inline-block mr-2 mb-0.5" />
                    Live Labs
                    {activeTab === 'range' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400" />}
                </button>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'learn' ? (
                    <motion.div
                        key="learn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6"
                    >
                        {modules.map((mod) => (
                            <div key={mod.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden cursor-pointer">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-12 w-12 text-white" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border",
                                        mod.difficulty === 'Basic' ? "text-green-400 border-green-500/20 bg-green-500/10" :
                                            mod.difficulty === 'Intermediate' ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10" :
                                                "text-red-400 border-red-500/20 bg-red-500/10"
                                    )}>{mod.difficulty}</span>
                                    <Cpu className="h-5 w-5 text-text-3 group-hover:text-orange-400 transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-orange-300 transition-colors">{mod.title}</h3>
                                <p className="text-xs text-text-3 mb-6 line-clamp-2 leading-relaxed">{mod.description}</p>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-text-3 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-orange-500/50" />
                                    {mod.category}
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                    <button className="text-[9px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                        Start Module <Play className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="range"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6"
                    >
                        {/* Lab List */}
                        <div className="lg:col-span-1 space-y-4">
                            {labs.map((lab) => (
                                <div
                                    key={lab.id}
                                    onClick={() => { setSelectedLab(lab); setSessionStatus(null); }}
                                    className={cn(
                                        "p-4 rounded-xl border cursor-pointer transition-all",
                                        selectedLab?.id === lab.id
                                            ? "bg-orange-500/10 border-orange-500/50"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{lab.title}</h4>
                                        {selectedLab?.id === lab.id && <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] font-bold text-text-3 uppercase tracking-widest">
                                        <span>{lab.category}</span>
                                        <span>•</span>
                                        <span className={cn(
                                            lab.difficulty === 'Easy' ? 'text-green-400' : 'text-red-400'
                                        )}>{lab.difficulty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Lab Environment */}
                        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="absolute inset-0 zellige-pattern opacity-5" />

                            {selectedLab ? (
                                sessionStatus === 'ready' ? (
                                    <div className="space-y-6 w-full max-w-md animate-in zoom-in-95 duration-500">
                                        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                                            <Terminal className="h-10 w-10 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Environment Active</h3>
                                            <p className="text-xs text-text-3 font-mono">Target: 10.129.2.15 • VPN: Connected</p>
                                        </div>
                                        <div className="bg-black/80 rounded-xl p-4 text-left font-mono text-[10px] text-green-400 border border-white/10 overflow-hidden relative">
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <div className="h-2 w-2 rounded-full bg-red-500/50" />
                                                <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                                                <div className="h-2 w-2 rounded-full bg-green-500/50" />
                                            </div>
                                            <p>$ nmap -sC -sV 10.129.2.15</p>
                                            <p className="text-text-3">Scanning...</p>
                                        </div>
                                        <button
                                            onClick={() => setSessionStatus(null)}
                                            className="px-8 py-3 bg-red-500/20 border border-red-500/50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/30 transition-all"
                                        >
                                            Terminate Session
                                        </button>
                                    </div>
                                ) : sessionStatus === 'initializing' || sessionStatus === 'active' ? (
                                    <div className="space-y-4">
                                        <Cpu className="h-12 w-12 text-orange-400 animate-spin mx-auto" />
                                        <div className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Provisioning Containers...</div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-lg">
                                        <div>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">{selectedLab.title}</h2>
                                            <p className="text-sm text-text-3 leading-relaxed">{selectedLab.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 justify-center">
                                            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-text-2">
                                                Skill: {selectedLab.category}
                                            </div>
                                            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-text-2">
                                                Time: ~45 mins
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => startLab(selectedLab)}
                                            className="px-10 py-4 bg-orange-500 text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                        >
                                            Initialize Environment
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="opacity-30 space-y-4">
                                    <FlaskConical className="h-16 w-16 mx-auto text-text-3" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Select a Lab to Begin</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
