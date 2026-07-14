'use client';

import React, { useState, useRef } from 'react';
import {
    Shield, AlertTriangle, CheckCircle2, FileText, Download,
    Globe, Server, Lock, Calendar, User, Hash,
    ChevronRight, BarChart3, Target, Zap, Clock,
    Building2, BookOpen, ArrowRight, Printer, X, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// ─── REPORT DATA ──────────────────────────────────────────────────
const REPORT = {
    ref: 'RPT-2026-0302-001',
    standard: 'ISO 27001:2022 / NIST CSF 2.0',
    title: 'Bouclier Platform — Security Audit Report',
    subtitle: 'Penetration Testing & Vulnerability Assessment',
    client: 'Bouclier SaaS — Internal SOC Division',
    classification: 'CONFIDENTIAL',
    date: 'March 2, 2026',
    version: 'v1.0 — Final',
    auditor: 'Bouclier Red Team Unit — Casablanca SOC Node 01',
    scope: 'External & Internal Infrastructure, Web Applications, Network Segmentation',
    executiveSummary: `This report presents the findings of a comprehensive security assessment conducted on the Bouclier SaaS platform infrastructure. The evaluation encompassed external attack surface mapping, internal network penetration testing, web application security analysis, and identity & access management review.

The assessment was conducted in accordance with PTES (Penetration Testing Execution Standard), ISO 27001:2022 Annex A controls, and NIST CSF 2.0 framework. The overall security posture is rated HIGH RISK, driven primarily by two critical findings on the WKS-ADMIN-X workstation and an active ransomware beacon on the datacenter infrastructure.

Immediate action is required on 2 Critical and 3 High severity findings. The remediation roadmap outlined in Section 5 provides prioritized recommendations aligned with business risk impact.`,
    overallRisk: 'HIGH',
    riskScore: 7.4,
    findings: [
        {
            id: 'F-001', title: 'Ransomware Beacon – LockBit 3.0 (Active C2)', severity: 'CRITICAL', cvss: '9.8',
            asset: 'SRV-DATACENTER-A', cwe: 'CWE-494',
            description: 'Active LockBit 3.0 ransomware beacon was detected establishing C2 communications to a Tor hidden service. VSS deletion was attempted but blocked. 7 systems exhibit encrypted files with .lb3 extension.',
            impact: 'Data availability loss across 7 hosts. Potential full database encryption. GDPR breach notification required within 72h.',
            remediation: 'Immediate isolation of all 7 affected systems. Restore from offline backups. Engage IR retainer. Block .onion domains at DNS. Reset all domain credentials.',
            references: ['CVE-2022-44877', 'MITRE T1486', 'NIST IR 8374'],
        },
        {
            id: 'F-002', title: 'Unauthenticated Remote Code Execution on WKS-ADMIN-X', severity: 'CRITICAL', cvss: '9.1',
            asset: 'WKS-ADMIN-X (10.0.2.14)', cwe: 'CWE-78',
            description: 'A dropper malware successfully executed on WKS-ADMIN-X via a malicious macro in a phishing email. PowerShell beacon established to 185.220.101.45:4444.',
            impact: 'Full administrative access compromised. Credential harvesting possible (LSASS). Lateral movement risk across internal network.',
            remediation: 'Forensic image the disk. Reset all credentials touched by this host. Enforce PowerShell Constrained Language Mode. Deploy AMSI-enabled EDR.',
            references: ['MITRE T1059.001', 'MITRE T1547.001', 'ISO 27001 A.8.7'],
        },
        {
            id: 'F-003', title: 'Credential Stuffing – 4 Accounts Compromised', severity: 'HIGH', cvss: '7.5',
            asset: 'APP-AUTH-SECURE — /auth/login', cwe: 'CWE-307',
            description: 'CAPTCHA configuration error allowed automated credential stuffing at 340 requests/min. 4 accounts confirmed successful login from threat actor IP.',
            impact: 'Data exfiltration risk from affected user accounts. Regulatory exposure under CNDP Article 24.',
            remediation: 'Force MFA enrollment for all users. Re-enable CAPTCHA. Rate-limit to 5 attempts/IP/min. Block ASN of threat actor.',
            references: ['OWASP A07:2021', 'NIST SP 800-63B', 'ISO 27001 A.9.4'],
        },
        {
            id: 'F-004', title: 'SQL Injection – Layer 7 /api/products Endpoint', severity: 'HIGH', cvss: '7.2',
            asset: 'EXT-WEB-PORTAL (203.0.113.4)', cwe: 'CWE-89',
            description: 'UNION-based SQL injection vulnerability discovered in /api/products endpoint. Blind and error-based variants confirmed. Full database schema extraction possible.',
            impact: 'Full database compromise including PII data. Authentication bypass possible.',
            remediation: 'Parameterized queries on all inputs. WAF rule deployment. Source code security review of all API routes.',
            references: ['OWASP A03:2021', 'CVE-2024-1234', 'ISO 27001 A.14.2.5'],
        },
        {
            id: 'F-005', title: 'Guest VLAN Insufficient Segmentation', severity: 'MEDIUM', cvss: '5.4',
            asset: 'WIFI-GUEST-AP (192.168.50.2)', cwe: 'CWE-923',
            description: 'Guest wireless network has access to internal server VLAN via inadequate ACL configuration. Lateral movement from guest to internal feasible.',
            impact: 'Unauthorized access to internal resources from guest network.',
            remediation: 'Apply strict ACL on VLAN boundary. Deploy NAC for guest endpoints. Audit all firewall rules between VLANs.',
            references: ['ISO 27001 A.13.1', 'NIST SP 800-82', 'CIS Control 12'],
        },
    ],
    controls: [
        { id: 'A.5 – Information Security Policies', status: 'Compliant', score: 92 },
        { id: 'A.6 – Organization of Information Security', status: 'Partial', score: 71 },
        { id: 'A.8 – Asset Management', status: 'Compliant', score: 85 },
        { id: 'A.9 – Access Control', status: 'Non-Compliant', score: 48 },
        { id: 'A.12 – Operations Security', status: 'Partial', score: 66 },
        { id: 'A.14 – System Acquisition & Development', status: 'Non-Compliant', score: 43 },
        { id: 'A.16 – Information Security Incident Management', status: 'Compliant', score: 88 },
        { id: 'A.17 – Business Continuity', status: 'Partial', score: 60 },
    ],
    roadmap: [
        { priority: 'P0', action: 'Isolate SRV-DATACENTER-A and restore from backup', deadline: 'Immediate', effort: 'High', owner: 'IR Team' },
        { priority: 'P0', action: 'Reset all credentials from WKS-ADMIN-X', deadline: 'Within 4h', effort: 'Medium', owner: 'SysAdmin' },
        { priority: 'P1', action: 'Enable MFA for all platform accounts', deadline: 'Within 24h', effort: 'Medium', owner: 'IT Security' },
        { priority: 'P1', action: 'Fix SQLi in /api/products + WAF rule', deadline: 'Within 48h', effort: 'Medium', owner: 'Dev Team' },
        { priority: 'P2', action: 'VLAN segmentation review and ACL hardening', deadline: 'Within 1 week', effort: 'High', owner: 'Network Ops' },
        { priority: 'P2', action: 'PowerShell Constrained Language Mode policy', deadline: 'Within 1 week', effort: 'Low', owner: 'SysAdmin' },
        { priority: 'P3', action: 'EDR deployment on all workstations', deadline: 'Within 2 weeks', effort: 'High', owner: 'IT Security' },
    ],
};

const severityColors: Record<string, string> = {
    CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const statusColors: Record<string, string> = {
    Compliant: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Partial: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Non-Compliant': 'text-red-500 bg-red-500/10 border-red-500/20',
};

const priorityColors: Record<string, string> = {
    P0: 'text-red-500 bg-red-500/10 border-red-500/30',
    P1: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    P2: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    P3: 'text-slate-400 bg-white/5 border-white/10',
};

import { API_CONFIG } from "@/lib/api-config";
import { apiClient } from '@/lib/api-client';

export default function AuditReportPage() {
    const [activeSection, setActiveSection] = useState('executive');
    const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
    const [missions, setMissions] = useState<any[]>([]);
    const [selectedMission, setSelectedMission] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfExported, setPdfExported] = useState(false);

    React.useEffect(() => {
        const fetchMissions = async () => {
            try {
                const data = await apiClient('/api/governance/missions');
                setMissions(data);
                if (data.length > 0) {
                        // Transform first mission into the REPORT format
                        const m = data[0];
                        setSelectedMission({
                            ref: `MS-${String(m.id).padStart(4, '0')}`,
                            standard: m.compliance_standard || 'ISO 27001:2022',
                            title: m.title || 'Security Audit Report',
                            subtitle: 'Penetration Testing & Vulnerability Assessment',
                            client: m.client_name || 'Bouclier Internal',
                            classification: 'CONFIDENTIAL',
                            date: new Date(m.created_at).toLocaleDateString(),
                            version: 'v1.0 — Live',
                            auditor: 'Bouclier Red Team Unit',
                            scope: 'External & Internal Infrastructure',
                            executiveSummary: (m.executive_summary_json?.summary) || `This report presents the findings of the assessment for ${m.client_name}.`,
                            overallRisk: (m.risk_scoring_json?.overall_risk) || 'MEDIUM',
                            riskScore: (m.risk_scoring_json?.score) || 5.0,
                            findings: (m.findings || []).map((f: any) => ({
                                id: `F-${String(f.id).padStart(3, '0')}`,
                                title: f.title,
                                severity: f.severity,
                                cvss: f.cvss || 'N/A',
                                asset: f.asset || 'N/A',
                                description: f.description,
                                impact: f.impact,
                                remediation: f.remediation,
                                references: f.references || []
                            })),
                            controls: [
                                { id: 'A.5 – Policies', status: 'Compliant', score: 90 },
                                { id: 'A.8 – Assets', status: 'Compliant', score: 85 },
                                { id: 'A.9 – Access', status: 'Partial', score: 60 }
                            ],
                            roadmap: (m.remediation_roadmap_json?.items || []).map((r: any) => ({
                                priority: r.priority || 'P1',
                                action: r.action,
                                deadline: r.deadline,
                                effort: r.effort,
                                owner: r.owner
                            }))
                        });
                    }
            } catch (error) {
                console.error("Failed to fetch missions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    const report = selectedMission || REPORT;
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Inject print-specific CSS
        const style = document.createElement('style');
        style.id = 'print-pdf-style';
        style.textContent = `
          @media print {
            body { background: white !important; color: black !important; }
            nav, header, [data-no-print], .sticky { display: none !important; }
            * { border-color: #e5e7eb !important; }
            .premium-card { border: 1px solid #e5e7eb !important; background: #f9fafb !important; }
            h1, h2, h3, h4 { color: black !important; }
            p, span, td, th { color: #374151 !important; }
            .text-red-500, .text-orange-400, .text-yellow-400 { color: inherit !important; }
            @page { margin: 15mm; size: A4; }
          }
        `;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => { document.getElementById('print-pdf-style')?.remove(); }, 2000);
        setPdfExported(true);
        setTimeout(() => setPdfExported(false), 3000);
    };

    const sections = [
        { id: 'executive', label: 'Executive Summary', icon: BookOpen },
        { id: 'findings', label: 'Technical Findings', icon: AlertTriangle },
        { id: 'controls', label: 'ISO Control Status', icon: CheckCircle2 },
        { id: 'roadmap', label: 'Remediation Roadmap', icon: ArrowRight },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 pb-12">

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/[0.01] p-8 rounded-[32px] border border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-violet-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Governance & Compliance</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">
                        Security <span className="text-violet-400">Audit Report</span>
                    </h1>
                    <p className="text-sm text-slate-500">
                        Ref: <span className="font-mono text-slate-400">{report.ref}</span> · {report.date} · {report.standard}
                    </p>
                </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <Lock className="h-4 w-4 text-red-500" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{report.classification}</span>
                        </div>
                        <button onClick={handlePrint}
                            className="h-11 px-6 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20">
                            <Printer className="h-4 w-4" /> Print / PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className={cn(
                                "btn-cyber flex items-center gap-3 text-[10px] font-black h-11 px-6 transition-all",
                                pdfExported && "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                            )}
                        >
                            {pdfExported
                                ? <><CheckCheck className="h-4 w-4" /> Exported!</>
                                : <><Download className="h-4 w-4" /> Export PDF</>
                            }
                        </button>
                    </div>
            </div>

            {/* Report Cover Card */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-[#0c0e18] to-[#0a0c15] p-10">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px)' }} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-emerald-400" />
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">{report.ref}</div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">{report.title}</h2>
                                <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">{report.subtitle}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Client Entity', value: report.client, icon: Building2 },
                                { label: 'Assessment Scope', value: report.scope, icon: Globe },
                                { label: 'Lead Auditor', value: report.auditor, icon: User },
                                { label: 'Report Date', value: report.date, icon: Calendar },
                            ].map(item => (
                                <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <item.icon className="h-3.5 w-3.5 text-slate-600" />
                                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="text-[11px] font-black text-white leading-snug">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Risk Score */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Overall Risk Rating</div>
                            <div className="text-6xl font-black text-red-500 italic tracking-tighter">{report.riskScore}</div>
                            <div className="text-[11px] font-black text-red-400 uppercase tracking-widest mt-1">{report.overallRisk} RISK</div>
                            <div className="mt-3 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${report.riskScore * 10}%` }} />
                            </div>
                            <div className="flex justify-between text-[7px] text-slate-600 font-black uppercase tracking-widest mt-1">
                                <span>0</span><span>CVSS Base Score</span><span>10</span>
                            </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Critical', value: '2', color: 'text-red-500' },
                                { label: 'High', value: '2', color: 'text-orange-400' },
                                { label: 'Medium', value: '1', color: 'text-yellow-400' },
                                { label: 'Controls', value: '8', color: 'text-violet-400' },
                            ].map(s => (
                                <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                                    <div className={cn("text-2xl font-black italic", s.color)}>{s.value}</div>
                                    <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl p-2">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                        className={cn("flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex-1 justify-center",
                            activeSection === s.id ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-white')}>
                        <s.icon className="h-4 w-4" />{s.label}
                    </button>
                ))}
            </div>

            {/* Section Content */}
            <AnimatePresence mode="wait">

                {/* EXECUTIVE SUMMARY */}
                {activeSection === 'executive' && (
                    <motion.div key="exec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-6">
                        <div className="premium-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">1. Executive Summary</h3>
                            </div>
                            <p className="text-slate-300 leading-8 whitespace-pre-line">{report.executiveSummary}</p>
                        </div>

                        {/* Scope Table */}
                        <div className="premium-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">2. Assessment Scope & Methodology</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Testing Area', 'Methodology', 'Standard', 'Result'].map(h => (
                                                <th key={h} className="pb-3 pr-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {[
                                            ['External Perimeter', 'Black-box / OSINT', 'PTES Phase 1-2', '🔴 Critical'],
                                            ['Web Applications', 'DAST + Manual', 'OWASP WSTG v4', '🔴 Critical'],
                                            ['Internal Network', 'Gray-box pivoting', 'NIST SP 800-115', '🟠 High'],
                                            ['Active Directory', 'Bloodhound + Manual', 'MITRE ATT&CK', '🟠 High'],
                                            ['Social Engineering', 'Spear-phishing sim', 'PTES Phase 3', '🔴 Critical'],
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-all">
                                                {row.map((cell, j) => (
                                                    <td key={j} className="py-4 pr-8 text-sm text-slate-300">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FINDINGS */}
                {activeSection === 'findings' && (
                    <motion.div key="findings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Critical', count: 2, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                { label: 'High', count: 2, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                                { label: 'Medium', count: 1, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                                { label: 'Total', count: 5, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
                            ].map(s => (
                                <div key={s.label} className={cn("rounded-2xl border p-5 text-center", s.bg, s.border)}>
                                    <div className={cn("text-4xl font-black italic mb-1", s.color)}>{s.count}</div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label} Severity</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {report.findings.map((f, i) => (
                                <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                    className="premium-card !p-0 overflow-hidden">
                                    <div className={cn("h-1", f.severity === 'CRITICAL' ? 'bg-red-500' : f.severity === 'HIGH' ? 'bg-orange-400' : 'bg-yellow-400')} />
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <span className={cn("px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border", severityColors[f.severity])}>
                                                        {f.severity}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[9px] font-mono text-slate-600">{f.id}</span>
                                                        <span className="text-[9px] font-mono text-slate-600">CVSS {f.cvss}</span>
                                                        <span className="text-[9px] font-mono text-slate-600">{f.cwe}</span>
                                                    </div>
                                                    <h4 className="text-base font-black text-white uppercase tracking-tight">{f.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-1">Asset: {f.asset}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedFinding(prev => prev?.id === f.id ? null : f)}
                                                className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                                {selectedFinding?.id === f.id ? 'Collapse' : 'View Detail'} <ChevronRight className={cn("h-3 w-3 transition-transform", selectedFinding?.id === f.id && "rotate-90")} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {selectedFinding?.id === f.id && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden">
                                                    <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                        <div className="lg:col-span-2 space-y-5">
                                                            <div>
                                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Technical Description</div>
                                                                <p className="text-sm text-slate-300 leading-relaxed">{f.description}</p>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Business Impact</div>
                                                                <p className="text-sm text-slate-300 leading-relaxed">{f.impact}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-5">
                                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                                                <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                    <CheckCircle2 className="h-3 w-3" /> Remediation
                                                                </div>
                                                                <p className="text-sm text-slate-300 leading-relaxed">{f.remediation}</p>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">References</div>
                                                                <div className="space-y-1">
                                                                    {f.references.map(r => (
                                                                        <div key={r} className="text-[9px] font-mono text-cyan-400 flex items-center gap-1.5">
                                                                            <ChevronRight className="h-3 w-3" />{r}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ISO CONTROLS */}
                {activeSection === 'controls' && (
                    <motion.div key="controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="premium-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">ISO 27001:2022 Annex A — Control Assessment</h3>
                            </div>
                            <div className="space-y-3">
                                {report.controls.map((ctrl, i) => (
                                    <motion.div key={ctrl.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                        className="flex items-center justify-between gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-white mb-2">{ctrl.id}</div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${ctrl.score}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.06 }}
                                                    className={cn("h-full rounded-full", ctrl.score >= 80 ? 'bg-emerald-500' : ctrl.score >= 60 ? 'bg-yellow-400' : 'bg-red-500')} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <span className="text-[11px] font-black text-white w-10 text-right">{ctrl.score}%</span>
                                            <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase border w-32 text-center", statusColors[ctrl.status])}>
                                                {ctrl.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* REMEDIATION ROADMAP */}
                {activeSection === 'roadmap' && (
                    <motion.div key="roadmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="premium-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">5. Remediation Roadmap — Prioritized Action Plan</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Priority', 'Action Item', 'Deadline', 'Effort', 'Owner'].map(h => (
                                                <th key={h} className="pb-4 pr-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {report.roadmap.map((r, i) => (
                                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                                className="hover:bg-white/[0.02] transition-all">
                                                <td className="py-4 pr-6">
                                                    <span className={cn("px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border", priorityColors[r.priority])}>
                                                        {r.priority}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-6 text-sm text-slate-200 font-medium">{r.action}</td>
                                                <td className="py-4 pr-6 text-[10px] font-mono text-slate-400">{r.deadline}</td>
                                                <td className="py-4 pr-6">
                                                    <span className={cn("text-[9px] font-black uppercase",
                                                        r.effort === 'High' ? 'text-red-400' : r.effort === 'Medium' ? 'text-yellow-400' : 'text-emerald-400')}>
                                                        {r.effort}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-6 text-[10px] text-slate-400">{r.owner}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <Lock className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Legal Disclaimer & Confidentiality Notice</div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        This document is CONFIDENTIAL and intended solely for authorized personnel of {report.client}. The information contained herein represents findings from authorized penetration testing activities conducted between the parties. Unauthorized distribution or reproduction of this report is strictly prohibited and may constitute a violation of applicable law. All findings have been assessed at the time of testing; the security posture may differ following remediation activities. This report does not constitute legal advice.
                                    </p>
                                    <div className="mt-4 flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-600">
                                        <span>Version: {report.version}</span>
                                        <span>Ref: {report.ref}</span>
                                        <span>Date: {report.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
