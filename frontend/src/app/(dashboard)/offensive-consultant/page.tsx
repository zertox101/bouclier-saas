"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Crosshair, Bug, Search, FileText, FolderOpen, Wrench, Download, Activity, Siren, AlertTriangle, Target, Server, GitBranch, Radio, HardDrive, Globe, Lock, Wifi } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useOffensiveWS } from "@/hooks/useOffensiveWS";

const ENG_CATEGORIES: Record<string, { icon: any; color: string }> = {
  "red-team": { icon: Crosshair, color: "text-red-400" },
  "purple-team": { icon: Siren, color: "text-purple-400" },
  "bug-bounty": { icon: Bug, color: "text-amber-400" },
  "re-engineering": { icon: GitBranch, color: "text-cyan-400" },
  "forensics": { icon: HardDrive, color: "text-orange-400" },
  "malware-analysis": { icon: Radio, color: "text-pink-400" },
  "exploit-dev": { icon: Lock, color: "text-rose-400" },
};

const SEV_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function OffensiveConsultantPage() {
  const router = useRouter();
  const { isConnected, lastStats, subscribeStats } = useOffensiveWS({ autoConnect: true });
  const [status, setStatus] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [engFilter, setEngFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient("/api/offensive/status").catch(() => null),
      apiClient("/api/offensive/dashboard").catch(() => null),
      apiClient("/api/offensive/engagements").catch(() => ({ engagements: [] })),
      apiClient("/api/offensive/findings").catch(() => ({ findings: [] })),
      apiClient("/api/offensive/tools").catch(() => ({ tools: [] })),
    ]).then(([s, d, e, f, t]) => {
      setStatus(s);
      setDashboard(d);
      setEngagements((e as any).engagements || []);
      setFindings((f as any).findings || []);
      setTools((t as any).tools || []);
      setLoading(false);
    });
    setTimeout(() => subscribeStats(), 1000);
  }, []);

  const filteredEng = engagements.filter((e: any) => engFilter === "all" || e.type === engFilter);
  const filteredFindings = findings.filter((f: any) => sevFilter === "all" || f.severity === sevFilter);

  const generateHtmlReport = async (engId: string) => {
    try {
      const resp = await fetch(`http://localhost:8005/api/offensive/report/html/${engId}`, { credentials: "include" });
      const html = await resp.text();
      setPreviewHtml(html);
    } catch (e) {
      alert("Failed to generate report");
    }
  };

  if (previewHtml) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Offensive Report Preview</h1>
          <button onClick={() => setPreviewHtml(null)} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">Back</button>
        </div>
        <iframe srcDoc={previewHtml} className="w-full h-[calc(100vh-120px)] bg-white rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Shield className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Offensive Security Consultant</h1>
          {status && <p className="text-xs text-slate-400">{status.role} | {status.capabilities.length} capabilities | {status.tools_count} tools</p>}
        </div>
        {lastStats && (
          <span className="text-[9px] text-cyan-500/60 ml-auto">WS updated: {new Date(lastStats.timestamp).toLocaleTimeString()}</span>
        )}
        {status && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {status.status}
            <span className={`ml-2 flex items-center gap-1 text-[9px] ${isConnected ? "text-cyan-400" : "text-slate-500"}`}>
              <span className={`w-1 h-1 rounded-full ${isConnected ? "bg-cyan-400" : "bg-slate-500"}`} />
              WS {isConnected ? "Live" : "Off"}
            </span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 pb-1">
        {[
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "engagements", label: "Engagements", icon: Target },
          { id: "findings", label: "Findings", icon: AlertTriangle },
          { id: "tools", label: "Toolkit", icon: Wrench },
          { id: "scanner", label: "Scanner", icon: Radio },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-medium transition-all ${
              tab === t.id ? "bg-slate-800 text-white border-b-2 border-purple-500" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard Tab ── */}
      {tab === "dashboard" && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Engagements</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.engagements?.total || 0}</div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-green-400">{dashboard.engagements?.active || 0} active</span>
                <span className="text-amber-400">{dashboard.engagements?.planning || 0} planning</span>
                <span className="text-blue-400">{dashboard.engagements?.completed || 0} done</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Findings</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.findings?.total || 0}</div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-red-400">{dashboard.findings?.by_severity?.critical || 0} critical</span>
                <span className="text-orange-400">{dashboard.findings?.by_severity?.high || 0} high</span>
                <span className="text-yellow-400">{dashboard.findings?.by_severity?.medium || 0} med</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Risk Score</span>
                <Siren className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.risk_score || 0}/10</div>
              <span className={`text-[10px] ${dashboard.risk_score >= 8 ? "text-red-400" : dashboard.risk_score >= 6 ? "text-orange-400" : dashboard.risk_score >= 3 ? "text-yellow-400" : "text-blue-400"}`}>
                {dashboard.risk_rating || "Unknown"}
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Toolkit</span>
                <Wrench className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.tool_count || 0}</div>
              <span className="text-[10px] text-green-400">all operational</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-slate-300 mb-3">Engagements by Type</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.engagements?.by_type || {}).map(([type, count]: any) => {
                  const cat = ENG_CATEGORIES[type] || { icon: FileText, color: "text-slate-400" };
                  const Icon = cat.icon;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-slate-300">
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        {type.replace("-", " ")}
                      </span>
                      <span className="text-xs font-bold text-white">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-slate-300 mb-3">Findings by Severity</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.findings?.by_severity || {}).map(([sev, count]: any) => (
                  <div key={sev} className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${SEV_STYLES[sev]?.split(" ")[1] || "text-slate-300"}`}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </span>
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Engagements Tab ── */}
      {tab === "engagements" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <select value={engFilter} onChange={e => setEngFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
              <option value="all">All Types</option>
              {Object.entries(ENG_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{k.replace("-", " ")}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            {filteredEng.map((e: any, i: number) => {
              const cat = ENG_CATEGORIES[e.type] || { icon: FileText, color: "text-slate-400" };
              const Icon = cat.icon;
              const statusColor = e.status === "active" ? "text-green-400" : e.status === "planning" ? "text-amber-400" : e.status === "completed" ? "text-blue-400" : "text-slate-400";
              return (
                <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-purple-500/30 transition-all cursor-pointer"
                  onClick={() => router.push(`/offensive-consultant/engagements/${e.id}`)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <h3 className="text-sm font-bold text-white">{e.title}</h3>
                        <span className={`text-[9px] ${statusColor}`}>{e.status}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" />{e.target}</span>
                        <span>{e.findings_count} findings</span>
                        <span>Risk: {e.risk_score}/100</span>
                        <span>{e.lead}</span>
                      </div>
                    </div>
                    <button onClick={(ev) => { ev.stopPropagation(); generateHtmlReport(e.id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-all">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filteredEng.length === 0 && !loading && <p className="text-xs text-slate-500 text-center py-8">No engagements found</p>}
          </div>
        </div>
      )}

      {/* ── Findings Tab ── */}
      {tab === "findings" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="grid gap-2">
            {filteredFindings.map((f: any, i: number) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => router.push(`/offensive-consultant/findings/${f.id}`)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{f.title}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${SEV_STYLES[f.severity] || "bg-slate-500/20 text-slate-300"}`}>{f.severity}</span>
                      <span className="text-[9px] text-slate-500">{f.cwe}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{f.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-500">
                      <span>{f.affected_asset}</span>
                      <span>CVSS: {f.cvss}</span>
                      <span>Conf: {f.confidence}%</span>
                      <span className={f.status === "open" ? "text-red-400" : f.status === "in_progress" ? "text-amber-400" : "text-green-400"}>{f.status}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredFindings.length === 0 && !loading && <p className="text-xs text-slate-500 text-center py-8">No findings match your filters</p>}
          </div>
        </div>
      )}

      {/* ── Tools Tab ── */}
      {tab === "tools" && (
        <div className="grid grid-cols-3 gap-3">
          {tools.map((t: any, i: number) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white">{t.name}</span>
                <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{t.category}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">{t.description}</p>
            </motion.div>
          ))}
          {tools.length === 0 && !loading && <p className="text-xs text-slate-500 text-center py-8 col-span-3">No tools loaded</p>}
        </div>
      )}

      {/* ── Scanner Tab ── */}
      {tab === "scanner" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
          <Radio className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Network Scanner</h2>
          <p className="text-sm text-slate-400 mb-6">Real-time nmap/masscan with live WebSocket streaming</p>
          <button onClick={() => router.push("/offensive-consultant/scanner")}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Open Scanner
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
