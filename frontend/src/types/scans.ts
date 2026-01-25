export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
export type ScanTool = 'zap' | 'nuclei';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ScanFinding {
    id: number;
    scan_job_id: number;
    severity: Severity;
    title: string;
    description?: string;
    evidence_json?: any;
    url: string;
    param?: string;
    cwe?: string;
    owasp?: string;
    confidence?: string;
    remediation?: string;
    created_at: string;
}

export interface ScanJob {
    id: number;
    tool: ScanTool;
    target: string;
    status: ScanStatus;
    created_at: string;
    started_at?: string;
    finished_at?: string;
    findings_count?: number;
}

export interface ScanDetail extends ScanJob {
    config_json: any;
    findings: ScanFinding[];
}
