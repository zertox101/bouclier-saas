"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, CheckCircle2, XCircle, Clock, ChevronDown,
    ChevronRight, User, Bot, Shield, AlertTriangle, Brain,
    FileText, Zap, RotateCcw, SkipForward, Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
type StepType = 'automated' | 'manual' | 'approval';

interface Evidence {
    id: string;
    name: string;
    type: 'screenshot' | 'log' | 'file' | 'note';
    timestamp: string;
}

interface PlaybookStep {
    id: string;
    order: number;
    title: string;
    description: string;
    type: StepType;
    status: StepStatus;
    assignee?: string;
    estimatedDuration: number; // minutes
    actualDuration?: number;
    evidence: Evidence[];
    aiSuggestion?: {
        type: 'skip' | 'modify';
        reasoning: string;
        confidence: number;
    };
}

interface Playbook {
    id: string;
    name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    estimatedTime: number;
    incidentId: string;
    incidentTitle: string;
    steps: PlaybookStep[];
    startedAt?: string;
    completedAt?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAMPLE DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SAMPLE_PLAYBOOK: Playbook = {
    id: "PB-001",
    name: "Phishing Response",
    severity: "high",
    estimatedTime: 23,
    incidentId: "INC-2024-0847",
    incidentTitle: "Credential Harvest Attempt - Finance Department",
    startedAt: "2024-01-15T14:20:00Z",
    steps: [
        {
            id: "step-1",
            order: 1,
            title: "Isolate Affected Endpoint",
            description: "Quarantine the workstation from the network to prevent lateral movement",
            type: "automated",
            status: "completed",
            estimatedDuration: 1,
            actualDuration: 0.2,
            evidence: [
                { id: "e1", name: "isolation_confirmation.log", type: "log", timestamp: "14:20:12" }
            ]
        },
        {
            id: "step-2",
            order: 2,
            title: "Block Sender Domain",
            description: "Add malicious sender domain to email gateway blocklist",
            type: "automated",
            status: "completed",
            estimatedDuration: 1,
            actualDuration: 0.1,
            evidence: [
                { id: "e2", name: "domain_blocked.png", type: "screenshot", timestamp: "14:20:18" }
            ]
        },
        {
            id: "step-3",
            order: 3,
            title: "Extract IOCs from Email",
            description: "Parse email headers, attachments, and links for indicators of compromise",
            type: "automated",
            status: "completed",
            estimatedDuration: 2,
            actualDuration: 1.5,
            evidence: [
                { id: "e3", name: "iocs_extracted.json", type: "file", timestamp: "14:21:45" },
                { id: "e4", name: "mitre_mapping.log", type: "log", timestamp: "14:21:50" }
            ]
        },
        {
            id: "step-4",
            order: 4,
            title: "Interview Affected User",
            description: "Gather context from the user about the incident",
            type: "manual",
            status: "running",
            assignee: "analyst@soc.com",
            estimatedDuration: 10,
            evidence: [],
            aiSuggestion: {
                type: "skip",
                reasoning: "User self-reported within 3 minutes. Standard interview questions already answered in initial report.",
                confidence: 78
            }
        },
        {
            id: "step-5",
            order: 5,
            title: "Reset User Credentials",
            description: "Force password reset and revoke active sessions",
            type: "approval",
            status: "pending",
            estimatedDuration: 2,
            evidence: []
        },
        {
            id: "step-6",
            order: 6,
            title: "Scan for Similar Emails",
            description: "Search email logs for other recipients of same campaign",
            type: "automated",
            status: "pending",
            estimatedDuration: 3,
            evidence: []
        },
        {
            id: "step-7",
            order: 7,
            title: "Update Threat Intelligence",
            description: "Add IOCs to internal threat intel platform",
            type: "automated",
            status: "pending",
            estimatedDuration: 1,
            evidence: []
        },
        {
            id: "step-8",
            order: 8,
            title: "Generate Incident Report",
            description: "Compile findings and remediation steps into final report",
            type: "manual",
            status: "pending",
            estimatedDuration: 5,
            evidence: []
        }
    ]
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const statusConfig: Record<StepStatus, { icon: React.ReactNode; color: string; bg: string }> = {
    pending: {
        icon: <Clock className="w-4 h-4" />,
        color: "text-text-3",
        bg: "bg-white/5"
    },
    running: {
        icon: <Play className="w-4 h-4 animate-pulse" />,
        color: "text-[rgb(var(--neon-1))]",
        bg: "bg-[rgb(var(--neon-1))]/10"
    },
    completed: {
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: "text-[rgb(var(--success))]",
        bg: "bg-[rgb(var(--success))]/10"
    },
    failed: {
        icon: <XCircle className="w-4 h-4" />,
        color: "text-[rgb(var(--danger))]",
        bg: "bg-[rgb(var(--danger))]/10"
    },
    skipped: {
        icon: <SkipForward className="w-4 h-4" />,
        color: "text-text-3",
        bg: "bg-white/5"
    }
};

const typeConfig: Record<StepType, { icon: React.ReactNode; label: string; color: string }> = {
    automated: {
        icon: <Bot className="w-3.5 h-3.5" />,
        label: "AUTO",
        color: "text-[rgb(var(--neon-2))] bg-[rgb(var(--neon-2))]/10 border-[rgb(var(--neon-2))]/30"
    },
    manual: {
        icon: <User className="w-3.5 h-3.5" />,
        label: "MANUAL",
        color: "text-[rgb(var(--neon-4))] bg-[rgb(var(--neon-4))]/10 border-[rgb(var(--neon-4))]/30"
    },
    approval: {
        icon: <Shield className="w-3.5 h-3.5" />,
        label: "APPROVAL",
        color: "text-[rgb(var(--warning))] bg-[rgb(var(--warning))]/10 border-[rgb(var(--warning))]/30"
    }
};

function StepCard({ step, isExpanded, onToggle, onAction }: {
    step: PlaybookStep;
    isExpanded: boolean;
    onToggle: () => void;
    onAction: (action: string) => void;
}) {
    const status = statusConfig[step.status];
    const type = typeConfig[step.type];

    return (
        <motion.div
            layout
            className={cn(
                "relative rounded-xl border transition-all duration-300",
                step.status === 'running' && "border-[rgb(var(--neon-1))]/40 shadow-[0_0_20px_rgba(0,255,170,0.1)]",
                step.status === 'completed' && "border-[rgb(var(--success))]/20",
                step.status === 'failed' && "border-[rgb(var(--danger))]/30",
                step.status === 'pending' && "border-white/10 opacity-60",
                step.status === 'skipped' && "border-white/5 opacity-40"
            )}
        >
            {/* Main Row */}
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center gap-4"
            >
                {/* Status Icon */}
                <div className={cn("p-2 rounded-lg", status.bg, status.color)}>
                    {status.icon}
                </div>

                {/* Step Info */}
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-text-3">Step {step.order}</span>
                        <span className={cn(
                            "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            type.color
                        )}>
                            {type.icon}
                            {type.label}
                        </span>
                        {step.status === 'completed' && step.actualDuration && (
                            <span className="text-[10px] text-text-3">
                                {step.actualDuration < 1 ? `${Math.round(step.actualDuration * 60)}s` : `${step.actualDuration.toFixed(1)}m`}
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm font-bold text-text-1">{step.title}</h3>
                    {step.assignee && (
                        <p className="text-[10px] text-text-3 mt-0.5">Assigned to: {step.assignee}</p>
                    )}
                </div>

                {/* Evidence Count */}
                {step.evidence.length > 0 && (
                    <div className="flex items-center gap-1 text-text-3">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="text-xs">{step.evidence.length}</span>
                    </div>
                )}

                {/* Expand Arrow */}
                <ChevronDown className={cn(
                    "w-4 h-4 text-text-3 transition-transform",
                    isExpanded && "rotate-180"
                )} />
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5">
                            {/* Description */}
                            <p className="text-xs text-text-2 pt-3">{step.description}</p>

                            {/* AI Suggestion */}
                            {step.aiSuggestion && (
                                <div className="p-3 rounded-lg bg-[rgb(var(--neon-4))]/10 border border-[rgb(var(--neon-4))]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-4 h-4 text-[rgb(var(--neon-4))]" />
                                        <span className="text-[10px] font-bold text-[rgb(var(--neon-4))] uppercase">
                                            AI Optimization Available
                                        </span>
                                        <span className="text-[10px] text-text-3">
                                            {step.aiSuggestion.confidence}% confidence
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-2 mb-3">{step.aiSuggestion.reasoning}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onAction('accept-ai')}
                                            className="flex-1 py-2 px-3 rounded-lg bg-[rgb(var(--neon-4))]/20 text-[rgb(var(--neon-4))] text-xs font-bold hover:bg-[rgb(var(--neon-4))]/30 transition-colors"
                                        >
                                            Accept & Skip
                                        </button>
                                        <button
                                            onClick={() => onAction('reject-ai')}
                                            className="flex-1 py-2 px-3 rounded-lg bg-white/5 text-text-2 text-xs font-bold hover:bg-white/10 transition-colors"
                                        >
                                            Continue Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Evidence List */}
                            {step.evidence.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-text-3 uppercase">Evidence Collected</span>
                                    <div className="space-y-1">
                                        {step.evidence.map(e => (
                                            <div
                                                key={e.id}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-text-3" />
                                                <span className="text-xs text-text-1 flex-1">{e.name}</span>
                                                <span className="text-[10px] text-text-3">{e.timestamp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {step.status === 'running' && step.type === 'manual' && (
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => onAction('complete')}
                                        className="flex-1 py-2 px-4 rounded-lg bg-[rgb(var(--success))]/20 text-[rgb(var(--success))] text-xs font-bold hover:bg-[rgb(var(--success))]/30 transition-colors"
                                    >
                                        Mark Complete
                                    </button>
                                    <button
                                        onClick={() => onAction('add-evidence')}
                                        className="py-2 px-4 rounded-lg bg-white/5 text-text-2 text-xs font-bold hover:bg-white/10 transition-colors"
                                    >
                                        Add Evidence
                                    </button>
                                </div>
                            )}

                            {step.status === 'pending' && step.type === 'approval' && (
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => onAction('approve')}
                                        className="flex-1 py-2 px-4 rounded-lg bg-[rgb(var(--neon-1))]/20 text-[rgb(var(--neon-1))] text-xs font-bold hover:bg-[rgb(var(--neon-1))]/30 transition-colors"
                                    >
                                        Approve & Execute
                                    </button>
                                    <button
                                        onClick={() => onAction('reject')}
                                        className="py-2 px-4 rounded-lg bg-[rgb(var(--danger))]/20 text-[rgb(var(--danger))] text-xs font-bold hover:bg-[rgb(var(--danger))]/30 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {step.status === 'failed' && (
                                <button
                                    onClick={() => onAction('retry')}
                                    className="w-full py-2 px-4 rounded-lg bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning))] text-xs font-bold hover:bg-[rgb(var(--warning))]/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Retry Step
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Connection Line */}
            {step.order < 8 && (
                <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-white/10 to-transparent" />
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function PlaybookRunner() {
    const [playbook, setPlaybook] = useState<Playbook>(SAMPLE_PLAYBOOK);

    useEffect(() => {
        apiClient("/api/soc/playbooks/PB-0001")
            .then(d => {
                if (d.playbook) {
                    setPlaybook(prev => ({ ...prev, name: d.playbook.name, status: d.playbook.status === "active" ? "running" : "pending" }));
                }
            })
            .catch(() => {});
    }, []);
    const [expandedStep, setExpandedStep] = useState<string | null>("step-4"); // Auto-expand running step

    // Calculate progress
    const progress = useMemo(() => {
        const completed = playbook.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
        return {
            completed,
            total: playbook.steps.length,
            percentage: Math.round((completed / playbook.steps.length) * 100)
        };
    }, [playbook.steps]);

    // Calculate time stats
    const timeStats = useMemo(() => {
        const actualTime = playbook.steps
            .filter(s => s.actualDuration)
            .reduce((acc, s) => acc + (s.actualDuration || 0), 0);
        const remainingTime = playbook.steps
            .filter(s => s.status === 'pending' || s.status === 'running')
            .reduce((acc, s) => acc + s.estimatedDuration, 0);
        return { actualTime, remainingTime };
    }, [playbook.steps]);

    const handleStepAction = (stepId: string, action: string) => {
        console.log(`Action: ${action} on step: ${stepId}`);
        // In real implementation, this would update state and make API calls
    };

    const severityColors = {
        critical: "text-[rgb(var(--danger))] bg-[rgb(var(--danger))]/10 border-[rgb(var(--danger))]/30",
        high: "text-[rgb(var(--warning))] bg-[rgb(var(--warning))]/10 border-[rgb(var(--warning))]/30",
        medium: "text-[rgb(var(--neon-2))] bg-[rgb(var(--neon-2))]/10 border-[rgb(var(--neon-2))]/30",
        low: "text-text-3 bg-white/5 border-white/10"
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="premium-card p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[rgb(var(--neon-1))]/20 to-[rgb(var(--neon-2))]/10 border border-[rgb(var(--neon-1))]/20">
                            <FileText className="w-6 h-6 text-[rgb(var(--neon-1))]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-[rgb(var(--neon-2))]">{playbook.id}</span>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase",
                                    severityColors[playbook.severity]
                                )}>
                                    {playbook.severity}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-text-1">{playbook.name}</h1>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-text-3 mb-1">Estimated Time</p>
                        <p className="text-lg font-bold text-text-1">{playbook.estimatedTime} min</p>
                    </div>
                </div>

                {/* Incident Info */}
                <div className="p-3 rounded-lg bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20 mb-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[rgb(var(--danger))]" />
                        <span className="text-xs font-mono text-[rgb(var(--danger))]">{playbook.incidentId}</span>
                    </div>
                    <p className="text-sm text-text-1 mt-1">{playbook.incidentTitle}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-text-3">Progress</span>
                        <span className="font-bold text-text-1">
                            {progress.completed}/{progress.total} Steps Complete
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[rgb(var(--neon-1))] to-[rgb(var(--neon-2))]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-3">
                        <span>Time elapsed: {timeStats.actualTime.toFixed(1)} min</span>
                        <span>Estimated remaining: {timeStats.remainingTime} min</span>
                    </div>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-4">
                {playbook.steps.map(step => (
                    <StepCard
                        key={step.id}
                        step={step}
                        isExpanded={expandedStep === step.id}
                        onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        onAction={(action) => handleStepAction(step.id, action)}
                    />
                ))}
            </div>
        </div>
    );
}
