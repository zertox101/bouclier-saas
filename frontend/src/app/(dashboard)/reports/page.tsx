"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Filter, Clock, AlertTriangle, BarChart3, FileJson } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const REPORT_TYPES = [
  { id: "all", name: "All Reports" },
  { id: "soc-executive", name: "SOC Executive" },
  { id: "soc-daily", name: "SOC Daily" },
  { id: "soc-weekly", name: "SOC Weekly" },
  { id: "soc-monthly", name: "SOC Monthly" },
  { id: "pentest-executive", name: "Pentest Executive" },
  { id: "pentest-technical", name: "Pentest Technical" },
  { id: "pentest-compliance", name: "Compliance" },
  { id: "mythos-kill-chain", name: "Mythos Kill Chain" },
];

function ReportIcon({ type }: { type: string }) {
  if (type.startsWith("soc")) return <BarChart3 className="w-4 h-4 text-blue-400" />;
  if (type.startsWith("pentest")) return <AlertTriangle className="w-4 h-4 text-red-400" />;
  return <FileText className="w-4 h-4 text-purple-400" />;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient("/api/reports/history").catch(() => ({ reports: [] })),
      apiClient("/api/reports/templates").catch(() => ({ templates: [] })),
    ]).then(([h, t]) => {
      setReports((h as any).reports || []);
      setTemplates((t as any).templates || []);
      setLoading(false);
    });
  }, []);

  const filtered = reports.filter(r => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      const resp = await fetch(`http://localhost:8005/api/reports/generate/${type}`, { credentials: "include" });
      const html = await resp.text();
      setPreviewHtml(html);
    } catch (e) {
      alert("Failed to generate report");
    }
    setGenerating(null);
  };

  const exportJson = async (type: string) => {
    try {
      const data = await apiClient(`/api/reports/generate/${type}/json`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `report-${type}-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export JSON");
    }
  };

  if (previewHtml) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Report Preview</h1>
          <button onClick={() => setPreviewHtml(null)} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">Back</button>
        </div>
        <iframe srcDoc={previewHtml} className="w-full h-[calc(100vh-120px)] bg-white rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <FileText className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Advanced Reports</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white">
          {REPORT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white">
          <option value="all">All Status</option>
          <option value="final">Final</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
        </select>
      </div>

      {templates.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Generate Report</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((t: any) => (
              <motion.button key={t.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => generateReport(t.id)} disabled={generating === t.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-left hover:border-purple-500/40 transition-all disabled:opacity-50">
                <div className="flex items-center gap-2">
                  <ReportIcon type={t.id} />
                  <span className="text-sm font-medium text-white">{t.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-purple-400 flex items-center gap-1">
                    {generating === t.id ? "Generating..." : "HTML"}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); exportJson(t.id); }}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1">
                    <FileJson className="w-3 h-3" /> JSON
                  </button>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Report History ({filtered.length})</h2>
        <div className="grid gap-2">
          {filtered.map((r, i) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ReportIcon type={r.type} />
                    <h3 className="text-sm font-bold text-white">{r.title}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${r.status === "final" ? "bg-green-500/10 text-green-400 border-green-500/20" : r.status === "draft" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>{r.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(r.created_at).toLocaleDateString()}</span>
                    <span>{r.data_range || "24h"}</span>
                    <span>{r.findings_count || 0} findings</span>
                    <span className={`${(r.risk_score || 0) > 60 ? "text-red-400" : (r.risk_score || 0) > 30 ? "text-amber-400" : "text-green-400"}`}>Risk: {r.risk_score || "?"}/100</span>
                    <span className="text-slate-500">{r.generated_by || "System"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => generateReport(r.type)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all" title="View report">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={() => exportJson(r.type)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all" title="Download JSON">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-8">No reports match your filters</p>
          )}
          {loading && <p className="text-xs text-slate-500 text-center py-8">Loading reports...</p>}
        </div>
      </div>
    </div>
  );
}
