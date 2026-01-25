"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Radio, ShieldAlert, Zap, AlertTriangle, Upload } from "lucide-react";
import DeckGL from "@deck.gl/react";
import { ArcLayer, ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import MapGL, { NavigationControl } from "react-map-gl/maplibre";
import { kml } from "@mapbox/togeojson";

const INITIAL_VIEW_STATE = {
    longitude: 0,
    latitude: 20,
    zoom: 1.2,
    pitch: 0,
    bearing: 0
};

type Flow = {
    ts_epoch: number;
    severity?: number | string;
    rule_id?: string;
    src: { ip: string; country?: any; city?: any; postal?: any; asn?: any; location: { lat: number; lon: number } };
    dst: { name?: string; ip?: string; location: { lat: number; lon: number } };
};

type AttackPoint = {
    id: string;
    lat: number;
    lng: number;
    country: string;
    city?: string;
    postal?: string;
    asn?: number;
    org?: string;
    ip: string;
    severity: "critical" | "high" | "medium" | "low";
    count: number;
    lastSeenEpoch?: number;
    topRuleId?: string;
};

const TARGET = { lat: 48.8566, lng: 2.3522, name: "Paris SOC" };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8005";

// Map style (remote). تقدر تبدلو لاحقاً ل style ديالك.
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

// Mock Data Generators
const MOCK_COUNTRIES = [
    { name: "China", lat: 35.8617, lon: 104.1954 },
    { name: "Russia", lat: 61.5240, lon: 105.3188 },
    { name: "US", lat: 37.0902, lon: -95.7129 },
    { name: "Brazil", lat: -14.2350, lon: -51.9253 },
    { name: "India", lat: 20.5937, lon: 78.9629 },
];

const generateMockFlow = (): Flow => {
    const src = MOCK_COUNTRIES[Math.floor(Math.random() * MOCK_COUNTRIES.length)];
    // Add randomness to lat/lon
    const lat = src.lat + (Math.random() - 0.5) * 10;
    const lon = src.lon + (Math.random() - 0.5) * 10;
    const sevNum = Math.random() > 0.8 ? 10 : Math.random() > 0.5 ? 7 : 5;

    return {
        ts_epoch: Math.floor(Date.now() / 1000),
        severity: sevNum,
        rule_id: "START_ET_MOCK",
        src: {
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: { name: src.name },
            location: { lat, lon }
        },
        dst: {
            location: { lat: TARGET.lat, lon: TARGET.lng }
        }
    };
};

export default function ThreatMap2D({ timeRangeLabel = "15m" }: { timeRangeLabel?: string }) {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [currentTimeRange, setCurrentTimeRange] = useState(timeRangeLabel);
    const [mockMode, setMockMode] = useState(false);
    const [streamActive, setStreamActive] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mockWarning, setMockWarning] = useState<string | null>(null);
    const [customGeoJson, setCustomGeoJson] = useState<any>(null); // State for KML
    const mockModeRef = useRef(mockMode);

    useEffect(() => {
        mockModeRef.current = mockMode;
    }, [mockMode]);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // SSE Realtime
    useEffect(() => {
        let es: EventSource | null = null;
        let mockInterval: NodeJS.Timeout;

        const connectSSE = () => {
            const startId = `${Date.now() - 15 * 60 * 1000}-0`;
            es = new EventSource(`${API_BASE}/map/stream?last_id=${startId}`);

            es.addEventListener("open", () => {
                console.log("SSE Connected");
                setStreamActive(true);
                setMockMode(false);
                setMockWarning(null);
            });

            es.addEventListener("flow", (e: MessageEvent) => {
                try {
                    const raw = JSON.parse(e.data);
                    // Robust mapping of severity
                    const sevNum =
                        typeof raw.severity === "string"
                            ? raw.severity.toLowerCase() === "critical"
                                ? 10
                                : raw.severity.toLowerCase() === "high"
                                    ? 8
                                    : raw.severity.toLowerCase() === "medium"
                                        ? 5
                                        : 2
                            : raw.severity ?? 5;

                    const flow: Flow = {
                        ts_epoch: raw.timestamp_epoch || Math.floor(Date.now() / 1000),
                        severity: sevNum,
                        rule_id: raw.rule_id || "unknown",
                        src: raw.src_geo || {
                            ip: raw.src_ip || "unknown",
                            location: { lat: raw.src_lat || 0, lon: raw.src_lon || 0 },
                            country: { name: raw.src_country || raw.src_country_iso || "Unknown" },
                            city: { name: raw.src_city },
                            postal: { code: raw.src_postal },
                            asn: { number: raw.src_asn_number, org: raw.src_asn_org }
                        },
                        dst: raw.dst_geo || {
                            ip: raw.dst_ip,
                            location: { lat: raw.dst_lat || TARGET.lat, lon: raw.dst_lon || TARGET.lng }
                        }
                    };

                    setFlows((prev) => {
                        const next = [...prev, flow];
                        return next.length > 2000 ? next.slice(next.length - 2000) : next;
                    });
                    // We received real data, ensure mock is off
                    setMockMode(false);
                    setMockWarning(null);
                } catch (err) {
                    console.error("Error parsing flow:", err);
                }
            });

            es.addEventListener("error", (e) => {
                console.warn("SSE Error (Normal if backend down):", e);
                es?.close();
                setStreamActive(false);
                // Enable mock mode if connection fails
                setMockMode(true);
                setMockWarning("Realtime stream is offline. Displaying synthetic telemetry until the backend reconnects.");
            });
        };

        connectSSE();

        // MOCK GENERATOR: If we are in mock mode, generate data
        mockInterval = setInterval(() => {
            if (mockModeRef.current) {
                const flowsCount = Math.floor(Math.random() * 3) + 1;
                const newFlows = Array.from({ length: flowsCount }, generateMockFlow);
                setFlows((prev) => {
                    const next = [...prev, ...newFlows];
                    return next.length > 2000 ? next.slice(next.length - 2000) : next;
                });
            }
        }, 800);

        return () => {
            es?.close();
            clearInterval(mockInterval);
        };
    }, []); // Only run once on mount

    const windowSec = useMemo(() => {
        const map: Record<string, number> = { "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "6h": 21600 };
        return map[currentTimeRange] ?? 900;
    }, [currentTimeRange]);

    const nowEpoch = Math.floor(Date.now() / 1000);

    const attackPoints: AttackPoint[] = useMemo(() => {
        const agg = new Map<string, AttackPoint>();

        for (const f of flows) {
            if (!f?.src?.location) continue;
            if ((f.ts_epoch || 0) < nowEpoch - windowSec) continue;

            const key = f.src.ip || `${f.src.location.lat},${f.src.location.lon}`;
            const sevNum = (f.severity as number) ?? 5;
            const sev: AttackPoint["severity"] = sevNum >= 9 ? "critical" : sevNum >= 7 ? "high" : sevNum >= 5 ? "medium" : "low";

            const city = f.src.city?.name ?? "";
            const postal = f.src.postal?.code ?? "";
            const country = f.src.country?.name ?? "UNKNOWN";

            const prev = agg.get(key);
            if (!prev) {
                agg.set(key, {
                    id: key,
                    lat: f.src.location.lat,
                    lng: f.src.location.lon,
                    country,
                    city,
                    postal,
                    asn: f.src.asn?.number,
                    org: f.src.asn?.org,
                    ip: f.src.ip ?? "unknown",
                    severity: sev,
                    count: 1,
                    lastSeenEpoch: f.ts_epoch,
                    topRuleId: f.rule_id
                });
            } else {
                prev.count += 1;
                if (f.ts_epoch > (prev.lastSeenEpoch || 0)) prev.lastSeenEpoch = f.ts_epoch;
                const order = { low: 1, medium: 2, high: 3, critical: 4 } as const;
                if (order[sev] > order[prev.severity]) prev.severity = sev;
            }
        }

        return Array.from(agg.values());
    }, [flows, nowEpoch, windowSec]);

    const arcs = useMemo(() => {
        // performance: xlast 400 flows only
        const recent = flows.filter((f) => f?.src?.location && f?.dst?.location && f.ts_epoch >= nowEpoch - windowSec).slice(-400);

        return recent.map((f) => {
            const sevNum = (f.severity as number) ?? 5;
            const severity = sevNum >= 9 ? "critical" : sevNum >= 7 ? "high" : sevNum >= 5 ? "medium" : "low";

            // RGBA array for deck.gl
            const color: [number, number, number, number] =
                severity === "critical" ? [239, 68, 68, 220] :
                    severity === "high" ? [251, 146, 60, 200] :
                        severity === "medium" ? [250, 204, 21, 180] :
                            [34, 197, 94, 160];

            return {
                source: [f.src.location.lon, f.src.location.lat] as [number, number],
                target: [f.dst.location.lon ?? TARGET.lng, f.dst.location.lat ?? TARGET.lat] as [number, number],
                color,
                severity
            };
        });
    }, [flows, nowEpoch, windowSec]);

    const stats = useMemo(() => {
        const countriesSet = new Set(attackPoints.map((a) => a.country).filter(Boolean));
        const blocked = attackPoints.reduce((sum, a) => sum + (a.count || 0), 0);
        const criticalCount = attackPoints.filter((a) => a.severity === "critical").length;
        return { blocked, active: attackPoints.length, countries: countriesSet.size, criticalCount };
    }, [attackPoints]);

    const handleKmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;
            try {
                const parser = new DOMParser();
                const kmlDoc = parser.parseFromString(text, 'text/xml');
                const geoJson = kml(kmlDoc);
                setCustomGeoJson(geoJson);
                console.log("Loaded KML for 2D map:", geoJson);
            } catch (err) {
                console.error("Error parsing KML:", err);
                alert("Failed to parse KML.");
            }
        };
        reader.readAsText(file);
    };

    const layers = useMemo(() => {
        const heatData = attackPoints.map((a) => ({ position: [a.lng, a.lat] as [number, number], weight: Math.max(1, a.count) }));

        // KML GeoJSON Layer
        const kmlLayer = customGeoJson ? new GeoJsonLayer({
            id: 'kml-layer',
            data: customGeoJson,
            opacity: 0.5,
            stroked: true,
            filled: true,
            fontSize: 12,
            getFillColor: [6, 182, 212, 40], // Cyan tint
            getLineColor: [34, 211, 238, 200], // Cyan border
            getLineWidth: 2,
            getPointRadius: 8,
            getText: (f: any) => f.properties.name,
            getTextColor: [255, 255, 255, 255],
            pickable: true
        }) : null;

        return [
            kmlLayer,
            new HeatmapLayer({
                id: "heat",
                data: heatData,
                getPosition: (d: any) => d.position,
                getWeight: (d: any) => d.weight,
                radiusPixels: 40,
                intensity: 1,
                threshold: 0.05
            }),

            new ArcLayer({
                id: "arcs",
                data: arcs,
                getSourcePosition: (d: any) => d.source,
                getTargetPosition: (d: any) => d.target,
                getSourceColor: (d: any) => d.color,
                getTargetColor: (d: any) => d.color,
                getWidth: () => 2,
                greatCircle: true,
                pickable: false
            }),

            new ScatterplotLayer({
                id: "points",
                data: [
                    ...attackPoints,
                    { id: "target", lat: TARGET.lat, lng: TARGET.lng, country: TARGET.name, ip: "target", severity: "low", count: 0 } as any
                ],
                getPosition: (d: any) => [d.lng, d.lat],
                getRadius: (d: any) => (d.id === "target" ? 90000 : Math.min(40000 + (d.count || 1) * 1200, 160000)),
                radiusUnits: "meters",
                getFillColor: (d: any) => {
                    if (d.id === "target") return [6, 182, 212, 230];
                    return d.severity === "critical" ? [239, 68, 68, 230] :
                        d.severity === "high" ? [251, 146, 60, 210] :
                            d.severity === "medium" ? [250, 204, 21, 200] :
                                [34, 197, 94, 190];
                },
                stroked: true,
                getLineColor: () => [255, 255, 255, 40],
                lineWidthUnits: "pixels",
                lineWidthMinPixels: 1,
                pickable: true,
                autoHighlight: true
            })
        ].filter(Boolean); // Filter out null layers
    }, [attackPoints, arcs, customGeoJson]);

    // @ts-ignore
    const getTooltip = ({ object }: any) => {
        if (!object) return null;

        // Custom KML Tooltip
        if (object.properties && object.properties.name) {
            return { html: `<div style="padding:4px 8px; font-weight:bold; color:#22d3ee;">${object.properties.name}</div>` };
        }

        if (object.id === "target") {
            return { html: `<div style="padding:6px 8px; font-family: ui-monospace, monospace; color: cyan; font-weight: 800;">🎯 ${TARGET.name}</div>` };
        }

        const geoLine = `${object.country || ""}${object.city ? ` • ${object.city}` : ""}${object.postal ? ` ${object.postal}` : ""}`;
        const asLine = object.asn ? `AS${object.asn}${object.org ? ` • ${object.org}` : ""}` : "ASN: n/a";
        const ruleLine = object.topRuleId ? `Rule: ${object.topRuleId}` : "";
        const last = object.lastSeenEpoch
            ? new Date(object.lastSeenEpoch * 1000).toISOString().replace("T", " ").slice(0, 19) + "Z"
            : "";

        const sevColor =
            object.severity === "critical" ? "#ef4444" :
                object.severity === "high" ? "#fb923c" :
                    object.severity === "medium" ? "#facc15" : "#22c55e";

        return {
            html: `
        <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    padding:10px; border-radius:12px; background:rgba(2,6,23,.95);
                    border:1px solid rgba(34,211,238,.25); min-width:220px;">
          <div style="font-weight:800; color:white; margin-bottom:4px;">${geoLine}</div>
          <div style="color:#22d3ee; font-size:11px; font-weight:600;">${object.ip}</div>
          <div style="color:#94a3b8; font-size:11px; margin-top:6px;">${asLine}</div>
          ${ruleLine ? `<div style="color:#e2e8f0; font-size:11px; margin-top:6px;">${ruleLine}</div>` : ""}
          ${last ? `<div style="color:#64748b; font-size:10px; margin-top:4px;">Last: ${last}</div>` : ""}
          <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
             <span style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:800;">Severity: ${object.severity}</span>
            <span style="font-size:14px; color:${sevColor}; font-weight:900;">${object.count} events</span>
          </div>
        </div>
      `,
            style: {
                background: 'rgba(0,0,0,0)',
                padding: '0px',
                color: 'white'
            }
        };
    };

    return (
        <section className="relative h-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            {/* HUD */}
            <div className="relative z-20 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl px-4 py-2.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Threat Intelligence</h3>
                        <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 bg-emerald-500`}></span>
                            </span>
                            REAL-TIME STREAM :: LIVE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* KML Upload */}
                    <label className="flex items-center gap-2 px-3 py-1 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg cursor-pointer transition-colors group">
                        <Upload className="h-3 w-3 text-slate-400 group-hover:text-cyan-400" />
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">KML</span>
                        <input
                            type="file"
                            accept=".kml,.xml"
                            className="hidden"
                            onChange={handleKmlUpload}
                        />
                    </label>

                    <div className="hidden md:flex bg-slate-800/50 rounded-lg p-0.5 border border-white/10">
                        {["5m", "15m", "1h", "6h"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setCurrentTimeRange(range)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded ${currentTimeRange === range ? "bg-cyan-500/20 text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase">Total Events</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">{stats.blocked}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-white/10 pl-4">
                        <span className="text-[9px] text-slate-500 uppercase">Critical Nodes</span>
                        <span className="text-sm font-bold text-red-500 font-mono">{stats.criticalCount}</span>
                    </div>
                </div>
            </div>

            {/* MAP */}
            <div className="relative flex-1 bg-black/20">
                {mounted && (
                    <DeckGL
                        id="threat-map-v9"
                        controller={true}
                        layers={layers}
                        getTooltip={getTooltip}
                        initialViewState={INITIAL_VIEW_STATE as any}
                        style={{ position: 'absolute', height: '100%', width: '100%' }}
                    >
                        <MapGL
                            mapStyle={MAP_STYLE}
                            reuseMaps={true}
                            attributionControl={false}
                        >
                            <NavigationControl position="top-left" showCompass={false} />
                        </MapGL>
                    </DeckGL>
                )}

                {mockMode && mockWarning && (
                    <div className="absolute top-full left-0 right-0 mt-2 px-4">
                        <div className="flex items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-[11px] font-bold text-yellow-200">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            {mockWarning}
                        </div>
                    </div>
                )}

                {/* Bottom-left tag */}
                <div className="absolute bottom-6 left-6 z-20 space-y-2 pointer-events-none">
                    <div className="flex items-center gap-2 rounded-lg bg-black/60 border border-cyan-500/30 px-3 py-2 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-white font-mono tracking-tighter uppercase">
                            Operational Base: {TARGET.name}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
