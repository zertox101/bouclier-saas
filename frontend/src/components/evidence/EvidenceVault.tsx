"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Shield, Lock, Hash, Clock, User,
    CheckCircle2, AlertTriangle, Download, Eye,
    Link as LinkIcon, ChevronRight, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EvidenceArtifact {
    id: string;
    incidentId: string;
    type: 'pcap' | 'memory_dump' | 'disk_image' | 'log_file' | 'screenshot' | 'malware_sample' | 'registry_hive';
    filename: string;
    size: number;
    collectedAt: Date;
    collectedBy: string;
    source: string; // hostname, IP, etc.

    // Cryptographic integrity
    sha256: string;
    md5: string;
    verified: boolean;

    // Chain of custody
    chainOfCustody: CustodyEntry[];

    // Legal
    legalHold: boolean;
    retentionUntil?: Date;

    // Storage
    storageLocation: string;
    immutable: boolean;
}

export interface CustodyEntry {
    timestamp: Date;
    action: 'collected' | 'accessed' | 'transferred' | 'analyzed' | 'exported' | 'legal_hold_applied';
    user: string;
    userRole: string;
    purpose: string;
    ipAddress: string;
    verified: boolean;
}

export interface EvidenceVaultMetrics {
    totalArtifacts: number;
    totalSize: number; // bytes
    integrityVerified: number;
    legalHoldCount: number;
    oldestArtifact: Date;
    lastIntegrityCheck: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function truncateHash(hash: string): string {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function VaultMetricsCard({ metrics }: { metrics: EvidenceVaultMetrics }) {
    return (
        <div className="premium-card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[rgb(var(--neon-1))]/20">
                    <Database className="w-6 h-6 text-[rgb(var(--neon-1))]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-1">Evidence Vault</h2>
                    <p className="text-xs text-text-3">Immutable artifact storage</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-xs text-text-3 mb-1">Total Artifacts</p>
                    <p className="text-2xl font-bold text-text-1">{metrics.totalArtifacts}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-xs text-text-3 mb-1">Total Size</p>
                    <p className="text-2xl font-bold text-text-1">{formatBytes(metrics.totalSize)}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-xs text-text-3 mb-1">Integrity Verified</p>
                    <p className="text-2xl font-bold text-[rgb(var(--neon-1))]">
                        {metrics.integrityVerified}/{metrics.totalArtifacts}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--neon-1))]/10 border border-[rgb(var(--neon-1))]/20">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[rgb(var(--neon-1))]" />
                    <span className="text-xs font-bold text-[rgb(var(--neon-1))]">
                        Last integrity check: {metrics.lastIntegrityCheck.toLocaleString()}
                    </span>
                </div>
                {metrics.legalHoldCount > 0 && (
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[rgb(var(--warning))]" />
                        <span className="text-xs font-bold text-[rgb(var(--warning))]">
                            {metrics.legalHoldCount} on legal hold
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChainOfCustodyTimeline({ chain }: { chain: CustodyEntry[] }) {
    const actionIcons = {
        collected: <FileText className="w-4 h-4" />,
        accessed: <Eye className="w-4 h-4" />,
        transferred: <LinkIcon className="w-4 h-4" />,
        analyzed: <Shield className="w-4 h-4" />,
        exported: <Download className="w-4 h-4" />,
        legal_hold_applied: <Lock className="w-4 h-4" />
    };

    return (
        <div className="space-y-3">
            {chain.map((entry, i) => (
                <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "p-2 rounded-lg",
                            entry.verified
                                ? "bg-[rgb(var(--neon-1))]/20 text-[rgb(var(--neon-1))]"
                                : "bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning))]"
                        )}>
                            {actionIcons[entry.action]}
                        </div>
                        {i < chain.length - 1 && (
                            <div className="w-0.5 h-8 bg-white/10 my-1" />
                        )}
                    </div>

                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-text-1 capitalize">
                                {entry.action.replace('_', ' ')}
                            </span>
                            {entry.verified && (
                                <CheckCircle2 className="w-3 h-3 text-[rgb(var(--neon-1))]" />
                            )}
                        </div>
                        <p className="text-xs text-text-3 mb-1">{entry.purpose}</p>
                        <div className="flex items-center gap-3 text-[10px] text-text-3">
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {entry.user} ({entry.userRole})
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.timestamp.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EvidenceArtifactCard({ artifact }: { artifact: EvidenceArtifact }) {
    const [expanded, setExpanded] = useState(false);

    const typeIcons = {
        pcap: <FileText className="w-5 h-5" />,
        memory_dump: <Database className="w-5 h-5" />,
        disk_image: <Database className="w-5 h-5" />,
        log_file: <FileText className="w-5 h-5" />,
        screenshot: <FileText className="w-5 h-5" />,
        malware_sample: <AlertTriangle className="w-5 h-5" />,
        registry_hive: <Database className="w-5 h-5" />
    };

    return (
        <div className={cn(
            "rounded-xl border overflow-hidden",
            artifact.legalHold
                ? "border-[rgb(var(--warning))]/30 bg-[rgb(var(--warning))]/5"
                : "border-white/10 bg-white/5"
        )}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
                <div className={cn(
                    "p-3 rounded-lg",
                    artifact.verified
                        ? "bg-[rgb(var(--neon-1))]/20 text-[rgb(var(--neon-1))]"
                        : "bg-[rgb(var(--danger))]/20 text-[rgb(var(--danger))]"
                )}>
                    {typeIcons[artifact.type]}
                </div>

                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[rgb(var(--neon-2))]">{artifact.id}</span>
                        {artifact.legalHold && (
                            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning))]">
                                <Lock className="w-3 h-3" />
                                LEGAL HOLD
                            </span>
                        )}
                        {artifact.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[rgb(var(--neon-1))]" />
                        )}
                    </div>
                    <p className="text-sm font-medium text-text-1 mb-1">{artifact.filename}</p>
                    <div className="flex items-center gap-3 text-xs text-text-3">
                        <span>{formatBytes(artifact.size)}</span>
                        <span>•</span>
                        <span className="capitalize">{artifact.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{artifact.source}</span>
                    </div>
                </div>

                <ChevronRight className={cn(
                    "w-5 h-5 text-text-3 transition-transform",
                    expanded && "rotate-90"
                )} />
            </button>

            {expanded && (
                <div className="border-t border-white/10 p-4 bg-black/20">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Metadata */}
                        <div>
                            <h4 className="text-xs font-bold text-text-3 uppercase mb-3">Metadata</h4>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-[10px] text-text-3">Incident ID</span>
                                    <p className="text-sm font-mono text-[rgb(var(--neon-1))]">{artifact.incidentId}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-text-3">Collected By</span>
                                    <p className="text-sm text-text-1">{artifact.collectedBy}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-text-3">Collected At</span>
                                    <p className="text-sm text-text-1">{artifact.collectedAt.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-text-3">Storage</span>
                                    <p className="text-xs font-mono text-text-2 break-all">{artifact.storageLocation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Cryptographic Hashes */}
                        <div>
                            <h4 className="text-xs font-bold text-text-3 uppercase mb-3">Cryptographic Integrity</h4>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Hash className="w-3.5 h-3.5 text-text-3" />
                                        <span className="text-[10px] text-text-3">SHA-256</span>
                                    </div>
                                    <p className="text-xs font-mono text-text-1 break-all">{artifact.sha256}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Hash className="w-3.5 h-3.5 text-text-3" />
                                        <span className="text-[10px] text-text-3">MD5</span>
                                    </div>
                                    <p className="text-xs font-mono text-text-1">{artifact.md5}</p>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-lg flex items-center gap-2",
                                    artifact.verified
                                        ? "bg-[rgb(var(--neon-1))]/10 border border-[rgb(var(--neon-1))]/20"
                                        : "bg-[rgb(var(--danger))]/10 border border-[rgb(var(--danger))]/20"
                                )}>
                                    {artifact.verified ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-[rgb(var(--neon-1))]" />
                                            <span className="text-xs font-bold text-[rgb(var(--neon-1))]">Integrity Verified</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-4 h-4 text-[rgb(var(--danger))]" />
                                            <span className="text-xs font-bold text-[rgb(var(--danger))]">Verification Failed</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chain of Custody */}
                    <div>
                        <h4 className="text-xs font-bold text-text-3 uppercase mb-3">Chain of Custody</h4>
                        <ChainOfCustodyTimeline chain={artifact.chainOfCustody} />
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--neon-1))]/10 text-[rgb(var(--neon-1))] text-sm font-bold hover:bg-[rgb(var(--neon-1))]/20 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-text-2 text-sm font-bold hover:bg-white/10 transition-colors">
                            <Hash className="w-4 h-4" />
                            Verify Hash
                        </button>
                        {!artifact.legalHold && (
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--warning))]/10 text-[rgb(var(--warning))] text-sm font-bold hover:bg-[rgb(var(--warning))]/20 transition-colors">
                                <Lock className="w-4 h-4" />
                                Apply Legal Hold
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function EvidenceVault() {
    const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>([]);

    useEffect(() => {
        apiClient("/api/evidence")
            .then(d => {
                if (d.artifacts?.length > 0) {
                    setArtifacts(d.artifacts.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        type: a.type,
                        size: a.size,
                        status: a.status,
                        collectedAt: new Date(a.collected_at),
                        collectedBy: a.collected_by,
                        caseId: a.case_id,
                        sha256: a.sha256,
                        md5: a.md5,
                        storageLocation: a.storage_location,
                        chainOfCustody: a.chain_of_custody || [],
                        legalHold: a.legal_hold,
                    })));
                }
            })
            .catch(() => {});
    }, []);

    const metrics: EvidenceVaultMetrics = {
        totalArtifacts: artifacts.length,
        totalSize: artifacts.reduce((sum, a) => sum + a.size, 0),
        integrityVerified: artifacts.filter(a => a.verified).length,
        legalHoldCount: artifacts.filter(a => a.legalHold).length,
        oldestArtifact: new Date(Math.min(...artifacts.map(a => a.collectedAt.getTime()))),
        lastIntegrityCheck: new Date()
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[rgb(var(--neon-1))]/20 to-[rgb(var(--neon-2))]/10 border border-[rgb(var(--neon-1))]/20">
                        <Shield className="w-6 h-6 text-[rgb(var(--neon-1))]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-1">Evidence Vault</h1>
                        <p className="text-xs text-text-3">Immutable evidence storage with cryptographic integrity</p>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--neon-1))]/10 text-[rgb(var(--neon-1))] border border-[rgb(var(--neon-1))]/30 hover:bg-[rgb(var(--neon-1))]/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold">Verify All Hashes</span>
                </button>
            </div>

            {/* Metrics */}
            <div className="mb-6">
                <VaultMetricsCard metrics={metrics} />
            </div>

            {/* Artifacts */}
            <div>
                <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider mb-4">
                    Artifacts ({artifacts.length})
                </h2>
                <div className="space-y-4">
                    {artifacts.map(artifact => (
                        <EvidenceArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                </div>
            </div>
        </div>
    );
}
