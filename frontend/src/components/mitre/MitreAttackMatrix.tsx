"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Brain, AlertTriangle, CheckCircle2,
    Activity, ChevronRight, X, ExternalLink,
    Target, Crosshair, TrendingUp, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type TechniqueState = 'clean' | 'detected' | 'active' | 'blocked' | 'historical';

interface TechniqueNode {
    id: string;
    name: string;
    tactic: string;
    state: TechniqueState;
    confidence: number;
    eventCount: number;
    lastSeen?: string;
    linkedIncident?: string;
    description?: string;
    aiPrediction?: {
        nextTechnique: string;
        nextTechniqueName: string;
        probability: number;
        reasoning: string;
    };
}

interface AttackPath {
    id: string;
    techniques: string[];
    confidence: number;
    aptMatch?: {
        name: string;
        probability: number;
    };
}

interface AIInsight {
    aptMatch: { name: string; probability: number } | null;
    killChainStage: { current: number; total: number; name: string };
    nextPrediction: { technique: string; name: string; probability: number; reasoning: string } | null;
    recommendedAction: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MITRE ATT&CK TACTICS (14 Columns)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TACTICS = [
    { id: "reconnaissance", name: "Recon", shortName: "REC" },
    { id: "resource-development", name: "Resource Dev", shortName: "RES" },
    { id: "initial-access", name: "Initial Access", shortName: "IA" },
    { id: "execution", name: "Execution", shortName: "EXE" },
    { id: "persistence", name: "Persistence", shortName: "PER" },
    { id: "privilege-escalation", name: "Priv Esc", shortName: "PE" },
    { id: "defense-evasion", name: "Defense Evasion", shortName: "DE" },
    { id: "credential-access", name: "Cred Access", shortName: "CA" },
    { id: "discovery", name: "Discovery", shortName: "DIS" },
    { id: "lateral-movement", name: "Lateral Move", shortName: "LM" },
    { id: "collection", name: "Collection", shortName: "COL" },
    { id: "command-control", name: "C2", shortName: "C2" },
    { id: "exfiltration", name: "Exfil", shortName: "EXF" },
    { id: "impact", name: "Impact", shortName: "IMP" }
];

const SAMPLE_TECHNIQUES: TechniqueNode[] = [
    { id: "T1595", name: "Active Scanning", tactic: "reconnaissance", state: "detected", confidence: 85, eventCount: 12 },
    { id: "T1583", name: "Acquire Infrastructure", tactic: "resource-development", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1566", name: "Phishing", tactic: "initial-access", state: "active", confidence: 94, eventCount: 3, linkedIncident: "INC-2024-0847", lastSeen: "2 min ago" },
    { id: "T1566.001", name: "Spearphishing Attachment", tactic: "initial-access", state: "active", confidence: 92, eventCount: 2 },
    { id: "T1059", name: "Command Line", tactic: "execution", state: "active", confidence: 88, eventCount: 7, lastSeen: "5 min ago" },
    { id: "T1059.001", name: "PowerShell", tactic: "execution", state: "detected", confidence: 76, eventCount: 4 },
    { id: "T1547", name: "Boot/Autostart", tactic: "persistence", state: "detected", confidence: 65, eventCount: 2 },
    { id: "T1548", name: "Abuse Elevation", tactic: "privilege-escalation", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1562", name: "Impair Defenses", tactic: "defense-evasion", state: "blocked", confidence: 95, eventCount: 1 },
    { id: "T1003", name: "OS Credential Dumping", tactic: "credential-access", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1082", name: "System Info Discovery", tactic: "discovery", state: "detected", confidence: 72, eventCount: 5 },
    { id: "T1021", name: "Remote Services", tactic: "lateral-movement", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1005", name: "Data from Local System", tactic: "collection", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1071", name: "Application Layer Protocol", tactic: "command-control", state: "detected", confidence: 68, eventCount: 8 },
    { id: "T1041", name: "Exfil Over C2", tactic: "exfiltration", state: "clean", confidence: 0, eventCount: 0 },
    { id: "T1486", name: "Data Encrypted for Impact", tactic: "impact", state: "clean", confidence: 0, eventCount: 0 }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const stateConfig: Record<TechniqueState, { color: string; glow: string; icon: React.ReactNode; label: string }> = {
    clean: {
        color: "bg-[rgb(var(--bg-2))]/60",
        glow: "",
        icon: <div className="w-2 h-2 rounded-full bg-white/20" />,
        label: "No Detection"
    },
    detected: {
        color: "bg-[rgb(var(--warning))]/15 border-[rgb(var(--warning))]/30",
        glow: "shadow-[0_0_12px_rgba(255,190,0,0.2)]",
        icon: <div className="w-2 h-2 rounded-full bg-[rgb(var(--warning))] animate-pulse" />,
        label: "Detected"
    },
    active: {
        color: "bg-[rgb(var(--danger))]/20 border-[rgb(var(--danger))]/40",
        glow: "shadow-[0_0_20px_rgba(255,60,90,0.3)] animate-pulse",
        icon: <AlertTriangle className="w-3 h-3 text-[rgb(var(--danger))]" />,
        label: "Active Threat"
    },
    blocked: {
        color: "bg-[rgb(var(--neon-1))]/10 border-[rgb(var(--neon-1))]/30",
        glow: "shadow-[0_0_12px_rgba(0,255,170,0.2)]",
        icon: <CheckCircle2 className="w-3 h-3 text-[rgb(var(--neon-1))]" />,
        label: "Blocked"
    },
    historical: {
        color: "bg-[rgb(var(--neon-4))]/10 border-[rgb(var(--neon-4))]/20",
        glow: "",
        icon: <Clock className="w-3 h-3 text-[rgb(var(--neon-4))]/60" />,
        label: "Historical"
    }
};

function TechniqueCard({ technique, onClick }: { technique: TechniqueNode; onClick: () => void }) {
    const config = stateConfig[technique.state];

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "w-full p-2 rounded-lg border transition-all duration-300",
                "hover:scale-[1.02] hover:brightness-110",
                config.color,
                config.glow,
                technique.state !== 'clean' && "border"
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-2 mb-1">
                {config.icon}
                <span className="text-[9px] font-mono text-[rgb(var(--neon-2))] opacity-80">
                    {technique.id}
                </span>
            </div>
            <p className="text-[10px] font-medium text-text-1 text-left truncate">
                {technique.name}
            </p>
            {technique.eventCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    <Activity className="w-2.5 h-2.5 text-[rgb(var(--neon-1))]" />
                    <span className="text-[8px] text-text-3">{technique.eventCount} events</span>
                </div>
            )}
        </motion.button>
    );
}

function AIInsightPanel({ insight }: { insight: AIInsight }) {
    return (
        <div className="premium-card p-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[rgb(var(--neon-4))]/20">
                    <Brain className="w-4 h-4 text-[rgb(var(--neon-4))]" />
                </div>
                <span className="text-xs font-bold text-text-1 uppercase tracking-wider">
                    Sentinel AI Analysis
                </span>
            </div>

            {/* APT Match */}
            {insight.aptMatch && (
                <div className="p-3 rounded-lg bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[rgb(var(--danger))] uppercase">
                            APT Match Detected
                        </span>
                        <span className="text-xs font-mono text-[rgb(var(--danger))]">
                            {insight.aptMatch.probability}%
                        </span>
                    </div>
                    <p className="text-sm font-bold text-text-1">{insight.aptMatch.name}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-[rgb(var(--danger))]/20 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[rgb(var(--danger))] to-[rgb(var(--warning))]"
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.aptMatch.probability}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {/* Kill Chain Stage */}
            <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-text-3 uppercase">Kill Chain Position</span>
                    <span className="text-xs font-mono text-[rgb(var(--neon-1))]">
                        {insight.killChainStage.current}/{insight.killChainStage.total}
                    </span>
                </div>
                <p className="text-sm font-medium text-text-1">{insight.killChainStage.name}</p>
                <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: insight.killChainStage.total }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors",
                                i < insight.killChainStage.current
                                    ? "bg-[rgb(var(--neon-1))]"
                                    : "bg-white/10"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Next Prediction */}
            {insight.nextPrediction && (
                <div className="p-3 rounded-lg bg-[rgb(var(--neon-4))]/10 border border-[rgb(var(--neon-4))]/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-[rgb(var(--neon-4))]" />
                        <span className="text-[10px] font-bold text-[rgb(var(--neon-4))] uppercase">
                            Predicted Next Move
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">
                            {insight.nextPrediction.technique}
                        </span>
                        <span className="text-xs text-text-1">{insight.nextPrediction.name}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-text-3 leading-relaxed">
                        {insight.nextPrediction.reasoning}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9px] text-text-3">Confidence:</span>
                        <span className="text-xs font-bold text-[rgb(var(--neon-4))]">
                            {insight.nextPrediction.probability}%
                        </span>
                    </div>
                </div>
            )}

            {/* Recommended Action */}
            <div className="p-3 rounded-lg bg-[rgb(var(--neon-1))]/10 border border-[rgb(var(--neon-1))]/20">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-[rgb(var(--neon-1))]" />
                    <span className="text-[10px] font-bold text-[rgb(var(--neon-1))] uppercase">
                        Recommended Action
                    </span>
                </div>
                <p className="text-xs text-text-1">{insight.recommendedAction}</p>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MitreAttackMatrix() {
    const [techniques, setTechniques] = useState<TechniqueNode[]>(SAMPLE_TECHNIQUES);
    const [selectedTechnique, setSelectedTechnique] = useState<TechniqueNode | null>(null);
    const [showAIPanel, setShowAIPanel] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMitre = async () => {
            try {
                const data = await apiClient("/api/mitre/techniques");
                if (data.techniques?.length > 0) {
                    setTechniques(data.techniques.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        tactic: t.tactic?.toLowerCase().replace(/\s+/g, "-"),
                        state: t.state || "clean",
                        confidence: t.confidence || 0,
                        eventCount: t.event_count || 0,
                        linkedIncident: t.linked_incidents > 0 ? `INC-${t.linked_incidents}` : undefined,
                        lastSeen: t.last_detected ? new Date(t.last_detected).toLocaleDateString() : undefined,
                    })));
                }
            } catch (err) {
                console.error("Failed to load live MITRE techniques:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMitre();
        const interval = setInterval(fetchMitre, 8000);
        return () => clearInterval(interval);
    }, []);

    // Group techniques by tactic
    const techniquesByTactic = useMemo(() => {
        const grouped: Record<string, TechniqueNode[]> = {};
        TACTICS.forEach(t => { grouped[t.id] = []; });
        techniques.forEach(tech => {
            if (grouped[tech.tactic]) {
                grouped[tech.tactic].push(tech);
            }
        });
        return grouped;
    }, [techniques]);

    // Calculate stats
    const stats = useMemo(() => {
        const active = techniques.filter(t => t.state === 'active').length;
        const detected = techniques.filter(t => t.state === 'detected').length;
        const blocked = techniques.filter(t => t.state === 'blocked').length;
        return { active, detected, blocked };
    }, [techniques]);

    // Sample AI insight
    const aiInsight: AIInsight = {
        aptMatch: { name: "APT29 (Cozy Bear)", probability: 87 },
        killChainStage: { current: 4, total: 14, name: "Execution Phase" },
        nextPrediction: {
            technique: "T1021.001",
            name: "Remote Desktop Protocol",
            probability: 73,
            reasoning: "Based on historical APT29 patterns and current lateral movement indicators detected in the environment."
        },
        recommendedAction: "Immediately block RDP access on affected hosts and rotate credentials for compromised accounts."
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[rgb(var(--danger))]/20 to-[rgb(var(--warning))]/10 border border-[rgb(var(--danger))]/20">
                        <Crosshair className="w-6 h-6 text-[rgb(var(--danger))]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-1">MITRE ATT&CK Navigator</h1>
                        <p className="text-xs text-text-3">Real-time threat technique mapping & kill chain analysis</p>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--danger))] animate-pulse" />
                        <span className="text-sm font-bold text-[rgb(var(--danger))]">{stats.active} Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--warning))]" />
                        <span className="text-sm font-medium text-[rgb(var(--warning))]">{stats.detected} Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--neon-1))]" />
                        <span className="text-sm font-medium text-[rgb(var(--neon-1))]">{stats.blocked} Blocked</span>
                    </div>
                    <button
                        onClick={() => setShowAIPanel(!showAIPanel)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                            showAIPanel
                                ? "bg-[rgb(var(--neon-4))]/20 border-[rgb(var(--neon-4))]/30 text-[rgb(var(--neon-4))]"
                                : "bg-white/5 border-white/10 text-text-3"
                        )}
                    >
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">AI Insights</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Matrix Grid */}
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <div className="premium-card p-4">
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${TACTICS.length}, minmax(100px, 1fr))` }}>
                            {/* Tactic Headers */}
                            {TACTICS.map((tactic, index) => (
                                <div
                                    key={tactic.id}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-center"
                                >
                                    <span className="text-[8px] font-mono text-[rgb(var(--neon-2))] opacity-60">
                                        {index + 1}
                                    </span>
                                    <p className="text-[10px] font-bold text-text-1 uppercase mt-0.5">
                                        {tactic.shortName}
                                    </p>
                                    <p className="text-[8px] text-text-3 truncate">{tactic.name}</p>
                                </div>
                            ))}

                            {/* Technique Nodes */}
                            {TACTICS.map(tactic => (
                                <div key={tactic.id} className="space-y-2">
                                    {techniquesByTactic[tactic.id].map(technique => (
                                        <TechniqueCard
                                            key={technique.id}
                                            technique={technique}
                                            onClick={() => setSelectedTechnique(technique)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Insights Panel */}
                <AnimatePresence>
                    {showAIPanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="shrink-0"
                        >
                            <AIInsightPanel insight={aiInsight} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Technique Detail Modal */}
            <AnimatePresence>
                {selectedTechnique && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedTechnique(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="premium-card p-6 max-w-md w-full mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">
                                            {selectedTechnique.id}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase",
                                            stateConfig[selectedTechnique.state].color
                                        )}>
                                            {stateConfig[selectedTechnique.state].label}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-1">{selectedTechnique.name}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedTechnique(null)}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-3" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <span className="text-[10px] text-text-3 uppercase">Confidence</span>
                                        <p className="text-lg font-bold text-text-1">{selectedTechnique.confidence}%</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5">
                                        <span className="text-[10px] text-text-3 uppercase">Events</span>
                                        <p className="text-lg font-bold text-text-1">{selectedTechnique.eventCount}</p>
                                    </div>
                                </div>

                                {selectedTechnique.linkedIncident && (
                                    <div className="p-3 rounded-lg bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20">
                                        <span className="text-[10px] text-text-3 uppercase">Linked Incident</span>
                                        <p className="text-sm font-mono text-[rgb(var(--danger))]">
                                            {selectedTechnique.linkedIncident}
                                        </p>
                                    </div>
                                )}

                                <a
                                    href={`https://attack.mitre.org/techniques/${selectedTechnique.id.replace('.', '/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-[rgb(var(--neon-2))] hover:underline"
                                >
                                    View on MITRE ATT&CK <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
