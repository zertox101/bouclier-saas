"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Bug, Code, FileText, ExternalLink, Clock, Target, Shield, CheckCircle, Tag } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const SEV_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const SEV_GRADIENTS: Record<string, string> = {
  critical: "from-red-600 to-red-900",
  high: "from-orange-600 to-orange-900",
  medium: "from-yellow-600 to-yellow-900",
  low: "from-blue-600 to-blue-900",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-red-500/20 text-red-300 border-red-500/30",
  in_progress: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  verified: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  closed: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient(`/api/offensive/findings/${id}`).then((d: any) => {
      setFinding(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!finding) return (
    <div className="p-6 text-center text-slate-400">
      <p>Finding not found</p>
      <button onClick={() => router.back()} className="mt-2 text-purple-400 hover:text-purple-300 text-sm">Go back</button>
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Header */}
      <div className={`bg-gradient-to-br ${SEV_GRADIENTS[finding.severity] || "from-slate-600 to-slate-900"} rounded-xl p-6 border border-white/10`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{finding.title}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${SEV_COLORS[finding.severity]}`}>{finding.severity}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                <span className="flex items-center gap-1"><Code className="w-3 h-3" />{finding.cwe}</span>
                <span className="flex items-center gap-1"><Target className="w-3 h-3" />{finding.affected_asset}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(finding.discovered_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_STYLES[finding.status] || "bg-slate-500/20 text-slate-300 border-slate-500/20"}`}>{finding.status.replace("_", " ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400" /> Description
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{finding.description}</p>
          </motion.div>

          {/* POC */}
          {finding.poc && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-amber-400" /> Proof of Concept
              </h2>
              <pre className="bg-black/50 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">{finding.poc}</pre>
            </motion.div>
          )}

          {/* Remediation */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-400" /> Remediation
            </h2>
            <p className="text-sm text-slate-300 mb-3">{finding.remediation}</p>
            {finding.remediation_steps && finding.remediation_steps.length > 0 && (
              <div className="space-y-1.5">
                {finding.remediation_steps.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
              <span>Effort: <span className="font-medium text-slate-300">{finding.remediation_effort}</span></span>
              <span>Deadline: <span className="font-medium text-slate-300">{finding.remediation_deadline ? new Date(finding.remediation_deadline).toLocaleDateString() : "N/A"}</span></span>
            </div>
          </motion.div>

          {/* References */}
          {finding.references && finding.references.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <ExternalLink className="w-4 h-4 text-blue-400" /> References
              </h2>
              <div className="space-y-1.5">
                {finding.references.map((ref: string, i: number) => (
                  <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-all">
                    <ExternalLink className="w-3 h-3" />
                    {ref}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Severity Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">CVSS Score</span>
                <p className="text-2xl font-bold text-white">{finding.cvss || "N/A"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">CWE</span>
                <p className="text-sm font-medium text-white">{finding.cwe || "N/A"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</span>
                <p className="text-sm font-medium text-white">{finding.confidence || 0}%</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Attack Vector</span>
                <p className="text-sm font-medium text-white">{finding.attack_vector || "Network"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Status</span>
                <p className="text-sm font-medium text-white capitalize">{finding.status?.replace("_", " ") || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {finding.tags && finding.tags.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-purple-400" /> Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {finding.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-[9px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Link */}
          {finding.engagement_id && (
            <button onClick={() => router.push(`/offensive-consultant/engagements/${finding.engagement_id}`)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-purple-500/30 transition-all text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Part of Engagement</span>
              <p className="text-sm font-medium text-purple-400 mt-1">{finding.engagement_id}</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
