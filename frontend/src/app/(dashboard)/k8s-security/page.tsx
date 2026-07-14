"use client";
import { useState } from "react";
import { Shield, Box, Users, Network, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function K8sSecurityPage() {
  const [tab, setTab] = useState("pods");

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Kubernetes Security</h1>
        <p className="text-slate-400 text-sm mt-1">Cluster security posture & pod compliance</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Run Scan</button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Critical Pods", count: 3, color: "text-red-400" },
        { label: "High Risk", count: 3, color: "text-orange-400" },
        { label: "RBAC Issues", count: 4, color: "text-yellow-400" },
        { label: "Missing Policies", count: 3, color: "text-purple-400" },
      ].map((s, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 border-b border-slate-700/50 pb-2">
      {["pods", "namespaces", "rbac", "network"].map(t => (
        <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg transition-all ${tab === t ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white"}`}>{t.toUpperCase()}</button>
      ))}
    </div>

    {tab === "pods" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-xs text-slate-500 border-b border-slate-700/50">
          <th className="text-left py-3 px-4">Pod</th><th className="text-left py-3 px-4">Namespace</th><th className="text-center py-3 px-4">Privileged</th><th className="text-center py-3 px-4">Host Network</th><th className="text-center py-3 px-4">Seccomp</th><th className="text-center py-3 px-4">Risk</th>
        </tr></thead>
        <tbody>
          {[
            { name: "api-server-7d9f8c6b5-x4h2k", ns: "production", priv: true, hostNet: true, seccomp: "unconfined", risk: "critical" },
            { name: "database-postgresql-0", ns: "data", priv: false, hostNet: false, seccomp: "unconfined", risk: "medium" },
            { name: "storage/minio-operator-7f9d8c6b5", ns: "storage", priv: true, hostNet: false, seccomp: "unconfined", risk: "critical" },
            { name: "debug-shell-8d9e0f1a2-b4c5d", ns: "staging", priv: true, hostNet: true, seccomp: "unconfined", risk: "critical" },
            { name: "nginx-ingress-controller", ns: "ingress-nginx", priv: false, hostNet: true, seccomp: "RuntimeDefault", risk: "high" },
            { name: "redis-master-0", ns: "cache", priv: false, hostNet: false, seccomp: "RuntimeDefault", risk: "low" },
          ].map((p, i) => (
            <tr key={i} className="border-b border-slate-700/30 text-sm hover:bg-slate-700/10">
              <td className="py-3 px-4"><span className="text-white">{p.name}</span></td>
              <td className="py-3 px-4"><span className="text-slate-400">{p.ns}</span></td>
              <td className="py-3 px-4 text-center">{p.priv ? <XCircle className="w-4 h-4 text-red-400 mx-auto" /> : <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />}</td>
              <td className="py-3 px-4 text-center">{p.hostNet ? <XCircle className="w-4 h-4 text-red-400 mx-auto" /> : <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />}</td>
              <td className="py-3 px-4 text-center"><span className="text-xs text-slate-400">{p.seccomp}</span></td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs px-2 py-1 rounded ${p.risk === "critical" ? "bg-red-500/20 text-red-400" : p.risk === "high" ? "bg-orange-500/20 text-orange-400" : p.risk === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{p.risk}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>}

    {tab === "namespaces" && <div className="grid grid-cols-2 gap-3">
      {[
        { name: "production", pods: 12, networkPolicy: true, psp: true, risk: "medium" },
        { name: "default", pods: 3, networkPolicy: false, psp: false, risk: "high" },
        { name: "kube-system", pods: 15, networkPolicy: false, psp: false, risk: "high" },
        { name: "monitoring", pods: 6, networkPolicy: true, psp: true, risk: "low" },
        { name: "staging", pods: 8, networkPolicy: true, psp: false, risk: "medium" },
        { name: "ingress-nginx", pods: 4, networkPolicy: true, psp: false, risk: "medium" },
      ].map((ns, i) => (
        <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{ns.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${ns.risk === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>{ns.risk}</span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div>Pods: {ns.pods}</div>
            <div>Network Policy: {ns.networkPolicy ? "✅" : "❌"}</div>
            <div>Pod Security: {ns.psp ? "✅" : "❌"}</div>
          </div>
        </div>
      ))}
    </div>}

    {tab === "rbac" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
      <h2 className="text-lg font-semibold text-white mb-3">RBAC Security Analysis</h2>
      {[
        { kind: "ClusterRole", name: "cluster-admin", subjects: "sa:production:api-server", risk: "critical" },
        { kind: "ClusterRoleBinding", name: "view-all", subjects: "sa:staging:debug-shell", risk: "high" },
        { kind: "RoleBinding", name: "admin-ns-production", subjects: "user:devops@company.com", risk: "high" },
        { kind: "Role", name: "pod-creator", subjects: "sa:default:jenkins", risk: "medium" },
      ].map((r, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
          <div className="flex items-center gap-3">
            <Shield className={`w-4 h-4 ${r.risk === "critical" ? "text-red-400" : "text-orange-400"}`} />
            <div><span className="text-white text-sm">{r.name}</span><span className="text-slate-500 text-xs ml-2">({r.kind})</span></div>
          </div>
          <span className="text-xs text-slate-400">{r.subjects}</span>
        </div>
      ))}
    </div>}
  </div>;
}
