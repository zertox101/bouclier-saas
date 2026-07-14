// @ts-nocheck
"use client";

import ThreatMap2D from "../../../components/maps/ThreatMap2D";

export default function ThreatMapPage() {
  return (
    <section className="relative min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-gray-800 to-black p-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between rounded-xl bg-white/5 p-3 backdrop-blur-lg shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <h1 className="text-xl font-bold text-white tracking-widest">Free Threat Map</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-600/20 px-2 py-0.5 text-xs font-medium text-cyan-300">
          Live Data
        </span>
      </header>
      {/* Map container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-cyan-500/30 backdrop-blur-md bg-black/30">
        <ThreatMap2D />
      </div>
    </section>
  );
}
