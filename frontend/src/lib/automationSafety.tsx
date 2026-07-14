"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTOMATION SAFETY TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ActionRisk = 'safe' | 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface AutomatedAction {
    id: string;
    type: string;
    description: string;
    target: string;
    risk: ActionRisk;
    source: 'ai' | 'playbook' | 'rule' | 'manual';
    requestedBy: string;
    requestedAt: Date;
    expiresAt: Date;
    reversible: boolean;
    estimatedImpact: string;
    rollbackProcedure?: string;
}

export interface ApprovalRequest {
    action: AutomatedAction;
    status: ApprovalStatus;
    approvedBy?: string;
    approvedAt?: Date;
    justification?: string;
    auditId: string;
}

export interface AutomationSafetyContext {
    // Global kill switch
    automationEnabled: boolean;
    setAutomationEnabled: (enabled: boolean) => void;
    emergencyStop: () => void;

    // Pending approvals
    pendingApprovals: ApprovalRequest[];
    requestApproval: (action: AutomatedAction) => Promise<string>;
    approveAction: (auditId: string, justification: string) => void;
    rejectAction: (auditId: string, reason: string) => void;

    // Safety checks
    canAutomate: (action: AutomatedAction) => { allowed: boolean; reason: string };
    isDestructive: (actionType: string) => boolean;

    // Audit log
    auditLog: AuditEntry[];
}

export interface AuditEntry {
    id: string;
    timestamp: Date;
    actionType: string;
    description: string;
    user: string;
    outcome: 'executed' | 'blocked' | 'approved' | 'rejected' | 'emergency_stop';
    details: Record<string, unknown>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESTRUCTIVE ACTIONS REGISTRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DESTRUCTIVE_ACTIONS: Record<string, { risk: ActionRisk; requiresDualApproval: boolean }> = {
    // CRITICAL - Never automate without dual approval
    'network.isolate': { risk: 'critical', requiresDualApproval: true },
    'account.disable': { risk: 'critical', requiresDualApproval: true },
    'firewall.block_ip_range': { risk: 'critical', requiresDualApproval: true },
    'evidence.delete': { risk: 'critical', requiresDualApproval: true },
    'incident.close': { risk: 'critical', requiresDualApproval: true },

    // HIGH - Requires approval
    'account.reset_password': { risk: 'high', requiresDualApproval: false },
    'account.revoke_sessions': { risk: 'high', requiresDualApproval: false },
    'firewall.block_ip': { risk: 'high', requiresDualApproval: false },
    'email.block_sender': { risk: 'high', requiresDualApproval: false },
    'endpoint.quarantine_file': { risk: 'high', requiresDualApproval: false },

    // MEDIUM - Notify but can proceed
    'ticket.escalate': { risk: 'medium', requiresDualApproval: false },
    'alert.suppress': { risk: 'medium', requiresDualApproval: false },
    'playbook.skip_step': { risk: 'medium', requiresDualApproval: false },

    // LOW - Can automate with logging
    'ioc.extract': { risk: 'low', requiresDualApproval: false },
    'threat_intel.lookup': { risk: 'low', requiresDualApproval: false },
    'ticket.create': { risk: 'low', requiresDualApproval: false },
    'alert.enrich': { risk: 'low', requiresDualApproval: false },

    // SAFE - Full automation allowed
    'dashboard.update': { risk: 'safe', requiresDualApproval: false },
    'log.forward': { risk: 'safe', requiresDualApproval: false },
    'report.generate': { risk: 'safe', requiresDualApproval: false },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTOMATION DECISION FRAMEWORK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function evaluateAutomationSafety(action: AutomatedAction): { allowed: boolean; reason: string } {
    // Step 1: Check if automation is globally enabled
    // (handled in context)

    // Step 2: Is this action in the destructive registry?
    const actionConfig = DESTRUCTIVE_ACTIONS[action.type];

    if (!actionConfig) {
        return {
            allowed: false,
            reason: 'Unknown action type - requires manual review'
        };
    }

    // Step 3: Critical actions NEVER auto-execute
    if (actionConfig.risk === 'critical') {
        return {
            allowed: false,
            reason: 'Critical action requires dual human approval'
        };
    }

    // Step 4: High risk from AI sources require approval
    if (actionConfig.risk === 'high' && action.source === 'ai') {
        return {
            allowed: false,
            reason: 'AI-initiated high-risk action requires human approval'
        };
    }

    // Step 5: Non-reversible actions require approval
    if (!action.reversible && actionConfig.risk !== 'safe') {
        return {
            allowed: false,
            reason: 'Non-reversible action requires human approval'
        };
    }

    // Step 6: Safe and low-risk can proceed
    if (actionConfig.risk === 'safe' || actionConfig.risk === 'low') {
        return { allowed: true, reason: 'Action is safe for automation' };
    }

    // Default: require approval
    return {
        allowed: false,
        reason: 'Action requires approval based on risk assessment'
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT IMPLEMENTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AutomationSafetyCtx = createContext<AutomationSafetyContext | undefined>(undefined);

export function AutomationSafetyProvider({ children }: { children: React.ReactNode }) {
    const [automationEnabled, setAutomationEnabled] = useState(true);
    const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

    // Generate unique audit ID
    const generateAuditId = () => `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to audit log
    const addAuditEntry = useCallback((entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
        const newEntry: AuditEntry = {
            ...entry,
            id: generateAuditId(),
            timestamp: new Date()
        };
        setAuditLog(prev => [newEntry, ...prev].slice(0, 1000)); // Keep last 1000 entries

        // In production: send to immutable audit store
        console.log('[AUDIT]', newEntry);
    }, []);

    // Emergency stop - halt ALL automation
    const emergencyStop = useCallback(() => {
        setAutomationEnabled(false);

        // Reject all pending approvals
        setPendingApprovals(prev =>
            prev.map(req => ({ ...req, status: 'expired' as ApprovalStatus }))
        );

        addAuditEntry({
            actionType: 'system.emergency_stop',
            description: 'Emergency automation stop triggered',
            user: 'SYSTEM', // Would be actual user in production
            outcome: 'emergency_stop',
            details: { pendingCount: pendingApprovals.length }
        });

        // In production: send escalation to CISO, page on-call
        console.error('[EMERGENCY] All automation stopped');
    }, [pendingApprovals.length, addAuditEntry]);

    // Request approval for an action
    const requestApproval = useCallback(async (action: AutomatedAction): Promise<string> => {
        const auditId = generateAuditId();

        const request: ApprovalRequest = {
            action,
            status: 'pending',
            auditId
        };

        setPendingApprovals(prev => [...prev, request]);

        addAuditEntry({
            actionType: action.type,
            description: `Approval requested: ${action.description}`,
            user: action.requestedBy,
            outcome: 'blocked', // Blocked pending approval
            details: { target: action.target, risk: action.risk }
        });

        return auditId;
    }, [addAuditEntry]);

    // Approve an action
    const approveAction = useCallback((auditId: string, justification: string) => {
        setPendingApprovals(prev =>
            prev.map(req => {
                if (req.auditId === auditId && req.status === 'pending') {
                    addAuditEntry({
                        actionType: req.action.type,
                        description: `Action approved: ${req.action.description}`,
                        user: 'analyst@soc.com', // Would be actual user
                        outcome: 'approved',
                        details: { justification, target: req.action.target }
                    });

                    return {
                        ...req,
                        status: 'approved' as ApprovalStatus,
                        approvedBy: 'analyst@soc.com',
                        approvedAt: new Date(),
                        justification
                    };
                }
                return req;
            })
        );
    }, [addAuditEntry]);

    // Reject an action
    const rejectAction = useCallback((auditId: string, reason: string) => {
        setPendingApprovals(prev =>
            prev.map(req => {
                if (req.auditId === auditId && req.status === 'pending') {
                    addAuditEntry({
                        actionType: req.action.type,
                        description: `Action rejected: ${req.action.description}`,
                        user: 'analyst@soc.com',
                        outcome: 'rejected',
                        details: { reason, target: req.action.target }
                    });

                    return {
                        ...req,
                        status: 'rejected' as ApprovalStatus
                    };
                }
                return req;
            })
        );
    }, [addAuditEntry]);

    // Check if action can be automated
    const canAutomate = useCallback((action: AutomatedAction) => {
        if (!automationEnabled) {
            return { allowed: false, reason: 'Automation is globally disabled' };
        }
        return evaluateAutomationSafety(action);
    }, [automationEnabled]);

    // Check if action type is destructive
    const isDestructive = useCallback((actionType: string) => {
        const config = DESTRUCTIVE_ACTIONS[actionType];
        return config ? config.risk === 'critical' || config.risk === 'high' : true;
    }, []);

    const contextValue: AutomationSafetyContext = {
        automationEnabled,
        setAutomationEnabled,
        emergencyStop,
        pendingApprovals: pendingApprovals.filter(p => p.status === 'pending'),
        requestApproval,
        approveAction,
        rejectAction,
        canAutomate,
        isDestructive,
        auditLog
    };

    return (
        <AutomationSafetyCtx.Provider value={contextValue}>
            {children}
        </AutomationSafetyCtx.Provider>
    );
}

export function useAutomationSafety() {
    const context = useContext(AutomationSafetyCtx);
    if (!context) {
        throw new Error('useAutomationSafety must be used within AutomationSafetyProvider');
    }
    return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER HOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Hook for executing an action with safety checks
export function useSafeAction() {
    const { canAutomate, requestApproval, automationEnabled } = useAutomationSafety();

    return useCallback(async (action: AutomatedAction): Promise<{
        executed: boolean;
        reason: string;
        approvalId?: string;
    }> => {
        const safety = canAutomate(action);

        if (safety.allowed) {
            // Execute immediately
            console.log('[EXECUTE]', action.type, action.target);
            return { executed: true, reason: 'Action executed' };
        }

        // Request approval
        const approvalId = await requestApproval(action);
        return {
            executed: false,
            reason: safety.reason,
            approvalId
        };
    }, [canAutomate, requestApproval]);
}
