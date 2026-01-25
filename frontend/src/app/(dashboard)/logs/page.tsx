"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { Brain, FileText, Search, AlertCircle, CheckCircle } from "lucide-react"
export default function LogsPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    const [logs, setLogs] = useState<any[]>([])
    const [stats, setStats] = useState({ total: 0, critical: 0, high: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<{
        summary: string;
        threats: string[];
        recommendations: string[];
        riskScore?: number;
    } | null>(null)

    const handleAnalyze = async () => {
        if (logs.length === 0) {
            return
        }
        setIsAnalyzing(true)
        setError(null)
        try {
            const logText = logs
                .map((entry: any) => entry.message)
                .filter(Boolean)
                .join("\n")
            const res = await fetch(`${apiBase}/api/sentinel/analyze-tools`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tool_name: "log_review",
                    logs: logText
                })
            })
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }
            const data = await res.json()
            setAnalysis({
                summary: data.summary,
                threats: data.threats || [],
                recommendations: data.recommendations || [],
                riskScore: data.riskScore
            })
        } catch (err) {
            setError("AI analysis failed.")
            setAnalysis(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const calculateStats = (items: any[]) => {
        const crit = items.filter((l: any) => (l.severity || "").toLowerCase() === 'critical').length
        const high = items.filter((l: any) => (l.severity || "").toLowerCase() === 'high').length
        return { total: items.length, critical: crit, high: high }
    }

    // Polling Logic
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setError(null)
                const res = await fetch(`${apiBase}/api/events/logs?limit=200`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                const mappedLogs = (Array.isArray(data) ? data : []).map((entry: any, idx: number) => ({
                    id: entry.id ? `LOG-${entry.id}` : `LOG-${1000 + idx}`,
                    time: new Date((entry.timestamp_epoch || Date.now() / 1000) * 1000).toLocaleTimeString(),
                    source: entry.host || entry.user || entry.src_ip || "unknown",
                    event: entry.event_type || "event",
                    severity: (entry.severity || "low").toLowerCase(),
                    message: entry.details?.message || entry.details?.summary || entry.status || "",
                }));
                setLogs(mappedLogs);
                setStats(calculateStats(mappedLogs));
            } catch (e) {
                console.error("Failed to fetch live logs", e);
                setLogs([])
                setStats({ total: 0, critical: 0, high: 0 })
                setError("Failed to load logs.")
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchLogs();

        // Poll every 3 seconds
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [apiBase]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="text-cyan-400" /> Security Logs
                    </h1>
                    <p className="text-slate-400">Immutable audit trail analysis</p>
                </div>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="cyber">
                    {isAnalyzing ? <Brain className="w-4 h-4 mr-2 animate-pulse" /> : <Brain className="w-4 h-4 mr-2" />}
                    Run AI Analysis
                </Button>
            </div>

            {/* AI Analysis Panel */}
            {analysis && (
                <Card className="border-cyan-500/30 bg-cyan-500/5 animate-in slide-in-from-top-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-mono text-cyan-400 uppercase flex items-center gap-2">
                            <Brain className="w-4 h-4" /> AI Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-200 text-sm leading-relaxed">{analysis.summary}</p>
                        {analysis.threats.length > 0 && (
                            <div className="mt-3 text-sm text-slate-300">
                                <div className="text-xs uppercase text-red-400 mb-1">Threats</div>
                                <ul className="list-disc list-inside space-y-1">
                                    {analysis.threats.map((item, idx) => (
                                        <li key={`${item}-${idx}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis.recommendations.length > 0 && (
                            <div className="mt-3 text-sm text-slate-300">
                                <div className="text-xs uppercase text-emerald-400 mb-1">Recommendations</div>
                                <ul className="list-disc list-inside space-y-1">
                                    {analysis.recommendations.map((item, idx) => (
                                        <li key={`${item}-${idx}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            {error && (
                <div className="text-sm text-red-400">{error}</div>
            )}

            {/* Filters */}
            <Card>
                <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input placeholder="Search logs..." className="pl-10" />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="firewall">Firewall</SelectItem>
                            <SelectItem value="auth">Auth Service</SelectItem>
                            <SelectItem value="waf">WAF</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Logs Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead className="text-right">Hash/Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">No logs found</TableCell>
                            </TableRow>
                        )}
                        {logs.map((log) => (
                            <TableRow key={log.id} className="group cursor-pointer hover:bg-red-950/10">

                                <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                <TableCell>{log.source}</TableCell>
                                <TableCell className="font-mono text-cyan-400">{log.event}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            (log.severity || "").toLowerCase() === 'critical' ? 'critical' :
                                                (log.severity || "").toLowerCase() === 'high' ? 'destructive' :
                                                    (log.severity || "").toLowerCase() === 'medium' ? 'warning' : 'secondary'
                                        }
                                        className="uppercase text-[10px]"
                                    >
                                        {(log.severity || "low").toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs text-slate-400 group-hover:text-white transition-colors max-w-[300px] truncate">
                                    {log.message}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
