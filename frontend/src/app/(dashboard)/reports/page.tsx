"use client";

import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    Shield,
    BarChart3,
    PieChart,
    Share2,
    Eye
} from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock Data
const reports = [
    { id: 'RPT-2025-001', title: 'Monthly Security Executive Summary', type: 'Executive', date: '2025-05-01', status: 'Finalized', size: '2.4 MB' },
    { id: 'RPT-2025-002', title: 'Incident Response Post-Mortem: #INC-442', type: 'Incident', date: '2025-04-28', status: 'Draft', size: '1.1 MB' },
    { id: 'RPT-2025-003', title: 'Q1 Compliance Audit (ISO 27001)', type: 'Compliance', date: '2025-04-15', status: 'Finalized', size: '14.2 MB' },
    { id: 'RPT-2025-004', title: 'Weekly Vulnerability Assessment', type: 'Technical', date: '2025-05-05', status: 'Generated', size: '4.8 MB' },
    { id: 'RPT-2025-005', title: 'Threat Intelligence Landscape Update', type: 'Intelligence', date: '2025-05-06', status: 'Finalized', size: '3.2 MB' },
];

const reportTypes = ['All', 'Executive', 'Incident', 'Compliance', 'Technical', 'Intelligence'];

export default function ReportsPage() {
    const [selectedType, setSelectedType] = useState('All');

    const filteredReports = selectedType === 'All'
        ? reports
        : reports.filter(r => r.type === selectedType);

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 pt-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-p-500/10 border border-p-500/20 flex items-center justify-center text-p-400 shadow-[0_0_15px_rgba(167,139,250,0.2)]">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Governance & Reporting</span>
                    </div>
                    <h1 className="text-display mb-1 text-white">
                        Mission <span className="text-p-400">Reports</span>
                    </h1>
                    <p className="text-body text-text-3 font-medium uppercase tracking-widest max-w-xl">
                        Centralized repository for operational intelligence and compliance artifacts.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                    <button className="h-12 px-6 rounded-xl bg-bg-2/50 border border-border-1 flex items-center gap-3 text-text-2 hover:text-white hover:border-text-2 hover:bg-bg-3 transition-all group">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Generate New Report</span>
                        <FileText className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-2 rounded-xl flex overflow-x-auto gap-2 no-scrollbar">
                {reportTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-transparent",
                            selectedType === type
                                ? "bg-white text-black shadow-lg"
                                : "text-text-3 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            <div className="glass-card rounded-2xl overflow-hidden border border-border-1 relative">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-bg-0/50" />

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-1/50 border-b border-border-1">
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Reference ID</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Report Title</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Generated Date</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Size</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-4 text-[9px] font-black text-text-3 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-1/50">
                            {filteredReports.map((report) => (
                                <motion.tr
                                    key={report.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="group hover:bg-p-600/5 transition-all cursor-pointer"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-[10px] font-mono text-text-3/60">{report.id}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-bold text-white tracking-tight group-hover:text-p-400 transition-colors flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 opacity-50" />
                                            {report.title}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[9px] font-black text-text-2 uppercase tracking-tight">{report.type}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-[10px] font-mono text-text-3/60">{report.date}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-mono text-text-3/60">{report.size}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                            report.status === 'Finalized' ? "text-success border-success/20 bg-success/10" :
                                                report.status === 'Draft' ? "text-warning border-warning/20 bg-warning/10" :
                                                    "text-info border-info/20 bg-info/10"
                                        )}>
                                            <div className={cn("h-1 w-1 rounded-full",
                                                report.status === 'Finalized' ? "bg-success" :
                                                    report.status === 'Draft' ? "bg-warning" : "bg-info"
                                            )} />
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-p-400 hover:bg-p-600/20 transition-all">
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            <button className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-p-400 hover:bg-p-600/20 transition-all">
                                                <Download className="h-3.5 w-3.5" />
                                            </button>
                                            <button className="h-8 w-8 rounded-lg bg-bg-2 border border-border-1 flex items-center justify-center text-text-3 hover:text-white hover:border-p-400 hover:bg-p-600/20 transition-all">
                                                <Share2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
