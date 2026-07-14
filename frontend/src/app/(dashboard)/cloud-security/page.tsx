"use client";
import { useState } from "react";
import { Shield, Cloud, Server, AlertTriangle, Check, RefreshCw } from "lucide-react";

export default function CloudSecurityPage() {
  const [provider, setProvider] = useState("aws");
  const providers = [
    { id: "aws", name: "AWS", color: "text-orange-400", bg: "bg-orange-500/10" },
    { id: "azure", name: "Azure", color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "gcp", name: "GCP", color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Cloud Security</h1>
        <p className="text-slate-400 text-sm mt-1">Multi-cloud security posture management</p>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Scan All</button>
    </div>

    <div className="flex gap-3">
      {providers.map(p => (
        <button key={p.id} onClick={() => setProvider(p.id)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${provider === p.id ? "bg-blue-600/20 border-blue-500/50" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"}`}>
          <Cloud className={`w-5 h-5 ${p.color}`} />
          <span className="text-white text-sm font-medium">{p.name}</span>
          {provider === p.id && <Check className="w-4 h-4 text-blue-400" />}
        </button>
      ))}
    </div>

    {provider === "aws" && <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Critical", count: 3, color: "text-red-400" },
          { label: "High", count: 12, color: "text-orange-400" },
          { label: "Medium", count: 28, color: "text-yellow-400" },
          { label: "Compliance", count: "62%", color: "text-blue-400" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Security Findings</h2>
        <div className="space-y-2">
          {[
            { title: "S3 Bucket Publicly Accessible", resource: "s3://backups-prod", severity: "critical" },
            { title: "IAM Root User Active", resource: "Root (1234-5678-9012)", severity: "critical" },
            { title: "Unrestricted SSH Access", resource: "sg-web-01", severity: "high" },
            { title: "Unencrypted RDS Instance", resource: "db-prod-01", severity: "high" },
            { title: "Overly Permissive IAM Role", resource: "role/ci-deploy", severity: "high" },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-4 h-4 ${f.severity === "critical" ? "text-red-400" : "text-orange-400"}`} />
                <span className="text-white text-sm">{f.title}</span>
                <span className="text-xs text-slate-500">{f.resource}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${f.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}>{f.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>}

    {provider === "gcp" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-8 text-center">
      <Cloud className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 className="text-white font-medium">GCP Not Connected</h3>
      <p className="text-slate-500 text-sm mt-1">Authenticate with a GCP service account to begin monitoring</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Connect GCP</button>
    </div>}
  </div>;
}
