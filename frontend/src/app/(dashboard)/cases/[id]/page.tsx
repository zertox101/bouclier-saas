"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function CaseDetailPage({ params }: { params: { id: string } }) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"
    const [caseData, setCaseData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCase = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${apiBase}/cases/${params.id}`)
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                setCaseData(await res.json())
                setError(null)
            } catch (err) {
                console.error(err)
                setCaseData(null)
                setError("Unable to load case.")
            } finally {
                setLoading(false)
            }
        }
        fetchCase()
    }, [apiBase, params.id])

    const timeline = caseData?.timeline || []
    const linkedAlerts = caseData?.alerts || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{caseData?.title || "Case detail"}</h1>
                    <p className="text-slate-400 text-sm">Linked alerts and timeline.</p>
                </div>
                <Link href="/app/cases">
                    <Button variant="ghost" size="sm">
                        Back to cases
                    </Button>
                </Link>
            </div>

            {loading && <div className="text-slate-400">Loading case…</div>}
            {error && !loading && <div className="text-red-400">{error}</div>}
            {!loading && !caseData && !error && <div className="text-slate-500">Case not found.</div>}

            {caseData && (
                <>
                    <section className="space-y-3 rounded border border-slate-800 bg-slate-950/50 p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <Badge variant={caseData.status === "closed" ? "secondary" : "outline"}>
                                {caseData.status || "triage"}
                            </Badge>
                            <span className="font-mono text-xs text-slate-500">Assigned to {caseData.assigned_to || "—"}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Checklist: {Array.isArray(caseData.checklist) ? caseData.checklist.join(" • ") : "No checklist yet"}
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-white">Linked alerts</h2>
                        {linkedAlerts.length === 0 ? (
                            <p className="text-slate-500">No alerts linked yet.</p>
                        ) : (
                            <div className="grid gap-3">
                                {linkedAlerts.map((alert: any) => (
                                    <Link key={alert.id} href={`/app/alerts/${alert.id}`}>
                                        <div className="rounded border border-slate-800 p-3 bg-slate-900/40 hover:border-white">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-white">{alert.rule_id}</p>
                                                <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                                                    {alert.severity?.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500">state {alert.state || "new"}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold text-white">Timeline</h2>
                        {timeline.length === 0 ? (
                            <p className="text-slate-500">No timeline entries yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {timeline.map((entry: any, idx: number) => (
                                    <li key={`${entry.timestamp}-${idx}`} className="rounded border border-slate-800 p-3 bg-slate-900/40">
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                            <span>{entry.actor || "system"}</span>
                                        </div>
                                        <p className="text-sm text-slate-200">{entry.note || entry.description || "Case update"}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}
