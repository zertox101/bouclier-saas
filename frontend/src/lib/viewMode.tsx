"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW MODE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ViewMode = 'soc' | 'client' | 'executive';
export type UserRole = 'analyst' | 'lead' | 'manager' | 'client' | 'executive';

export interface ViewModeContext {
    mode: ViewMode;
    role: UserRole;
    clientId?: string;
    setMode: (mode: ViewMode) => void;
    setRole: (role: UserRole) => void;
    isSOC: boolean;
    isClient: boolean;
    isExecutive: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ViewModeCtx = createContext<ViewModeContext | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ViewMode>('soc');
    const [role, setRole] = useState<UserRole>('analyst');

    const contextValue: ViewModeContext = {
        mode,
        role,
        setMode,
        setRole,
        isSOC: mode === 'soc',
        isClient: mode === 'client',
        isExecutive: mode === 'executive'
    };

    return (
        <ViewModeCtx.Provider value={contextValue}>
            {children}
        </ViewModeCtx.Provider>
    );
}

export function useViewMode() {
    const context = useContext(ViewModeCtx);
    if (!context) {
        throw new Error('useViewMode must be used within ViewModeProvider');
    }
    return context;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA SANITIZATION UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SOCIncident {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'contained' | 'resolved';
    mitreIds: string[];
    iocs: {
        type: 'ip' | 'domain' | 'hash' | 'email';
        value: string;
        malicious: boolean;
    }[];
    rawEvents: string[];
    detectionSource: string;
    affectedAssets: {
        hostname: string;
        ip: string;
        user: string;
    }[];
    timeline: {
        timestamp: string;
        event: string;
        technical: boolean;
    }[];
    actions: {
        description: string;
        clientFriendly: string;
        timestamp: string;
    }[];
}

export interface ClientIncident {
    id: string;
    title: string;
    impactLevel: 'Critical Business Risk' | 'High Business Risk' | 'Moderate Concern' | 'Low Priority';
    statusLabel: string;
    summary: string;
    businessImpact: string;
    actionsTaken: string[];
    protectionStatus: 'secure' | 'at-risk' | 'investigating';
    lastUpdate: string;
}

// Translate MITRE IDs to business language
const mitreTranslations: Record<string, string> = {
    'T1566': 'Email-based threat',
    'T1566.001': 'Malicious email attachment',
    'T1566.002': 'Malicious email link',
    'T1059': 'Suspicious script execution',
    'T1059.001': 'PowerShell-based threat',
    'T1547': 'Persistence attempt',
    'T1003': 'Credential theft attempt',
    'T1486': 'Ransomware activity',
    'T1071': 'Command & control communication',
    'T1021': 'Lateral movement attempt'
};

// Translate severity to business impact
function translateSeverity(severity: string): ClientIncident['impactLevel'] {
    const map: Record<string, ClientIncident['impactLevel']> = {
        'critical': 'Critical Business Risk',
        'high': 'High Business Risk',
        'medium': 'Moderate Concern',
        'low': 'Low Priority'
    };
    return map[severity] || 'Moderate Concern';
}

// Translate status to client-friendly label
function translateStatus(status: string): string {
    const map: Record<string, string> = {
        'open': 'Under Investigation',
        'investigating': 'Being Analyzed',
        'contained': 'Threat Contained',
        'resolved': 'Fully Resolved'
    };
    return map[status] || 'In Progress';
}

// Get protection status from incident status
function getProtectionStatus(status: string): ClientIncident['protectionStatus'] {
    if (status === 'resolved' || status === 'contained') return 'secure';
    if (status === 'investigating') return 'investigating';
    return 'at-risk';
}

// Format timestamp for clients
function formatClientTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Generate client-friendly summary
function generateClientSummary(incident: SOCIncident): string {
    const threatType = incident.mitreIds.length > 0
        ? mitreTranslations[incident.mitreIds[0]] || 'security threat'
        : 'security threat';

    const assetCount = incident.affectedAssets.length;
    const assetText = assetCount === 1
        ? 'one system'
        : `${assetCount} systems`;

    if (incident.status === 'resolved') {
        return `A ${threatType.toLowerCase()} was detected and successfully neutralized. Our security team identified and resolved the issue, protecting ${assetText} from potential harm.`;
    }

    if (incident.status === 'contained') {
        return `A ${threatType.toLowerCase()} was detected and contained. Our team is completing final remediation steps to ensure your environment remains secure.`;
    }

    return `Our security monitoring detected a ${threatType.toLowerCase()}. Our team is actively investigating and taking protective measures.`;
}

// Main sanitization function
export function sanitizeForClient(incident: SOCIncident): ClientIncident {
    return {
        id: incident.id,
        title: incident.mitreIds.length > 0
            ? `Security Alert: ${mitreTranslations[incident.mitreIds[0]] || 'Threat Detected'}`
            : 'Security Alert',
        impactLevel: translateSeverity(incident.severity),
        statusLabel: translateStatus(incident.status),
        summary: generateClientSummary(incident),
        businessImpact: incident.status === 'resolved' || incident.status === 'contained'
            ? 'No business impact — threat neutralized'
            : 'Under assessment',
        actionsTaken: incident.actions.map(a => a.clientFriendly),
        protectionStatus: getProtectionStatus(incident.status),
        lastUpdate: formatClientTimestamp(
            incident.timeline.length > 0
                ? incident.timeline[incident.timeline.length - 1].timestamp
                : new Date().toISOString()
        )
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXECUTIVE DATA TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ExecutiveMetrics {
    riskScore: {
        current: number;
        previous: number;
        trend: 'up' | 'down' | 'stable';
    };
    incidents: {
        total: number;
        resolved: number;
        trend: number; // percentage change
    };
    mttr: {
        hours: number;
        previousHours: number;
        target: number;
    };
    automationCoverage: {
        percentage: number;
        previousPercentage: number;
    };
    topVectors: {
        name: string;
        percentage: number;
    }[];
    compliance: {
        framework: string;
        status: 'compliant' | 'findings' | 'non-compliant';
        findingsCount?: number;
    }[];
}

export function generateExecutiveMetrics(rawData: any): ExecutiveMetrics {
    // This would aggregate from real data
    return {
        riskScore: {
            current: 78,
            previous: 73,
            trend: 'up'
        },
        incidents: {
            total: 127,
            resolved: 119,
            trend: -23
        },
        mttr: {
            hours: 4.2,
            previousHours: 6.0,
            target: 4.0
        },
        automationCoverage: {
            percentage: 73,
            previousPercentage: 61
        },
        topVectors: [
            { name: 'Email Threats', percentage: 42 },
            { name: 'Web Exploits', percentage: 28 },
            { name: 'Credential Abuse', percentage: 18 },
            { name: 'Other', percentage: 12 }
        ],
        compliance: [
            { framework: 'SOC 2 Type II', status: 'compliant' },
            { framework: 'ISO 27001', status: 'compliant' },
            { framework: 'PCI DSS', status: 'findings', findingsCount: 2 },
            { framework: 'HIPAA', status: 'compliant' }
        ]
    };
}
