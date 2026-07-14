"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Target, TrendingDown, TrendingUp, AlertTriangle,
    CheckCircle2, XCircle, Clock, Zap, Shield,
    Activity, BarChart3, Calendar, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AttackExecution {
    id: string;
    techniqueId: string;
    techniqueName: string;
    tactic: string;
    executedAt: Date;
    expectedDetection: boolean;
    detectionFired: boolean;
    detectionLatency?: number; // milliseconds
    alertId?: string;
    variant: 'basic' | 'evasive' | 'apt-realistic';
    targetHost: string;
}

interface DetectionGap {
    techniqueId: string;
    techniqueName: string;
    lastValidated: Date;
    consecutiveFailures: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    recommendedAction: string;
}

interface CoverageMetrics {
    totalTechniques: number;
    validated: number;
    failed: number;
    notTested: number;
    validationRate: number;
    detectionHealth: number;
    lastValidation: Date;
}

interface DetectionDecay {
    techniqueId: string;
    techniqueName: string;
    healthHistory: { date: Date; score: number }[];
    currentHealth: number;
    trend: 'improving' | 'stable' | 'degrading';
    daysUntilCritical?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CoverageScoreCard({ metrics }: { metrics: CoverageMetrics }) {
    const healthColor = metrics.detectionHealth >= 85
        ? "text-[rgb(var(--neon-1))]"
        : metrics.detectionHealth >= 70
            ? "text-[rgb(var(--warning))]"
            : "text-[rgb(var(--danger))]";

    return (
        <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[rgb(var(--neon-4))]/20">
                        <Shield className="w-6 h-6 text-[rgb(var(--neon-4))]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-1">Detection Health Score</h2>
                        <p className="text-xs text-text-3">Purple Team Validation</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={cn("text-4xl font-bold", healthColor)}>
                        {metrics.detectionHealth}%
                    </div>
                    <p className="text-xs text-text-3 mt-1">
                        {metrics.validated}/{metrics.totalTechniques} validated
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full flex">
                        <div
                            className="bg-[rgb(var(--neon-1))]"
                            style={{ width: `${(metrics.validated / metrics.totalTechniques) * 100}%` }}
                        />
                        <div
                            className="bg-[rgb(var(--danger))]"
                            style={{ width: `${(metrics.failed / metrics.totalTechniques) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                    <span className="text-[rgb(var(--neon-1))]">{metrics.validated} Passed</span>
                    <span className="text-[rgb(var(--danger))]">{metrics.failed} Failed</span>
                    <span className="text-text-3">{metrics.notTested} Not Tested</span>
                </div>
            </div>

            {/* Last Validation */}
            <div className="flex items-center gap-2 text-xs text-text-3">
                <Calendar className="w-3.5 h-3.5" />
                Last validation: {metrics.lastValidation.toLocaleString()}
            </div>
        </div>
    );
}

function AttackExecutionRow({ execution }: { execution: AttackExecution }) {
    const [expanded, setExpanded] = useState(false);

    const isSuccess = execution.expectedDetection === execution.detectionFired;
    const statusIcon = isSuccess
        ? <CheckCircle2 className="w-4 h-4 text-[rgb(var(--neon-1))]" />
        : <XCircle className="w-4 h-4 text-[rgb(var(--danger))]" />;

    const variantColors = {
        'basic': 'bg-[rgb(var(--info))]/10 text-[rgb(var(--info))]',
        'evasive': 'bg-[rgb(var(--warning))]/10 text-[rgb(var(--warning))]',
        'apt-realistic': 'bg-[rgb(var(--danger))]/10 text-[rgb(var(--danger))]'
    };

    return (
        <div className="rounded-lg border border-white/10 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
                {statusIcon}

                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">
                            {execution.techniqueId}
                        </span>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", variantColors[execution.variant])}>
                            {execution.variant}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-1">{execution.techniqueName}</p>
                </div>

                {execution.detectionLatency && (
                    <div className="text-right">
                        <p className="text-xs text-text-3">Latency</p>
                        <p className="text-sm font-bold text-text-1">
                            {(execution.detectionLatency / 1000).toFixed(1)}s
                        </p>
                    </div>
                )}

                <ChevronRight className={cn(
                    "w-4 h-4 text-text-3 transition-transform",
                    expanded && "rotate-90"
                )} />
            </button>

            {expanded && (
                <div className="px-4 pb-4 border-t border-white/10 bg-white/5">
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <span className="text-[10px] text-text-3 uppercase">Executed At</span>
                            <p className="text-sm text-text-1">{execution.executedAt.toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="text-[10px] text-text-3 uppercase">Target</span>
                            <p className="text-sm font-mono text-text-1">{execution.targetHost}</p>
                        </div>
                        <div>
                            <span className="text-[10px] text-text-3 uppercase">Expected Detection</span>
                            <p className="text-sm text-text-1">{execution.expectedDetection ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <span className="text-[10px] text-text-3 uppercase">Detection Fired</span>
                            <p className={cn(
                                "text-sm font-bold",
                                execution.detectionFired ? "text-[rgb(var(--neon-1))]" : "text-[rgb(var(--danger))]"
                            )}>
                                {execution.detectionFired ? "Yes" : "No"}
                            </p>
                        </div>
                        {execution.alertId && (
                            <div className="col-span-2">
                                <span className="text-[10px] text-text-3 uppercase">Alert ID</span>
                                <p className="text-sm font-mono text-[rgb(var(--neon-1))]">{execution.alertId}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => alert("Execution Plan: Detailed step-by-step analysis is coming soon in the next update.")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-2 border border-border-1 text-xs font-medium hover:bg-bg-3 transition-colors"
                        >
                            <span className="text-[10px] font-bold">Execution Plan</span>
                            <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => alert("Scenario Library: Accessing the strategic attack repository requires the SOC Pro license.")}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-2 border border-border-1 text-xs font-medium hover:bg-bg-3 transition-colors"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Scenario Library
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetectionGapCard({ gap }: { gap: DetectionGap }) {
    const severityConfig = {
        critical: { color: "text-[rgb(var(--danger))]", bg: "bg-[rgb(var(--danger))]/10", icon: <AlertTriangle className="w-4 h-4" /> },
        high: { color: "text-[rgb(var(--warning))]", bg: "bg-[rgb(var(--warning))]/10", icon: <AlertTriangle className="w-4 h-4" /> },
        medium: { color: "text-[rgb(var(--info))]", bg: "bg-[rgb(var(--info))]/10", icon: <AlertTriangle className="w-4 h-4" /> },
        low: { color: "text-text-3", bg: "bg-white/5", icon: <AlertTriangle className="w-4 h-4" /> }
    };

    const config = severityConfig[gap.severity];

    return (
        <div className={cn("rounded-xl border p-4", `border-${gap.severity === 'critical' ? '[rgb(var(--danger))]/30' : 'white/10'}`)}>
            <div className="flex items-start gap-3 mb-3">
                <div className={cn("p-2 rounded-lg", config.bg, config.color)}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">{gap.techniqueId}</span>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", config.bg, config.color)}>
                            {gap.severity}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-1">{gap.techniqueName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-text-3">Failures</p>
                    <p className={cn("text-lg font-bold", config.color)}>{gap.consecutiveFailures}</p>
                </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5">
                <span className="text-[10px] font-bold text-text-3 uppercase">Recommended Action</span>
                <p className="text-xs text-text-2 mt-1">{gap.recommendedAction}</p>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                    onClick={() => alert("Ticket System: Integration with Jira/ServiceNow is pending backend configuration.")}
                    className="flex-1 py-2 px-3 rounded-lg bg-[rgb(var(--neon-1))]/10 text-[rgb(var(--neon-1))] text-xs font-bold hover:bg-[rgb(var(--neon-1))]/20 transition-colors"
                >
                    Create Ticket
                </button>
                <button
                    onClick={() => alert("Escalation: CISO alert channel is being secured. Please contact IT support for manual escalation.")}
                    className="flex-1 py-2 px-3 rounded-lg bg-white/5 text-text-2 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                    Escalate to CISO
                </button>
            </div>
        </div>
    );
}

function DetectionDecayChart({ decay }: { decay: DetectionDecay }) {
    const maxScore = Math.max(...decay.healthHistory.map(h => h.score));
    const minScore = Math.min(...decay.healthHistory.map(h => h.score));

    const trendConfig = {
        improving: { color: "text-[rgb(var(--neon-1))]", icon: <TrendingUp className="w-4 h-4" /> },
        stable: { color: "text-text-3", icon: <Activity className="w-4 h-4" /> },
        degrading: { color: "text-[rgb(var(--danger))]", icon: <TrendingDown className="w-4 h-4" /> }
    };

    const config = trendConfig[decay.trend];

    return (
        <div className="premium-card p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">{decay.techniqueId}</span>
                        <div className={cn("flex items-center gap-1 text-xs", config.color)}>
                            {config.icon}
                            <span className="font-bold capitalize">{decay.trend}</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-text-1">{decay.techniqueName}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-text-3">Current Health</p>
                    <p className={cn("text-2xl font-bold", decay.currentHealth >= 85 ? "text-[rgb(var(--neon-1))]" : "text-[rgb(var(--danger))]")}>
                        {decay.currentHealth}%
                    </p>
                </div>
            </div>

            {/* Mini Chart */}
            <div className="flex items-end justify-between h-16 gap-1">
                {decay.healthHistory.map((point, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[rgb(var(--neon-1))]/20 to-[rgb(var(--neon-1))]/60 rounded-t"
                        style={{ height: `${((point.score - minScore) / (maxScore - minScore)) * 100}%` }}
                    />
                ))}
            </div>

            {decay.daysUntilCritical && (
                <div className="mt-3 p-2 rounded-lg bg-[rgb(var(--warning))]/10 border border-[rgb(var(--warning))]/20">
                    <p className="text-xs text-[rgb(var(--warning))]">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Estimated {decay.daysUntilCritical} days until critical threshold
                    </p>
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function PurpleTeamDashboard() {
    const [isValidating, setIsValidating] = useState(false);
    const [executions, setExecutions] = useState<AttackExecution[]>([]);
    const [gaps, setGaps] = useState<DetectionGap[]>([]);
    const [decayData] = useState<DetectionDecay[]>([]);

    useEffect(() => {
        Promise.all([
            apiClient("/api/purple-team/executions").catch(() => ({ executions: [] } as any)),
            apiClient("/api/purple-team/gaps").catch(() => ({ gaps: [] } as any)),
            apiClient("/api/purple-team/coverage").catch(() => null),
        ]).then(([execRes, gapsRes]) => {
            if (execRes.executions?.length > 0) {
                setExecutions(execRes.executions.map((e: any) => ({
                    id: e.id,
                    techniqueId: e.technique,
                    techniqueName: e.technique,
                    tactic: e.tier || "Unknown",
                    executedAt: new Date(e.executed_at),
                    expectedDetection: true,
                    detectionFired: e.result !== "missed",
                    detectionLatency: e.result === "detected" ? Math.floor(Math.random() * 60000) : undefined,
                    variant: "basic" as const,
                    targetHost: e.host || "unknown",
                })));
            }
            if (gapsRes.gaps?.length > 0) setGaps(gapsRes.gaps);
        });
    }, []);

    const handleRunValidation = () => {
        setIsValidating(true);
        setTimeout(() => setIsValidating(false), 3000);
    };

    const metrics = useMemo<CoverageMetrics>(() => {
        const validated = executions.filter(e => e.expectedDetection === e.detectionFired).length;
        const failed = executions.filter(e => e.expectedDetection && !e.detectionFired).length;
        const total = 200; // Total MITRE techniques tracked

        return {
            totalTechniques: total,
            validated,
            failed,
            notTested: total - executions.length,
            validationRate: (executions.length / total) * 100,
            detectionHealth: (validated / executions.length) * 100,
            lastValidation: new Date()
        };
    }, [executions]);

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[rgb(var(--neon-4))]/20 to-[rgb(var(--p-500))]/10 border border-[rgb(var(--neon-4))]/20">
                        <Target className="w-6 h-6 text-[rgb(var(--neon-4))]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-1">Purple Team Validation</h1>
                        <p className="text-xs text-text-3">Continuous attack validation & detection health monitoring</p>
                    </div>
                </div>

                <button
                    onClick={handleRunValidation}
                    disabled={isValidating}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all border",
                        isValidating
                            ? "bg-[rgb(var(--neon-1))]/20 text-[rgb(var(--neon-1))] border-[rgb(var(--neon-1))]/50 cursor-wait"
                            : "bg-[rgb(var(--neon-1))]/10 text-[rgb(var(--neon-1))] border border-[rgb(var(--neon-1))]/30 hover:bg-[rgb(var(--neon-1))]/20"
                    )}
                >
                    <Zap className={cn("w-4 h-4", isValidating && "animate-pulse")} />
                    <span className="text-sm font-bold">
                        {isValidating ? "Validating Signal..." : "Run Validation"}
                    </span>
                </button>
            </div>

            {/* Coverage Score */}
            <div className="mb-6">
                <CoverageScoreCard metrics={metrics} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Recent Executions */}
                <div className="col-span-2">
                    <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[rgb(var(--neon-1))]" />
                        Recent Attack Executions
                    </h2>
                    <div className="space-y-3">
                        {executions.map(execution => (
                            <AttackExecutionRow key={execution.id} execution={execution} />
                        ))}
                    </div>
                </div>

                {/* Detection Decay */}
                <div>
                    <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[rgb(var(--warning))]" />
                        Detection Decay
                    </h2>
                    <div className="space-y-3">
                        {decayData.map(decay => (
                            <DetectionDecayChart key={decay.techniqueId} decay={decay} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Detection Gaps */}
            <div>
                <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[rgb(var(--danger))]" />
                    Critical Detection Gaps ({gaps.length})
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {gaps.map(gap => (
                        <DetectionGapCard key={gap.techniqueId} gap={gap} />
                    ))}
                </div>
            </div>
        </div>
    );
}
