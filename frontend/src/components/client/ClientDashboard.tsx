"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Shield, CheckCircle2, Clock, AlertTriangle,
    ArrowRight, TrendingUp, FileText, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { ClientIncident } from "@/lib/viewMode";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT INCIDENT CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ClientIncidentCard({ incident }: { incident: ClientIncident }) {
    const statusConfig = {
        secure: {
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        investigating: {
            icon: <Clock className="w-5 h-5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        "at-risk": {
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        }
    };

    const config = statusConfig[incident.protectionStatus];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white rounded-2xl border shadow-sm overflow-hidden",
                config.border
            )}
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", config.bg, config.color)}>
                        {config.icon}
                    </div>
                    <span className="text-xs text-slate-400">{incident.lastUpdate}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        incident.protectionStatus === 'secure'
                            ? "bg-emerald-100 text-emerald-700"
                            : incident.protectionStatus === 'investigating'
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                    )}>
                        {incident.statusLabel}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900">{incident.title}</h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                    {incident.summary}
                </p>

                {/* Business Impact */}
                <div className="p-4 rounded-xl bg-slate-50">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Business Impact
                    </span>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                        {incident.businessImpact}
                    </p>
                </div>

                {/* Actions Taken */}
                <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Actions Taken
                    </span>
                    <ul className="mt-2 space-y-2">
                        {incident.actionsTaken.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-700">{action}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className={cn("w-5 h-5", config.color)} />
                        <span className="text-sm font-medium text-slate-700">
                            {incident.protectionStatus === 'secure'
                                ? "Your systems are protected"
                                : "Protection in progress"}
                        </span>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROTECTION STATUS HERO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ProtectionStatusHero() {
    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Organization is Protected</h2>
                    <p className="text-slate-600 mt-1">
                        All systems are monitored 24/7. No active threats detected.
                    </p>
                </div>

                <div className="ml-auto text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Last Scan</p>
                    <p className="text-sm font-medium text-slate-700">2 minutes ago</p>
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUMMARY STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SummaryStats() {
    const stats = [
        {
            label: "Threats Blocked",
            value: "127",
            subtext: "This month",
            icon: <Shield className="w-5 h-5" />,
            color: "text-emerald-600 bg-emerald-100"
        },
        {
            label: "Response Time",
            value: "< 5 min",
            subtext: "Average",
            icon: <Clock className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-100"
        },
        {
            label: "Uptime",
            value: "99.9%",
            subtext: "Last 30 days",
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-indigo-600 bg-indigo-100"
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                        {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stat.subtext}</p>
                </div>
            ))}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CLIENT DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ClientDashboard() {
    const [incidents, setIncidents] = useState<ClientIncident[]>([]);

    useEffect(() => {
        apiClient("/api/client/incidents")
            .then(d => {
                if (d.incidents?.length > 0) {
                    setIncidents(d.incidents.map((i: any) => ({
                        id: i.id,
                        title: i.title,
                        impactLevel: i.severity === "critical" ? "Critical Business Risk" : i.severity === "high" ? "High Business Risk" : i.severity === "medium" ? "Moderate Concern" : "Low Impact",
                        statusLabel: i.status === "resolved" ? "Threat Contained" : i.status === "investigating" ? "Being Analyzed" : "Active Threat",
                        summary: i.title,
                        businessImpact: i.business_impact || "Under assessment",
                        actionsTaken: i.actions_taken || ["Investigation in progress"],
                        protectionStatus: i.status === "resolved" ? "secure" : i.status === "investigating" ? "investigating" : "at-risk",
                        lastUpdate: i.detected_at ? new Date(i.detected_at).toLocaleDateString() : "Unknown",
                    })));
                }
            })
            .catch(() => {});
    }, []);

    const displayIncidents = incidents.length > 0 ? incidents : [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">Security Portal</p>
                            <p className="text-xs text-slate-500">Acme Corporation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                            <FileText className="w-4 h-4" />
                            Monthly Report
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-8 space-y-6">
                <ProtectionStatusHero />

                <SummaryStats />

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Security Events</h2>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {displayIncidents.map(incident => (
                            <ClientIncidentCard key={incident.id} incident={incident} />
                        ))}
                    </div>
                </div>

                {/* Trust Banner */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">24/7 Security Monitoring</h3>
                            <p className="text-indigo-200 text-sm mt-1">
                                Our SOC team is actively protecting your organization around the clock.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
                            Contact Security Team
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
