"use client";
import { useState } from "react";
import { Camera, Wifi, AlertTriangle, Search, Shield, Radio } from "lucide-react";

export default function IoTSecurityPage() {
  const [tab, setTab] = useState("devices");

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">IoT Security</h1>
        <p className="text-slate-400 text-sm mt-1">IoT device monitoring & vulnerability management</p>
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"><Search className="w-4 h-4" /> Scan Network</button>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Devices", count: 8, icon: Camera, color: "text-blue-400" },
        { label: "Critical Vulns", count: 5, icon: AlertTriangle, color: "text-red-400" },
        { label: "Suspicious Traffic", count: 4, icon: Radio, color: "text-orange-400" },
        { label: "Firmware Outdated", count: 5, icon: Wifi, color: "text-yellow-400" },
      ].map((s, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
          <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
          <div className="text-xs text-slate-500">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 border-b border-slate-700/50 pb-2">
      {["devices", "vulnerabilities", "traffic"].map(t => (
        <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg transition-all ${tab === t ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white"}`}>{t}</button>
      ))}
    </div>

    {tab === "devices" && <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      <table className="w-full">
        <thead><tr className="text-xs text-slate-500 border-b border-slate-700/50">
          <th className="text-left py-3 px-4">Device</th><th className="text-left py-3 px-4">Type</th><th className="text-left py-3 px-4">IP</th><th className="text-center py-3 px-4">Vulns</th><th className="text-center py-3 px-4">FW</th><th className="text-center py-3 px-4">Risk</th>
        </tr></thead>
        <tbody>
          {[
            { name: "CAM-001", type: "Hikvision Camera", ip: "192.168.1.101", vulns: 2, fw: "V5.5.0", risk: "critical" },
            { name: "CAM-002", type: "Dahua Camera", ip: "192.168.1.102", vulns: 2, fw: "V2.800", risk: "critical" },
            { name: "GATE-001", type: "Siemens Scalance", ip: "192.168.1.1", vulns: 3, fw: "V2.0", risk: "critical" },
            { name: "PLUG-001", type: "TP-Link HS110", ip: "192.168.1.201", vulns: 2, fw: "V1.0.1", risk: "high" },
            { name: "BELL-001", type: "Ring Doorbell", ip: "192.168.1.203", vulns: 1, fw: "V1.2.3", risk: "medium" },
            { name: "THERM-001", type: "Nest Thermostat", ip: "192.168.1.202", vulns: 0, fw: "V6.2.1", risk: "low" },
          ].map((d, i) => (
            <tr key={i} className="border-b border-slate-700/30 text-sm hover:bg-slate-700/10">
              <td className="py-3 px-4"><span className="text-white">{d.name}</span></td>
              <td className="py-3 px-4 text-slate-400">{d.type}</td>
              <td className="py-3 px-4 text-slate-400">{d.ip}</td>
              <td className="py-3 px-4 text-center"><span className={`text-xs ${d.vulns > 0 ? "text-red-400" : "text-green-400"}`}>{d.vulns}</span></td>
              <td className="py-3 px-4 text-center text-xs text-slate-400">{d.fw}</td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs px-2 py-1 rounded ${d.risk === "critical" ? "bg-red-500/20 text-red-400" : d.risk === "high" ? "bg-orange-500/20 text-orange-400" : d.risk === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{d.risk}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>}

    {tab === "vulnerabilities" && <div className="grid grid-cols-2 gap-3">
      {[
        { id: "CVE-2021-36260", device: "Hikvision Camera", severity: "critical", exploit: true, metasploit: true },
        { id: "CVE-2020-9498", device: "Dahua Camera", severity: "critical", exploit: true, metasploit: true },
        { id: "CVE-2022-37460", device: "Siemens Scalance", severity: "critical", exploit: false, metasploit: false },
        { id: "CVE-2020-15783", device: "Siemens Scalance", severity: "critical", exploit: true, metasploit: false },
        { id: "CVE-2021-27102", device: "TP-Link Smart Plug", severity: "high", exploit: true, metasploit: false },
        { id: "CVE-2017-7921", device: "Hikvision Camera", severity: "critical", exploit: true, metasploit: false },
      ].map((v, i) => (
        <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium text-sm">{v.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${v.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}>{v.severity}</span>
          </div>
          <div className="text-xs text-slate-400">{v.device}</div>
          <div className="flex items-center gap-2 mt-2">
            {v.exploit && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Exploit Available</span>}
            {v.metasploit && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Metasploit</span>}
          </div>
        </div>
      ))}
    </div>}
  </div>;
}
