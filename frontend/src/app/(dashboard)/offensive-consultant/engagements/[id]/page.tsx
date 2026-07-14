"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Clock, AlertTriangle, CheckCircle, Wrench, GitBranch, User, FileText, Download, Radio, Globe, Server, HardDrive, Siren, Crosshair, Bug, Lock } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const ENG_CATEGORIES: Record<string, { icon: any; color: string }> = {
  "red-team": { icon: Crosshair, color: "text-red-400 bg-red-500/10" },
  "purple-team": { icon: Siren, color: "text-purple-400 bg-purple-500/10" },
  "bug-bounty": { icon: Bug, color: "text-amber-400 bg-amber-500/10" },
  "re-engineering": { icon: GitBranch, color: "text-cyan-400 bg-cyan-500/10" },
  "forensics": { icon: HardDrive, color: "text-orange-400 bg-orange-500/10" },
  "malware-analysis": { icon: Radio, color: "text-pink-400 bg-pink-500/10" },
  "exploit-dev": { icon: Lock, color: "text-rose-400 bg-rose-500/10" },
};

const SEV_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function SeverityBadge(props: { sev: string }) {
  const s = props.sev;
  return <span className={"text-[9px] px-1.5 py-0.5 rounded border " + (SEV_STYLES[s] || "bg-slate-500/20 text-slate-300")}>{s}</span>;
}

function StatCard(props: { label: string; value: string | number; icon: any; color: string }) {
  const Icon = props.icon;
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{props.label}</span>
        <Icon className={"w-4 h-4 " + props.color} />
      </div>
      <div className="text-xl font-bold text-white">{props.value}</div>
    </div>
  );
}

export default function EngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient("/api/offensive/engagements/" + id + "/detail").then((d: any) => {
      setData(d);
      setLoading(false);
    }).catch(function () { setLoading(false); });
  }, [id]);

  function downloadPDF() {
    var hostname = window.location.hostname;
    var base = "http://" + hostname + ":8005";
    var a = document.createElement("a");
    a.href = base + "/api/offensive/report/pdf/" + id;
    a.download = "report_" + id + ".pdf";
    a.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Engagement not found</p>
        <button onClick={function () { router.back(); }} className="mt-2 text-purple-400 hover:text-purple-300 text-sm">Go back</button>
      </div>
    );
  }

  var engagement = data.engagement;
  var findings = data.findings;
  var timeline = data.timeline;
  var stats = data.stats;
  var tools = data.tools;
  var cat = ENG_CATEGORIES[engagement.type] || { icon: Target, color: "text-slate-400 bg-slate-500/10" };
  var CatIcon = cat.icon;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <button onClick={function () { router.push("/offensive-consultant"); }}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Offensive Consultant
      </button>

      <div className={"rounded-xl border p-6 bg-opacity-5 " + cat.color}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-lg flex items-center justify-center " + cat.color}>
              <CatIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{engagement.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" />{engagement.target}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{engagement.lead}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(engagement.start_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadPDF}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all">
              <Download className="w-3.5 h-3.5" /> PDF Report
            </button>
            <span className={"text-xs px-2.5 py-1 rounded-full border " + (engagement.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : engagement.status === "planning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : engagement.status === "completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20")}>{engagement.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Findings" value={stats.total_findings} icon={AlertTriangle} color="text-red-400" />
        <StatCard label="Risk Score" value={stats.risk_score + "/10"} icon={CheckCircle} color={stats.risk_score >= 8 ? "text-red-400" : stats.risk_score >= 6 ? "text-orange-400" : "text-amber-400"} />
        <StatCard label="Timeline" value={timeline.length + " phases"} icon={GitBranch} color="text-purple-400" />
        <StatCard label="Tools" value={tools.length} icon={Wrench} color="text-cyan-400" />
        <StatCard label="Open" value={stats.status_breakdown && stats.status_breakdown.open ? stats.status_breakdown.open : 0} icon={AlertTriangle} color="text-red-400" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Findings ({findings.length})
          </h2>
          <div className="space-y-2">
            {findings.map(function (f: any, i: number) {
              return (
                <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-purple-500/30 transition-all cursor-pointer"
                  onClick={function () { router.push("/offensive-consultant/findings/" + f.id); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{f.title}</h3>
                      <SeverityBadge sev={f.severity} />
                    </div>
                    <span className={"text-[9px] " + (f.status === "open" ? "text-red-400" : f.status === "in_progress" ? "text-amber-400" : f.status === "verified" ? "text-blue-400" : "text-green-400")}>{f.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{f.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-500">
                    <span>{f.affected_asset}</span>
                    <span>CVSS: {f.cvss}</span>
                    <span>{f.cwe}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-purple-400" /> Timeline
            </h2>
            <div className="space-y-2">
              {timeline.map(function (t: any, i: number) {
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className={"mt-1 w-2 h-2 rounded-full shrink-0 " + (t.status === "completed" ? "bg-green-400" : t.status === "in_progress" ? "bg-amber-400 animate-pulse" : "bg-slate-600")} />
                    <div>
                      <p className="text-xs font-medium text-white">{t.phase}</p>
                      <p className="text-[9px] text-slate-500">{new Date(t.date).toLocaleDateString()} &middot; {t.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-cyan-400" /> Toolkit
            </h2>
            <div className="space-y-1.5">
              {tools.map(function (t: any) {
                return (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-slate-300">
                    <Wrench className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="flex-1">{t.name}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{t.category}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Severity
            </h2>
            <div className="space-y-2">
              {Object.entries(stats.severity_distribution || {}).map(function (entry: any) {
                var sev = entry[0];
                var count = entry[1];
                return (
                  <div key={sev} className="flex items-center justify-between">
                    <span className={"text-xs font-medium " + (SEV_STYLES[sev] ? SEV_STYLES[sev].split(" ")[1] : "text-slate-300")}>{sev}</span>
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
