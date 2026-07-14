"use client";
import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Search, FileText, Activity, Download } from "lucide-react";

export default function DetectionEngineeringPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/detection/status").then(r => r.json()).then(setData) }, []);

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Detection Engineering</h1>
        <p className="text-slate-400 text-sm mt-1">Sigma, YARA, Suricata rules management</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ New Rule</button>
        <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">Validate All</button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {["Sigma", "YARA", "Suricata", "Falco"].map((engine, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            {i === 0 ? <Search className="w-4 h-4 text-blue-400" /> : i === 1 ? <FileText className="w-4 h-4 text-green-400" /> : i === 2 ? <Activity className="w-4 h-4 text-purple-400" /> : <Shield className="w-4 h-4 text-orange-400" />}
            <span className="text-white font-medium text-sm">{engine}</span>
          </div>
          <div className="text-2xl font-bold text-white">{i === 0 ? 8 : i === 1 ? 4 : i === 2 ? 127 : 42}</div>
          <div className="text-xs text-slate-500">rules active</div>
        </div>
      ))}
    </div>

    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Alerts</h2>
      <div className="space-y-2">
        {[
          { rule: "Suspicious PowerShell Execution", severity: "high", source: "WIN-SRV-01", status: "new" },
          { rule: "LSASS Access Attempt", severity: "critical", source: "DC-01", status: "investigating" },
          { rule: "Data Exfiltration via DNS", severity: "high", source: "SRV-WEB-03", status: "new" },
          { rule: "Mimikatz Detection", severity: "critical", source: "DC-02", status: "contained" },
        ].map((alert, i) => (
          <div key={i} className="flex items-center justify-between bg-slate-700/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${alert.severity === "critical" ? "bg-red-500" : "bg-yellow-500"}`} />
              <span className="text-white text-sm">{alert.rule}</span>
              <span className="text-xs text-slate-500">{alert.source}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${alert.status === "new" ? "bg-red-500/20 text-red-400" : alert.status === "investigating" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{alert.status}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Sigma Rules</h2>
        {["Suspicious PowerShell", "Mimikatz Detection", "Cobalt Strike Beacon", "RDP Lateral Movement", "Data Exfiltration via DNS"].map((rule, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
            <span className="text-sm text-slate-300">{rule}</span>
            <span className="text-xs text-blue-400">SIG-00{i+1}</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-3">YARA Rules</h2>
        {["Ransomware String Pattern", "Shellcode Detection", "C2 Beacon Pattern", "Meterpreter Payload"].map((rule, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
            <span className="text-sm text-slate-300">{rule}</span>
            <span className="text-xs text-green-400">YAR-00{i+1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
