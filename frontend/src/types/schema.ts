/**
 * SHIELD Unified Security Schema
 * This file defines the Typescript contract for all security tool outputs.
 * Source Verification: docs/API_CONTRACT.md
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingType = 'vulnerability' | 'misconfiguration' | 'ioc' | 'anomaly' | 'service' | 'malware' | 'info';
export type ScanStatus = 'completed' | 'partial' | 'failed' | 'running' | 'queued' | 'active';
export type TargetType = 'host' | 'ip_range' | 'web_app' | 'mobile_app' | 'file' | 'domain' | 'directory' | 'network_segment' | 'service' | 'logs_cluster' | 'apk';

export interface CVSS {
    score: number;
    vector: string;
}

export interface AffectedResource {
    resource_type: 'endpoint' | 'service' | 'file' | 'host' | 'database';
    resource_id: string; // e.g. "/login" or "192.168.1.10:22"
}

export interface Artifact {
    type: 'pdf' | 'json' | 'pcap' | 'csv' | 'log';
    name: string;
    uri: string;
}

export interface FindingReference {
    type: 'link' | 'kb' | 'cve';
    url?: string;
    title: string;
}

export interface FindingEvidence {
    stdout_snippet?: string | null;
    http_response_code?: number;
    response_snippet?: string | null;
    hashes?: string[];
    screenshots?: string[]; // paths to screenshot artifacts
}

export interface Finding {
    id: string;
    title: string;
    type: FindingType;
    severity: Severity;
    cvss?: CVSS;
    cve?: string | null;
    mitre?: string[]; // IDs like T1059
    affected?: AffectedResource[];
    description: string;
    evidence?: FindingEvidence;
    recommendation: string;
    references?: FindingReference[];
    confidence?: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>; // Tool-specific extra data
}

export interface ScanTarget {
    type: TargetType;
    identifier: string; // The input, e.g. "192.168.1.1"
}

export interface ScanSummary {
    status: ScanStatus;
    duration_seconds?: number;
    total_findings?: number;
    risk_score: number; // 0-100
    started_at?: string;
    ended_at?: string;

    // Specific Summary Fields
    simulated_steps?: number;
    captured_events?: number;
    unique_attackers?: number;
    events_analyzed?: number;
    ioc_hits?: number;
    logs_analyzed?: number;
    alerts_generated?: number;
    score_overall?: number;
    categories?: Record<string, number>;
    pq_cipher_support?: boolean;
    permissions_count?: number;
    dangerous_permissions?: number;
}

export interface KPISection {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;

    // Custom KPIs
    bruteforce_count?: number;
    scan_count?: number;
    avg_attempts_per_attacker?: number;
}

// --- Extended Data Types ---

export interface TimelineStep {
    step: number;
    technique: string;
    label: string;
    result: string;
}

export interface HoneypotEvent {
    timestamp: string;
    source_ip: string;
    geo: string;
    attack_type: string;
    attempted_user?: string;
    evidence: string;
}

export interface IOC {
    id: string;
    type: string;
    indicator: string;
    confidence: 'low' | 'medium' | 'high';
    evidence_count: number;
    mitre?: string[];
}

export interface CorrelatedIncident {
    incident_id: string;
    summary: string;
    severity: Severity;
    related_hosts: string[];
    mitre?: string[];
}

export interface ZTGap {
    id: string;
    severity: Severity;
    description: string;
    recommendation: string;
}

export interface Alert {
    alert_id: string;
    severity: Severity;
    title: string;
    pattern: string;
    affected_host: string;
    time_window: string;
    recommendation: string;
}

// The Root Object for any Scan Result
export interface UnifiedScanResult {
    tool: string;
    scan_id: string;
    timestamp: string; // ISO8601
    target?: ScanTarget;
    summary: ScanSummary;
    findings?: FindingsList;
    artifacts?: Artifact[];
    kpis?: KPISection;
    notes?: string;

    // Advanced Tool Extensions
    simulated_timeline?: TimelineStep[];
    events?: HoneypotEvent[];
    iocs_detected?: IOC[];
    correlated_incidents?: CorrelatedIncident[];
    alerts?: Alert[];
    gaps?: ZTGap[]; // For Zero Trust (mapped to finding structure usually, but specified separately in example)
    dangerous_permissions?: string[]; // For Mobile
}

export type FindingsList = Finding[];
