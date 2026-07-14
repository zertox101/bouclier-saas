"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertOctagon, Shield, CheckCircle2, XCircle, Clock,
    AlertTriangle, ChevronRight, Zap, User, Bot, Scale,
    FileText, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useAutomationSafety,
    ApprovalRequest,
    ActionRisk
} from "@/lib/automationSafety";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMERGENCY STOP BUTTON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function EmergencyStopButton() {
    const { emergencyStop, automationEnabled } = useAutomationSafety();
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (!automationEnabled) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--danger))]/20 border border-[rgb(var(--danger))]/30">
                <AlertOctagon className="w-5 h-5 text-[rgb(var(--danger))]" />
                <span className="text-sm font-bold text-[rgb(var(--danger))]">
                    AUTOMATION STOPPED
                </span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setConfirmOpen(true)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    "bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/30",
                    "hover:bg-[rgb(var(--danger))]/20 hover:border-[rgb(var(--danger))]/50",
                    "text-[rgb(var(--danger))]"
                )}
            >
                <AlertOctagon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Emergency Stop</span>
            </button>

            <AnimatePresence>
                {confirmOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-[rgb(var(--bg-1))] border border-[rgb(var(--danger))]/30 rounded-2xl p-6 max-w-md w-full mx-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-[rgb(var(--danger))]/20">
                                    <AlertOctagon className="w-8 h-8 text-[rgb(var(--danger))]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-1">Confirm Emergency Stop</h2>
                                    <p className="text-sm text-text-3">This will halt ALL automated actions</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20 mb-4">
                                <p className="text-sm text-text-2">
                                    <strong>Warning:</strong> This action will:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-text-3">
                                    <li>• Stop all running playbook automation</li>
                                    <li>• Expire all pending approvals</li>
                                    <li>• Disable AI-driven actions</li>
                                    <li>• Require manual re-enablement</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmOpen(false)}
                                    className="flex-1 py-3 rounded-lg bg-white/5 text-text-2 font-bold text-sm hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        emergencyStop();
                                        setConfirmOpen(false);
                                    }}
                                    className="flex-1 py-3 rounded-lg bg-[rgb(var(--danger))] text-white font-bold text-sm hover:bg-[rgb(var(--danger))]/90 transition-colors"
                                >
                                    STOP ALL AUTOMATION
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APPROVAL REQUEST CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const riskConfig: Record<ActionRisk, { color: string; bg: string; icon: React.ReactNode }> = {
    safe: {
        color: "text-[rgb(var(--neon-1))]",
        bg: "bg-[rgb(var(--neon-1))]/10",
        icon: <CheckCircle2 className="w-4 h-4" />
    },
    low: {
        color: "text-[rgb(var(--info))]",
        bg: "bg-[rgb(var(--info))]/10",
        icon: <Shield className="w-4 h-4" />
    },
    medium: {
        color: "text-[rgb(var(--warning))]",
        bg: "bg-[rgb(var(--warning))]/10",
        icon: <AlertTriangle className="w-4 h-4" />
    },
    high: {
        color: "text-[rgb(var(--danger))]",
        bg: "bg-[rgb(var(--danger))]/10",
        icon: <AlertOctagon className="w-4 h-4" />
    },
    critical: {
        color: "text-[rgb(var(--danger))]",
        bg: "bg-[rgb(var(--danger))]/20",
        icon: <AlertOctagon className="w-4 h-4 animate-pulse" />
    }
};

function ApprovalRequestCard({ request, onApprove, onReject }: {
    request: ApprovalRequest;
    onApprove: (justification: string) => void;
    onReject: (reason: string) => void;
}) {
    const [justification, setJustification] = useState("");
    const [showDetails, setShowDetails] = useState(false);

    const risk = riskConfig[request.action.risk];
    const expiresIn = Math.max(0, Math.floor(
        (request.action.expiresAt.getTime() - Date.now()) / 60000
    ));

    return (
        <div className={cn(
            "rounded-xl border p-4 transition-all",
            request.action.risk === 'critical'
                ? "border-[rgb(var(--danger))]/40 bg-[rgb(var(--danger))]/5"
                : "border-white/10 bg-white/5"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", risk.bg, risk.color)}>
                        {risk.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", risk.bg, risk.color)}>
                                {request.action.risk} Risk
                            </span>
                            {request.action.source === 'ai' && (
                                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[rgb(var(--neon-4))]/20 text-[rgb(var(--neon-4))]">
                                    <Bot className="w-3 h-3" />
                                    AI
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-bold text-text-1 mt-1">
                            {request.action.description}
                        </h3>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-1 text-text-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{expiresIn}m</span>
                    </div>
                </div>
            </div>

            {/* Target */}
            <div className="p-3 rounded-lg bg-white/5 mb-3">
                <span className="text-[10px] font-bold text-text-3 uppercase">Target</span>
                <p className="text-sm font-mono text-text-1 mt-0.5">{request.action.target}</p>
            </div>

            {/* Expandable Details */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs text-text-3 hover:text-text-2 transition-colors mb-3"
            >
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showDetails && "rotate-90")} />
                {showDetails ? "Hide" : "Show"} Details
            </button>

            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3"
                    >
                        <div className="space-y-2 p-3 rounded-lg bg-white/5">
                            <div className="flex justify-between text-xs">
                                <span className="text-text-3">Requested by:</span>
                                <span className="text-text-1">{request.action.requestedBy}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-text-3">Source:</span>
                                <span className="text-text-1 capitalize">{request.action.source}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-text-3">Reversible:</span>
                                <span className={request.action.reversible ? "text-[rgb(var(--neon-1))]" : "text-[rgb(var(--danger))]"}>
                                    {request.action.reversible ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-text-3">Est. Impact:</span>
                                <span className="text-text-1">{request.action.estimatedImpact}</span>
                            </div>
                            {request.action.rollbackProcedure && (
                                <div className="pt-2 border-t border-white/10">
                                    <span className="text-[10px] text-text-3 uppercase">Rollback Procedure</span>
                                    <p className="text-xs text-text-2 mt-1">{request.action.rollbackProcedure}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Justification Input */}
            <div className="mb-3">
                <label className="text-[10px] font-bold text-text-3 uppercase mb-1 block">
                    Justification (Required)
                </label>
                <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explain why this action should be approved..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-text-1 placeholder:text-text-3/50 focus:outline-none focus:border-[rgb(var(--neon-1))]/30 resize-none"
                    rows={2}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => onReject("Rejected by analyst")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[rgb(var(--danger))]/10 text-[rgb(var(--danger))] font-bold text-sm hover:bg-[rgb(var(--danger))]/20 transition-colors"
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <button
                    onClick={() => onApprove(justification)}
                    disabled={!justification.trim()}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-colors",
                        justification.trim()
                            ? "bg-[rgb(var(--neon-1))]/20 text-[rgb(var(--neon-1))] hover:bg-[rgb(var(--neon-1))]/30"
                            : "bg-white/5 text-text-3 cursor-not-allowed"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APPROVAL QUEUE PANEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ApprovalQueuePanel() {
    const { pendingApprovals, approveAction, rejectAction } = useAutomationSafety();

    if (pendingApprovals.length === 0) {
        return (
            <div className="premium-card p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[rgb(var(--neon-1))]/30 mx-auto mb-3" />
                <p className="text-sm text-text-3">No pending approvals</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-1 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[rgb(var(--warning))]" />
                    Pending Approvals
                    <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning))] text-xs font-bold">
                        {pendingApprovals.length}
                    </span>
                </h2>
            </div>

            <div className="space-y-4">
                {pendingApprovals.map(request => (
                    <ApprovalRequestCard
                        key={request.auditId}
                        request={request}
                        onApprove={(justification) => approveAction(request.auditId, justification)}
                        onReject={(reason) => rejectAction(request.auditId, reason)}
                    />
                ))}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTOMATION STATUS INDICATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function AutomationStatusIndicator() {
    const { automationEnabled, pendingApprovals, setAutomationEnabled } = useAutomationSafety();

    return (
        <div className="flex items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    automationEnabled
                        ? "bg-[rgb(var(--neon-1))] shadow-[0_0_8px_rgba(0,255,170,0.6)]"
                        : "bg-[rgb(var(--danger))] animate-pulse"
                )} />
                <span className={cn(
                    "text-xs font-bold uppercase",
                    automationEnabled ? "text-[rgb(var(--neon-1))]" : "text-[rgb(var(--danger))]"
                )}>
                    {automationEnabled ? "Auto Active" : "Auto Stopped"}
                </span>
            </div>

            {/* Pending Count */}
            {pendingApprovals.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgb(var(--warning))]/10">
                    <Clock className="w-3.5 h-3.5 text-[rgb(var(--warning))]" />
                    <span className="text-xs font-bold text-[rgb(var(--warning))]">
                        {pendingApprovals.length} pending
                    </span>
                </div>
            )}

            {/* Re-enable Button */}
            {!automationEnabled && (
                <button
                    onClick={() => setAutomationEnabled(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgb(var(--neon-1))]/10 text-[rgb(var(--neon-1))] text-xs font-bold hover:bg-[rgb(var(--neon-1))]/20 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-enable
                </button>
            )}
        </div>
    );
}
