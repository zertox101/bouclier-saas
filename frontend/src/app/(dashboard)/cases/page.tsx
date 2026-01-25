"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type CaseSummary = {
    id: string
    title: string
    status: string
    assigned_to?: string
    created_at: string
}

export default function CasesPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"
    const [cases, setCases] = useState<CaseSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCases = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${apiBase}/cases?limit=50`)
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                const data = await res.json()
                setCases(
                    Array.isArray(data)
                        ? data.map((item: any) => ({
                              id: item.id,
                              title: item.title,
                              status: item.status || "triage",
                              assigned_to: item.assigned_to,
                              created_at: new Date(item.created_at).toLocaleString(),
                          }))
                        : []
                )
                setError(null)
            } catch (err) {
                console.error(err)
                setCases([])
                setError("Unable to load cases.")
            } finally {
                setLoading(false)
            }
        }
        fetchCases()
    }, [apiBase])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Case workspace</h1>
                    <p className="text-slate-400 text-sm">Track investigations derived from alerts.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Refresh
                </Button>
            </div>

            {loading && <div className="text-slate-400">Loading cases…</div>}
            {error && !loading && <div className="text-red-400">{error}</div>}
            {!loading && cases.length === 0 && (
                <div className="rounded border border-dashed border-slate-800 p-6 text-center text-slate-400">
                    No cases yet. Convert an alert to a case to get started.
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {cases.map((item) => (
                    <Card key={item.id} className="border border-slate-800 bg-slate-950/40">
                        <div className="space-y-2 p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                                <Badge variant={item.status === "closed" ? "secondary" : "outline"}>{item.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500">Assigned to {item.assigned_to || "—"}</p>
                            <p className="text-xs font-mono text-slate-500">Opened {item.created_at}</p>
                            <div className="flex gap-2 pt-2">
                                <Link href={`/app/cases/${item.id}`}>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                        View case
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
