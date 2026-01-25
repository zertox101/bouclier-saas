"use client";

import { useState, useEffect, useCallback } from "react";
import { Info, Download, RefreshCw } from "lucide-react";
import { ENDPOINTS, fetchAPI } from "@/lib/api-config";

type EventRow = {
  time: string;
  source: string;
  sourceIP2: string;
  geo: string;
  service: string;
  type: string;
  severity: string;
};

type EventTableFilters = {
  rangeLabel: string;
  sourceLabel: string;
  severityLabel: string;
  criticalityLabel: string;
};

type EventTableProps = {
  events?: EventRow[];
  filters?: EventTableFilters;
  onFilterChange?: (filter: keyof EventTableFilters) => void;
  onExport?: () => void;
  autoRefresh?: boolean;
};

const defaultEvents: EventRow[] = [
  {
    time: "+12.29:2-16",
    source: "184.514.09",
    sourceIP2: "199.66.67",
    geo: "nas",
    service: "SSH",
    type: "Tentative de bruteforce",
    severity: "Critique",
  },
  {
    time: "+12.29:3-16",
    source: "183.48.286",
    sourceIP2: "191.164.07",
    geo: "nas",
    service: "SSH",
    type: "Scan de port suspect",
    severity: "Élevé",
  },
  {
    time: "+12.29:5-16",
    source: "145.16.84.07",
    sourceIP2: "195.409.02",
    geo: "nas",
    service: "http",
    type: "Tentative de bruteforce",
    severity: "Élevé",
  },
  {
    time: "+12.29:5-16",
    source: "185.40.283",
    sourceIP2: "199.802.02",
    geo: "nas",
    service: "http",
    type: "Scan de port suspect",
    severity: "Critique",
  },
  {
    time: "+12.29:5-16",
    source: "185.44.06-1",
    sourceIP2: "754.43.25",
    geo: "nas",
    service: "SSH",
    type: "Tentative de bruteforce",
    severity: "Critique",
  },
  {
    time: "+12.29:5-16",
    source: "185.40.283",
    sourceIP2: "754.43.25",
    geo: "nas",
    service: "http",
    type: "Scan de port suspect",
    severity: "Critique",
  },
  {
    time: "+12.29:5-16",
    source: "189.66.20-7",
    sourceIP2: "751.66.02",
    geo: "nas",
    service: "http",
    type: "Moyen Suspecte réseau",
    severity: "Moyen",
  },
];

const severityStyles: Record<string, string> = {
  Critique: "bg-red-500/10 text-red-300 border-red-500/30",
  Élevé: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  Moyen: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  Faible: "bg-green-500/10 text-green-300 border-green-500/30",
};

const defaultFilters: EventTableFilters = {
  rangeLabel: "24 tendances houres",
  sourceLabel: "Catégorie Source",
  severityLabel: "Événement",
  criticalityLabel: "Criticité",
};

const rangeOptions = ["24 tendances houres", "7 jours", "30 jours"];
const sourceOptions = ["Catégorie Source", "Toutes sources", "Sources externes"];
const severityOptions = ["Événement", "Tous événements", "Alertes uniquement"];
const criticalityOptions = ["Criticité", "Critique", "Élevé", "Moyen", "Faible"];

export default function EventTable({
  events,
  filters,
  onFilterChange,
  onExport,
}: EventTableProps) {
  const eventRows = events && events.length ? events : defaultEvents;
  const [currentFilters, setCurrentFilters] = useState(filters || defaultFilters);

  const handleFilterClick = (filterKey: keyof EventTableFilters) => {
    let options: string[] = [];
    switch (filterKey) {
      case "rangeLabel":
        options = rangeOptions;
        break;
      case "sourceLabel":
        options = sourceOptions;
        break;
      case "severityLabel":
        options = severityOptions;
        break;
      case "criticalityLabel":
        options = criticalityOptions;
        break;
    }

    const currentIndex = options.indexOf(currentFilters[filterKey]);
    const nextIndex = (currentIndex + 1) % options.length;

    setCurrentFilters({
      ...currentFilters,
      [filterKey]: options[nextIndex]
    });

    onFilterChange?.(filterKey);
  };

  const handleExport = () => {
    console.log("Exporting data...");
    alert("Export des données en cours...");
    onExport?.();
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 shadow-2xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(56,189,248,0.06),transparent_60%)]" />
      <div className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Historique d'événements
            </h3>
            <Info className="h-3.5 w-3.5 text-slate-500" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-slate-400">Critique</span>
                <span className="font-semibold text-slate-300">46</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                <span className="text-slate-400">Élevé</span>
                <span className="font-semibold text-slate-300">38</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="text-slate-400">Moyen</span>
                <span className="font-semibold text-slate-300">12</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <button
            className="rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 transition hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
            onClick={() => handleFilterClick("rangeLabel")}
            type="button"
          >
            {currentFilters.rangeLabel}
          </button>
          <button
            className="rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 transition hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
            onClick={() => handleFilterClick("sourceLabel")}
            type="button"
          >
            {currentFilters.sourceLabel}
          </button>
          <button
            className="rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 transition hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
            onClick={() => handleFilterClick("severityLabel")}
            type="button"
          >
            {currentFilters.severityLabel}
          </button>
          <button
            className="rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 transition hover:border-cyan-500/40 hover:text-cyan-300 active:scale-95"
            onClick={() => handleFilterClick("criticalityLabel")}
            type="button"
          >
            {currentFilters.criticalityLabel}
          </button>
          <button
            className="ml-auto flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-200 transition hover:border-cyan-400 hover:text-cyan-100 active:scale-95"
            onClick={handleExport}
            type="button"
          >
            <Download className="h-3 w-3" />
            Exporter
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/80">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800/60 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">IP Source</th>
                <th className="px-3 py-2.5">IP Source 2</th>
                <th className="px-3 py-2.5">Geo</th>
                <th className="px-3 py-2.5">Service</th>
                <th className="px-3 py-2.5">Type d'événement</th>
                <th className="px-3 py-2.5">Criticité</th>
              </tr>
            </thead>
            <tbody>
              {eventRows.map((event, index) => (
                <tr
                  key={`${event.source}-${index}`}
                  className="border-t border-slate-800/40 text-slate-300 transition hover:bg-slate-900/40"
                >
                  <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                    {event.time}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-cyan-300">
                    {event.source}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-cyan-300">
                    {event.sourceIP2}
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{event.geo}</td>
                  <td className="px-3 py-2.5 text-slate-200">{event.service}</td>
                  <td className="px-3 py-2.5 text-slate-300">{event.type}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] ${severityStyles[event.severity] || severityStyles.Faible
                        }`}
                    >
                      {event.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

