"use client";
import { useState } from "react";
import { Users, Monitor, Shield, AlertTriangle, Swords, RotateCcw } from "lucide-react";

export default function ADLabPage() {
  const [tab, setTab] = useState("users");

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Active Directory Lab</h1>
        <p className="text-slate-400 text-sm mt-1">Domain: CONTOSO.LOCAL | Forest: contoso.local</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"><Swords className="w-4 h-4" /> Simulate Attack</button>
        <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset Lab</button>
      </div>
    </div>

    <div className="grid grid-cols-5 gap-4">
      {[
        { label: "Users", count: 8, icon: Users, color: "text-blue-400" },
        { label: "Computers", count: 7, icon: Monitor, color: "text-green-400" },
        { label: "Domain Admins", count: 3, icon: Shield, color: "text-red-400" },
        { label: "Kerberoastable", count: 2, icon: AlertTriangle, color: "text-orange-400" },
        { label: "Attack Paths", count: 2, icon: Swords, color: "text-purple-400" },
      ].map((s, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
          <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
          <div className="text-xs text-slate-500">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 border-b border-slate-700/50 pb-2">
      {["users", "computers", "bloodhound", "attacks"].map(t => (
        <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg transition-all ${tab === t ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white"}`}>{t}</button>
      ))}
    </div>

    {tab === "users" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-xs text-slate-500 border-b border-slate-700/50">
          <th className="text-left py-3 px-4">Username</th><th className="text-left py-3 px-4">SPNs</th><th className="text-center py-3 px-4">Admin</th><th className="text-center py-3 px-4">Kerberoastable</th><th className="text-center py-3 px-4">Risk</th>
        </tr></thead>
        <tbody>
          {[
            { name: "Administrator", spns: "None", admin: true, kerb: false, risk: "critical" },
            { name: "svc_sql", spns: "MSSQLSvc/sql01:1433", admin: false, kerb: true, risk: "high" },
            { name: "svc_web", spns: "HTTP/web01", admin: false, kerb: true, risk: "high" },
            { name: "john.doe", spns: "None", admin: true, kerb: false, risk: "high" },
            { name: "backup_svc", spns: "None", admin: true, kerb: false, risk: "critical" },
            { name: "jane.smith", spns: "None", admin: false, kerb: false, risk: "low" },
          ].map((u, i) => (
            <tr key={i} className="border-b border-slate-700/30 text-sm hover:bg-slate-700/10">
              <td className="py-3 px-4"><span className="text-white">{u.name}</span></td>
              <td className="py-3 px-4 text-xs text-slate-400">{u.spns}</td>
              <td className="py-3 px-4 text-center">{u.admin ? "👑" : "—"}</td>
              <td className="py-3 px-4 text-center">{u.kerb ? "⚠️" : "—"}</td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs px-2 py-1 rounded ${u.risk === "critical" ? "bg-red-500/20 text-red-400" : u.risk === "high" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>{u.risk}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>}

    {tab === "bloodhound" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">BloodHound Attack Paths</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-sm font-medium text-red-400">🔥 Critical Path</div>
          <div className="text-white text-sm mt-1">Kerberoast → SQL Admin → Unconstrained Delegation → DCSync</div>
          <div className="text-xs text-slate-500 mt-2">4 steps to domain compromise</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-sm font-medium text-orange-400">⚠️ Critical Path</div>
          <div className="text-white text-sm mt-1">Backup Operator → DCSync → Full Domain Compromise</div>
          <div className="text-xs text-slate-500 mt-2">2 steps to domain compromise</div>
        </div>
      </div>
      <pre className="bg-slate-900/50 rounded-lg p-4 text-xs text-slate-400 overflow-x-auto">{JSON.stringify({nodes: 8, edges: 7, attack_paths: 2}, null, 2)}</pre>
    </div>}

    {tab === "attacks" && <div className="grid grid-cols-2 gap-4">
      {[
        { name: "Kerberoasting", technique: "T1558.003", status: "completed", result: "2 hashes cracked (svc_sql, svc_web)" },
        { name: "AS-REP Roasting", technique: "T1558.004", status: "completed", result: "1 hash cracked (test_admin)" },
        { name: "DCSync", technique: "T1003.006", status: "completed", result: "3 hashes extracted, krbtgt compromised" },
        { name: "Golden Ticket", technique: "T1558.001", status: "completed", result: "Forged ticket for Administrator" },
      ].map((a, i) => (
        <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">{a.name}</span>
            <span className="text-xs text-blue-400">{a.technique}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{a.status}</span>
            <span className="text-xs text-slate-400">{a.result}</span>
          </div>
        </div>
      ))}
    </div>}
  </div>;
}
