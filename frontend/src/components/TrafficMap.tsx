"use client";

import { useState } from "react";
import { Info } from "lucide-react";

type Tone = "critical" | "high" | "medium" | "low";

type DestinationItem = {
  label: string;
  count: number;
  tone: Tone;
};

type SeverityItem = {
  label: string;
  count: number;
  tone: Tone;
};

type TrafficMapProps = {
  destinations?: DestinationItem[];
  severity?: SeverityItem[];
  timeRangeLabel?: string;
  onRangeChange?: () => void;
};

const defaultDestinations: DestinationItem[] = [
  { label: "CN - Chine", count: 45, tone: "critical" },
  { label: "RU - Russie", count: 34, tone: "high" },
  { label: "MA - Maroc", count: 22, tone: "medium" },
];

const defaultSeverity: SeverityItem[] = [
  { label: "Critique", count: 45, tone: "critical" },
  { label: "Élevé", count: 35, tone: "high" },
  { label: "Moyen", count: 12, tone: "medium" },
];

const timeRanges = ["15 minutes", "30 minutes", "1 heure", "6 heures", "24 heures"];

export default function TrafficMap({
  destinations,
  severity,
  timeRangeLabel,
  onRangeChange,
}: TrafficMapProps) {
  const destinationList =
    destinations && destinations.length ? destinations : defaultDestinations;
  const severityList =
    severity && severity.length ? severity : defaultSeverity;

  const [currentTimeRange, setCurrentTimeRange] = useState(timeRangeLabel || "15 minutes");

  const handleRangeChange = () => {
    const currentIndex = timeRanges.indexOf(currentTimeRange);
    const nextIndex = (currentIndex + 1) % timeRanges.length;
    setCurrentTimeRange(timeRanges[nextIndex]);
    onRangeChange?.();
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 shadow-2xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Destination du trafic réseau
            </h3>
            <Info className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <button
            className="flex items-center gap-1 rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
            onClick={handleRangeChange}
            type="button"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentTimeRange}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,1.3fr]">
          {/* Left side - Country stats */}
          <div className="space-y-3">
            <div className="space-y-2 text-xs">
              {destinationList.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${item.tone === "critical"
                          ? "bg-red-500"
                          : item.tone === "high"
                            ? "bg-orange-400"
                            : "bg-green-400"
                        }`}
                    />
                    <span className="text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Severity stats */}
            <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-3">
              <div className="mb-2 text-[11px] font-medium text-slate-400">
                Niveau de criticité
              </div>
              <div className="space-y-2">
                {severityList.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${item.tone === "critical"
                            ? "bg-red-500"
                            : item.tone === "high"
                              ? "bg-orange-400"
                              : "bg-green-400"
                          }`}
                      />
                      <span className="text-slate-400">{item.label}</span>
                    </div>
                    <span className="font-medium text-slate-300">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - World map */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-800/60 bg-slate-950/60 p-4">
            <div className="relative aspect-[1.8/1] w-full max-w-[280px]">
              {/* Globe/Map representation */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-800/40 to-slate-900/60">
                {/* Simplified world map SVG */}
                <svg viewBox="0 0 400 220" className="h-full w-full opacity-30">
                  <path
                    d="M80 60 L120 55 L140 70 L160 65 L180 75 L200 70 L220 80 L240 75 L260 85 L280 80 L300 90 L320 85 L320 110 L300 115 L280 110 L260 120 L240 115 L220 125 L200 120 L180 130 L160 125 L140 135 L120 130 L100 140 L80 135 Z"
                    fill="currentColor"
                    className="text-cyan-500/40"
                  />
                  <path
                    d="M100 100 L130 95 L150 105 L170 100 L190 110 L210 105 L230 115 L250 110 L270 120 L290 115 L290 140 L270 145 L250 140 L230 150 L210 145 L190 155 L170 150 L150 160 L130 155 L110 165 L100 160 Z"
                    fill="currentColor"
                    className="text-blue-500/30"
                  />
                </svg>

                {/* Location markers */}
                <div className="absolute left-[70%] top-[25%] h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                <div className="absolute left-[45%] top-[35%] h-2.5 w-2.5 animate-pulse rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]" style={{ animationDelay: '0.3s' }} />
                <div className="absolute left-[15%] top-[45%] h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5">
              {[12, 26, 18, 34, 22, 40, 28, 35, 20, 30, 25, 38].map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 rounded-t-sm bg-gradient-to-t from-cyan-600/40 via-cyan-500/60 to-cyan-400"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Critique
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Élevé
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Moyen
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
