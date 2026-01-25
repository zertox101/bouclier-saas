"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AlertDetail = {
    id: string
    rule_id: string
    severity: string
    state: string
    created_at: string
    dedup_key?: string
    evidence?: any
}

export default function AlertDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"
    const [alert, setAlert] = useState<AlertDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [caseTitle, setCaseTitle] = useState("")

    useEffect(() => {
        const fetchAlert = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${apiBase}/alerts/${params.id}`)
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                const data = await res.json()
                setAlert({
                    id: data.id,
                    rule_id: data.rule_id,
                    severity: data.severity?.toLowerCase() || "medium",
                    state: data.state || "new",
                    created_at: new Date(data.created_at).toLocaleString(),
                    dedup_key: data.dedup_key,
                    evidence: data.evidence,
                })
                setCaseTitle(`Investigation · ${data.rule_id}`)
                setError(null)
            } catch (err) {
                console.error(err)
                setError("Unable to load alert detail.")
                setAlert(null)
            } finally {
                setLoading(false)
            }
        }
        fetchAlert()
    }, [apiBase, params.id])

    const createCase = async () => {
        if (!alert) return
        setCreating(true)
        try {
            const res = await fetch(`${apiBase}/cases/from-alert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    alert_id: alert.id,
                    title: caseTitle,
                    assigned_to: "analyst@example.com",
                    checklist: ["Review evidence", "Validate owner", "Document response"],
                }),
            })
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }
            const data = await res.json()
            router.push(`/app/cases/${data.id}`)
        } catch (err) {
            console.error(err)
            setError("Unable to create case from alert.")
        } finally {
            setCreating(false)
        }
    }

    const timeline = alert?.evidence?.timeline || alert?.evidence?.events || []
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Alert detail</h1>
                <p className="text-slate-400 text-sm">Inspect evidence and convert to a case.</p>
            </div>

            {loading && <div className="text-slate-400">Loading alert…</div>}
            {error && !loading && <div className="text-red-400">{error}</div>}
            {!loading && !alert && !error && <div className="text-slate-500">Alert not found.</div>}

            {alert && (
                <section className="space-y-6 rounded border border-slate-800 bg-slate-950/50 p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h2 className="text-xl font-semibold text-white">{alert.rule_id}</h2>
                        <Badge variant={alert.severity === "critical" || alert.severity === "high" ? "destructive" : "secondary"}>
                            {alert.severity?.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-xs text-slate-500">status: {alert.state}</span>
                        <span className="font-mono text-xs text-slate-500">dedup: {alert.dedup_key?.slice(-8) || "n/a"}</span>
                        <span className="font-mono text-xs text-slate-500">created: {alert.created_at}</span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Evidence: {(alert.evidence?.summary as string) || "Details captured by detection."}
                        </p>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Case title</label>
                                <Input
                                    value={caseTitle}
                                    onChange={(event) => setCaseTitle(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={createCase} disabled={creating}>
                            {creating ? "Creating case…" : "Create Case"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/app/alerts")}>
                            Back to Alerts
                        </Button>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">Timeline</h3>
                        {timeline.length === 0 && <p className="text-slate-500">No timeline data yet.</p>}
                        <ul className="space-y-2">
                            {timeline.map((item: any, index: number) => (
                                <li key={`${item.timestamp}-${index}`} className="rounded border border-slate-800 px-4 py-3 text-sm text-slate-200">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{new Date(item.timestamp || alert.created_at).toLocaleString()}</span>
                                        <span className="font-mono">{item.type || "event"}</span>
                                    </div>
                                    <p className="text-slate-300">{item.note || item.description || item.message || "Captured event"}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </div>
    )
}
