"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UnifiedScanResult, Finding } from "@/types/schema";
import type { LogEntry } from "@/types/tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertCircle, CheckCircle, ShieldAlert, Terminal, Search, Filter,
    Download, Share2, Activity, Zap, Server, Globe, FileText, ChevronRight, Crosshair, Fingerprint, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePDFResult } from "@/lib/pdf-generator";

interface JobMeta {
    job_id: string;
    tool_id?: string;
    tool_name?: string;
    target?: string;
    started_at?: string;
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-black/40 text-zinc-400">
                <Activity className="w-12 h-12 mb-4 animate-pulse" />
                <p>Initializing Results Engine...</p>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}

function ResultsContent() {
    const toolsApiBase = process.env.NEXT_PUBLIC_TOOLS_API_BASE || "http://localhost:8100";
    const searchParams = useSearchParams();
    const [jobHistory, setJobHistory] = useState<JobMeta[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [activeScan, setActiveScan] = useState<UnifiedScanResult | null>(null);
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedMeta = useMemo(
        () => jobHistory.find(item => item.job_id === selectedJobId) || null,
        [jobHistory, selectedJobId]
    );
    const scanLabel = (activeScan?.tool || selectedMeta?.tool_name || selectedMeta?.tool_id || "Scan");
    const scanTargetLabel = activeScan?.target?.identifier || selectedMeta?.target || "Target";
    const scanTimestamp = activeScan?.timestamp || selectedMeta?.started_at;

    const handleScanChange = (jobId: string) => {
        setSelectedJobId(jobId);
    };

    const normalizeLevel = (level?: string) => {
        const text = (level || "info").toLowerCase();
        if (text.includes("error")) return "high";
        if (text.includes("warning") || text.includes("warn")) return "medium";
        if (text.includes("success")) return "low";
        return "info";
    };

    const getSeverityColor = (severity?: string) => {
        const value = (severity || "info").toLowerCase();
        if (value === "critical") return "bg-red-500/20 text-red-400 border-red-500/40";
        if (value === "high") return "bg-orange-500/20 text-orange-400 border-orange-500/40";
        if (value === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
        if (value === "low") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
        return "bg-slate-500/20 text-slate-400 border-slate-500/40";
    };

    const buildFindings = (logs: LogEntry[]) => {
        return logs
            .filter(log => log && log.message)
            .map((log, idx) => {
                const severity = normalizeLevel(log.level);
                const title = log.message.length > 80 ? `${log.message.slice(0, 77)}...` : log.message;
                return {
                    id: `${selectedJobId || "job"}-${idx}`,
                    title,
                    type: "info",
                    severity,
                    description: log.message,
                    recommendation: "Review the tool output and validate any findings.",
                    evidence: { stdout_snippet: log.message },
                    confidence: severity === "high" ? "high" : severity === "medium" ? "medium" : "low",
                } as Finding;
            });
    };

    const buildScanFromJob = (job: any, meta: JobMeta | null) => {
        const logs: LogEntry[] = Array.isArray(job?.logs) ? job.logs : [];
        const findings = buildFindings(logs);
        const counts = findings.reduce(
            (acc, f) => {
                acc[f.severity] = (acc[f.severity] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );
        const high = (counts.high || 0) + (counts.critical || 0);
        const medium = counts.medium || 0;
        const low = counts.low || 0;
        const riskScore = Math.min(100, high * 20 + medium * 10 + low * 3);

        const status = job?.status === "running"
            ? "running"
            : job?.status === "failed"
                ? "failed"
                : "completed";

        return {
            tool: meta?.tool_name || meta?.tool_id || job?.tool_id || "tool",
            scan_id: job?.job_id || selectedJobId || "job",
            timestamp: meta?.started_at || new Date().toISOString(),
            target: meta?.target ? { type: "host", identifier: meta.target } : undefined,
            summary: {
                status,
                total_findings: findings.length,
                risk_score: riskScore,
                started_at: meta?.started_at,
                ended_at: status != "running" ? new Date().toISOString() : undefined,
            },
            findings,
            kpis: {
                critical: counts.critical || 0,
                high: counts.high || 0,
                medium: counts.medium || 0,
                low: counts.low || 0,
            },
        } as UnifiedScanResult;
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem("shield_tool_jobs");
        const history: JobMeta[] = stored ? JSON.parse(stored) : [];
        setJobHistory(history);

        const paramId = searchParams.get("job_id");
        if (paramId) {
            setSelectedJobId(paramId);
        } else if (history.length > 0) {
            setSelectedJobId(history[0].job_id);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!selectedJobId) {
            setActiveScan(null);
            setSelectedFinding(null);
            return;
        }
        if (pollRef.current) {
            clearTimeout(pollRef.current);
        }
        const poll = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${toolsApiBase}/tools/jobs/${selectedJobId}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`Tools API error: ${res.status}`);
                }
                const data = await res.json();
                setActiveScan(buildScanFromJob(data, selectedMeta));
                if (data.status === "running") {
                    pollRef.current = setTimeout(poll, 2000);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to fetch job results");
            } finally {
                setLoading(false);
            }
        };
        poll();
        return () => {
            if (pollRef.current) {
                clearTimeout(pollRef.current);
            }
        };
    }, [selectedJobId, selectedMeta, toolsApiBase]);

    useEffect(() => {
        if (activeScan?.findings?.length) {
            setSelectedFinding(activeScan.findings[0]);
        } else {
            setSelectedFinding(null);
        }
    }, [activeScan]);

    const filteredFindings = useMemo(() => {
        const findings = activeScan?.findings || [];
        if (!filterText) return findings;
        const query = filterText.toLowerCase();
        return findings.filter(f =>
            f.title.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query)
        );
    }, [activeScan, filterText]);

    const header = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                    <span>Reports</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="uppercase tracking-wider font-semibold text-cyan-400">{scanLabel.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-cyan-500" />
                        Scan Results
                    </h1>
                    <select
                        className="bg-zinc-900 border border-white/10 text-zinc-300 rounded p-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                        value={selectedJobId || ""}
                        onChange={(e) => handleScanChange(e.target.value)}
                        disabled={jobHistory.length === 0}
                    >
                        {jobHistory.length === 0 ? (
                            <option value="">No scans yet</option>
                        ) : jobHistory.map(scan => (
                            <option key={scan.job_id} value={scan.job_id}>
                                {(scan.tool_name || scan.tool_id || "Tool").replace('_', ' ').toUpperCase()} - {scan.target || 'Target'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-300">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button
                    className="bg-cyan-600 hover:bg-cyan-500 text-white"
                    onClick={() => activeScan && generatePDFResult(activeScan)}
                    disabled={!activeScan}
                >
                    <Download className="w-4 h-4 mr-2" /> Export
                </Button>
            </div>
        </div>
    );

    if (!activeScan) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 p-4 md:p-8 bg-black/40 text-zinc-100">
                {header}
                <Card className="bg-zinc-900/40 border-white/10">
                    <CardContent className="p-8 text-center text-zinc-400">
                        {loading && <p>Loading scan results...</p>}
                        {!loading && error && <p>{error}</p>}
                        {!loading && !error && (
                            <p>
                                {jobHistory.length === 0
                                    ? "Run a tool to generate results."
                                    : "Select a scan to view results."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 p-4 md:p-8 bg-black/40 text-zinc-100">

            {/* HEADER SECTION */}
            {header}

            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-zinc-900/50 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase font-mono">Risk Score</p>
                            <p className={cn("text-2xl font-bold", activeScan.summary.risk_score > 70 ? "text-red-500" : "text-emerald-400")}>
                                {activeScan.summary.risk_score}/100
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-zinc-700" />
                    </CardContent>
                </Card>
                <Card className="bg-red-950/20 border-red-500/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-400 uppercase font-mono">High/Crit</p>
                            <p className="text-2xl font-bold text-red-500">
                                {(activeScan.kpis?.critical || 0) + (activeScan.kpis?.high || 0)}
                            </p>
                        </div>
                        <ShieldAlert className="w-8 h-8 text-red-900/50" />
                    </CardContent>
                </Card>

                {/* Scan Info */}
                <Card className="bg-zinc-900/50 border-white/10 col-span-2">
                    <CardContent className="p-4 flex flex-col justify-center h-full">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-zinc-400">Target:</span>
                            <span className="font-mono text-cyan-400">{scanTargetLabel}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Time:</span>
                            <span className="text-zinc-300">{scanTimestamp ? new Date(scanTimestamp).toLocaleString() : "--"}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-white/10">
                    <CardContent className="p-4 flex flex-col justify-center h-full items-center text-center">
                        <div className="text-xs text-zinc-500 uppercase font-mono mb-1">Status</div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                            {activeScan.summary.status.toUpperCase()}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* SPECIAL VIEWS FOR ADVANCED TOOLS */}

            {/* 1. C2 SIMULATOR TIMELINE */}
            {activeScan.simulated_timeline && (
                <div className="bg-zinc-900/40 p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-red-400" /> Attack Simulation Timeline
                    </h3>
                    <div className="flex items-center gap-4 overflow-x-auto pb-4">
                        {activeScan.simulated_timeline.map((step) => (
                            <div key={step.step} className="min-w-[200px] p-3 bg-zinc-950/50 border border-white/5 rounded relative group hover:border-red-500/40 transition-colors">
                                <div className="absolute top-2 right-2 text-xs font-mono text-zinc-600">T{step.step}</div>
                                <div className="text-xs text-red-400 font-bold uppercase mb-1">{step.technique}</div>
                                <div className="text-sm text-zinc-300 font-semibold mb-1">{step.label}</div>
                                <div className="text-xs text-zinc-500 group-hover:text-zinc-400">{step.result}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. HONEYPOT EVENTS */}
            {activeScan.events && (
                <div className="bg-zinc-900/40 p-4 border border-white/10 rounded-lg max-h-[200px] overflow-auto">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-orange-400" /> Captured Events
                    </h3>
                    <table className="w-full text-sm text-left text-zinc-400">
                        <thead className="text-xs text-zinc-500 uppercase bg-black/20">
                            <tr>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Source IP</th>
                                <th className="px-4 py-2">Geo</th>
                                <th className="px-4 py-2">Attack Type</th>
                                <th className="px-4 py-2">Evidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeScan.events.map((evt, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-4 py-2 font-mono text-xs">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-4 py-2 font-mono text-cyan-400">{evt.source_ip}</td>
                                    <td className="px-4 py-2">{evt.geo}</td>
                                    <td className="px-4 py-2 text-zinc-200">{evt.attack_type}</td>
                                    <td className="px-4 py-2 text-xs italic">{evt.evidence}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MAIN CONTENT: 3-COLUMN LAYOUT */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">

                {/* LEFT: FILTERS */}
                <div className="hidden md:block md:col-span-2 space-y-4">
                    <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-2">Findings Filter</div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-white/5 rounded-md border border-white/10">
                            <span>Total</span>
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{activeScan.summary.total_findings || 0}</Badge>
                        </div>
                        {activeScan.kpis && (
                            <>
                                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-white/5 cursor-pointer text-zinc-400">
                                    <span>Critical</span>
                                    <Badge variant="outline" className="text-red-500 border-red-900">{activeScan.kpis.critical || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-white/5 cursor-pointer text-zinc-400">
                                    <span>High</span>
                                    <Badge variant="outline" className="text-orange-500 border-orange-900">{activeScan.kpis.high || 0}</Badge>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* MIDDLE: FINDINGS LIST */}
                <div className="md:col-span-4 flex flex-col min-h-0 border-r border-white/10 pr-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-2 top-2.5 text-zinc-500" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 bg-zinc-900/50 border-white/10 text-sm"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 pr-3">
                        <div className="space-y-3">
                            {filteredFindings.length > 0 ? filteredFindings.map((finding) => (
                                <div
                                    key={finding.id}
                                    onClick={() => setSelectedFinding(finding)}
                                    className={cn(
                                        "p-4 rounded-lg border cursor-pointer transition-all hover:translate-y-[-2px]",
                                        selectedFinding?.id === finding.id
                                            ? "bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                            : "bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={cn("text-xs font-mono uppercase rounded-sm px-2 py-0.5", getSeverityColor(finding.severity))}>
                                            {finding.severity}
                                        </Badge>
                                        <span className="text-xs font-mono text-zinc-500">{finding.id}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-200 line-clamp-2 mb-1 leading-snug">
                                        {finding.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                                        {finding.description}
                                    </p>
                                </div>
                            )) : (
                                <div className="text-center text-zinc-500 py-8">
                                    <p>No findings to display.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* RIGHT: DETAILS PANEL */}
                <div className="md:col-span-6 flex flex-col min-h-0 pl-2">
                    {selectedFinding ? (
                        <ScrollArea className="h-full">
                            <div className="space-y-6 pb-10">
                                {/* Title & Actions */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={cn("text-sm font-bold uppercase px-3 py-1", getSeverityColor(selectedFinding.severity))}>
                                            {selectedFinding.severity} Level
                                        </Badge>
                                        {selectedFinding.mitre && (
                                            <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-xs">
                                                MITRE {selectedFinding.mitre[0]}
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-4">{selectedFinding.title}</h2>
                                </div>

                                {/* Description */}
                                <div className="bg-zinc-900/30 p-4 rounded-lg border border-white/5">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-2">
                                        <FileText className="w-4 h-4 text-cyan-500" /> Description
                                    </h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        {selectedFinding.description}
                                    </p>
                                </div>

                                {/* Recommendation */}
                                <div className="bg-emerald-950/10 p-4 rounded-lg border border-emerald-500/20">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
                                        <CheckCircle className="w-4 h-4" /> Recommendation
                                    </h3>
                                    <p className="text-sm text-zinc-300">
                                        {selectedFinding.recommendation}
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a finding to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
