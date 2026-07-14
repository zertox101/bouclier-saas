"use client";
import { useState } from "react";
import { Building2, Wifi, Zap, Droplets, AlertTriangle, Car, Play, Shield } from "lucide-react";

export default function SmartCityPage() {
  const [zone, setZone] = useState("zone-downtown");

  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Smart City Emulator</h1>
        <p className="text-slate-400 text-sm mt-1">Bouclier Smart City v1.0 — Cyber-physical infrastructure simulation</p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"><Play className="w-4 h-4" /> Simulate Attack</button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Zones", count: 8, icon: Building2, color: "text-blue-400" },
        { label: "Sensors", count: 10, icon: Wifi, color: "text-green-400" },
        { label: "Active Incidents", count: 1, icon: AlertTriangle, color: "text-red-400" },
        { label: "Cyber Threats", count: 3, icon: Shield, color: "text-purple-400" },
      ].map((s, i) => (
        <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
          <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
          <div className="text-xs text-slate-500">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 overflow-x-auto pb-2">
      {[
        { id: "zone-downtown", name: "Downtown Core", icon: Building2 },
        { id: "zone-water", name: "Water Treatment", icon: Droplets },
        { id: "zone-power", name: "Power Grid", icon: Zap },
        { id: "zone-transport", name: "Transport Hub", icon: Car },
        { id: "zone-airport", name: "Airport", icon: Car },
        { id: "zone-ind-01", name: "Industrial Alpha", icon: Building2 },
      ].map(z => (
        <button key={z.id} onClick={() => setZone(z.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${zone === z.id ? "bg-blue-600/20 border border-blue-500/50" : "bg-slate-800/30 border border-slate-700/50 hover:border-slate-600"}`}>
          <z.icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-white">{z.name}</span>
        </button>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Zone Sensors</h2>
        <div className="space-y-3">
          {[
            { type: "Traffic", reading: "142 veh/min, 35 km/h", status: "online" },
            { type: "Environmental", reading: "AQI: 65, 28°C, 55% RH", status: "online" },
            { type: "Surveillance", reading: "890 people, 320 vehicles", status: "online" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-700/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{s.type}</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{s.status}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{s.reading}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Incidents</h2>
        <div className="space-y-3">
          {[
            { title: "SCADA Water System Intrusion", severity: "critical", status: "investigating" },
            { title: "Smart Grid Meter Tampering", severity: "high", status: "contained" },
            { title: "Airport Departure Board Defacement", severity: "critical", status: "resolved" },
          ].map((inc, i) => (
            <div key={i} className="bg-slate-700/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{inc.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${inc.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}>{inc.severity}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{inc.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
      <h2 className="text-lg font-semibold text-white mb-3">Available Simulations</h2>
      <div className="grid grid-cols-4 gap-3">
        {[
          { name: "Water Contamination", duration: "120s", color: "from-cyan-600 to-blue-700" },
          { name: "Grid Blackout", duration: "90s", color: "from-yellow-600 to-orange-700" },
          { name: "Traffic Gridlock", duration: "60s", color: "from-red-600 to-rose-700" },
          { name: "City Ransomware", duration: "180s", color: "from-purple-600 to-violet-700" },
        ].map((sim, i) => (
          <button key={i} className={`bg-gradient-to-br ${sim.color} rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}>
            <div className="text-white font-medium text-sm">{sim.name}</div>
            <div className="text-xs text-white/70 mt-1">{sim.duration}</div>
          </button>
        ))}
      </div>
    </div>
  </div>;
}
