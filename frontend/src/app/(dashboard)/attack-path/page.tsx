"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, Activity, Shield, AlertTriangle, Loader2, Crosshair, Zap, Terminal as TerminalIcon } from "lucide-react";
import ReactEChartsCore from "echarts-for-react";
import { API_CONFIG } from "@/lib/api-config";

type GraphNode = { id: string; label: string; group: string; severity: string };
type GraphEdge = { source: string; target: string; label: string };

export default function AttackPathPage() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [error, setError] = useState("");

  const generateGraph = async () => {
    if (!target || target.length < 3) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_CONFIG.BACKEND_API}/api/attack-graph/generate?target=${encodeURIComponent(target)}`, {
        method: "POST",
        headers: { "X-Api-Key": API_CONFIG.TOOLS_API_KEY },
      });
      if (!res.ok) throw new Error((await res.text()) || "Graph generation failed");
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const groupColors: Record<string, string> = {
    target: "#22d3ee", phase: "#6366f1", recon: "#f59e0b",
    vuln: "#ef4444", incident: "#dc2626",
  };
  const severitySizes: Record<string, number> = {
    info: 20, medium: 30, high: 40, critical: 50, warning: 35,
  };

  const option = {
    tooltip: { show: true, formatter: (p: any) => `${p.data.label || p.name}` },
    series: [{
      type: "graph",
      layout: "force",
      force: { repulsion: 500, edgeLength: 200, gravity: 0.1 },
      roam: true,
      draggable: true,
      data: nodes.map((n) => ({
        id: n.id,
        name: n.label,
        symbolSize: severitySizes[n.severity] || 25,
        itemStyle: { color: groupColors[n.group] || "#94a3b8" },
        label: { show: true, fontSize: 10, color: "#e2e8f0", formatter: (p: any) => p.name.length > 30 ? p.name.slice(0, 28) + ".." : p.name },
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: { show: true, formatter: e.label, fontSize: 8, color: "#64748b" },
        lineStyle: { color: "#334155", width: 2, curveness: 0.2, opacity: 0.6 },
      })),
      lineStyle: { color: "source", curveness: 0.2 },
      emphasis: { focus: "adjacency", lineStyle: { width: 3 } },
    }],
  };

  return (
    <div className="p-6 min-h-screen bg-[#0a0a0f]">
      <div className="flex items-center gap-3 mb-6">
        <Crosshair className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Attack Graph</h1>
        <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Recon → Incident</span>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateGraph()}
          placeholder="Target IP or hostname..."
          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={generateGraph}
          disabled={loading || !target}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? "Scanning..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400" /> {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        {nodes.length > 0 ? (
          <ReactEChartsCore option={option} style={{ height: "100%", width: "100%" }} notMerge={true} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600">
            <div className="text-center space-y-3">
              <Activity className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm font-mono">Enter a target to generate the attack graph</p>
              <p className="text-[10px] text-slate-700">Uses real nmap + nikto scans via Kali tools</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
