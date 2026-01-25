"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Globe, AlertTriangle, RefreshCw, Radio, Shield, Zap } from "lucide-react";
import * as THREE from 'three';

// Dynamic import for react-globe.gl (no SSR)
const Globe3D = dynamic(() => import("react-globe.gl"), { ssr: false });

// Interfaces
interface AttackPoint {
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
    bytesOut?: number;
}

interface Arc {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
    stroke: number;
}

type Flow = {
    ts_epoch: number;
    severity?: number;
    rule_id?: string;
    src: { ip: string; country?: any; city?: any; postal?: any; asn?: any; location: { lat: number; lon: number } };
    dst: { name?: string; ip?: string; location: { lat: number; lon: number } };
};

interface Globe3DMapProps {
    attacks?: AttackPoint[];
    timeRangeLabel?: string;
}

// Configuration
const TARGET = { lat: 48.8566, lng: 2.3522, name: "Paris SOC" };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8005";

export default function Globe3DMap({ attacks: initialAttacks, timeRangeLabel = "15m" }: Globe3DMapProps) {
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cloudRef = useRef<THREE.Mesh | null>(null);

    // State
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Fetch Countries GeoJSON for borders
        fetch("/data/countries.geojson")
            .then(r => r.json())
            .then(geo => setCountries(geo.features || []))
            .catch(err => console.warn("Failed to load countries.geojson", err));
    }, []);

    const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
    const [hoveredAttack, setHoveredAttack] = useState<AttackPoint | null>(null);
    const [currentTimeRange, setCurrentTimeRange] = useState(timeRangeLabel);

    // Real-time Data State
    const [flows, setFlows] = useState<Flow[]>([]);
    const [countries, setCountries] = useState<any[]>([]);

    // 2. SSE Connection
    useEffect(() => {
        // Fetch last 15 minutes of history so the map isn't empty on load
        // Redis Stream ID format: <millisecondsTime>-<sequenceNumber>
        const startId = `${Date.now() - 15 * 60 * 1000}-0`;
        const es = new EventSource(`${API_BASE}/map/stream?last_id=${startId}`);

        es.addEventListener("flow", (e: MessageEvent) => {
            try {
                const raw = JSON.parse(e.data);
                // Robust Mapper for Backend/Frontend compatibility
                const flow: Flow = {
                    ts_epoch: raw.timestamp_epoch || (Date.now() / 1000),
                    severity: typeof raw.severity === 'string' ?
                        (raw.severity.toLowerCase() === 'critical' ? 10 :
                            raw.severity.toLowerCase() === 'high' ? 8 :
                                raw.severity.toLowerCase() === 'medium' ? 5 : 2) : (raw.severity ?? 5),
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
                        location: { lat: raw.dst_lat || 0, lon: raw.dst_lon || 0 }
                    }
                };

                setFlows(prev => {
                    const next = [...prev, flow];
                    // Keep last 2000 for performance
                    return next.length > 2000 ? next.slice(next.length - 2000) : next;
                });
            } catch (err) {
                console.error("Error parsing flow event:", err);
            }
        });

        es.onerror = () => {
            // Browser handles reconnection automatically
            // Could add UI indicator here
        };

        return () => es.close();
    }, []);

    // 3. Aggregation Logic
    const windowSec = useMemo(() => {
        const map: Record<string, number> = { "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "6h": 21600 };
        return map[currentTimeRange] ?? 900;
    }, [currentTimeRange]);

    const nowEpoch = Math.floor(Date.now() / 1000);

    const derivedAttacks: AttackPoint[] = useMemo(() => {
        const agg = new Map<string, AttackPoint>();

        for (const f of flows) {
            if (!f?.src?.location) continue;
            // Filter by time window
            if ((f.ts_epoch || 0) < nowEpoch - windowSec) continue;

            const key = f.src.ip || `${f.src.location.lat},${f.src.location.lon}`;
            const sevNum = f.severity ?? 5;
            const sev: AttackPoint["severity"] =
                sevNum >= 9 ? "critical" : sevNum >= 7 ? "high" : sevNum >= 5 ? "medium" : "low";

            const city = f.src.city?.name ?? "";
            const postal = f.src.postal?.code ?? "";
            const country = f.src.country?.name ?? "UNKNOWN";

            const prev = agg.get(key);

            if (!prev) {
                agg.set(key, {
                    id: key,
                    lat: f.src.location.lat,
                    lng: f.src.location.lon,
                    country: country,
                    city: city,
                    postal: postal,
                    asn: f.src.asn?.number, // Assuming structure based on user input
                    org: f.src.asn?.org,    // Assuming structure based on user input
                    ip: f.src.ip ?? "unknown",
                    severity: sev,
                    count: 1,
                    lastSeenEpoch: f.ts_epoch,
                    topRuleId: f.rule_id,
                    bytesOut: 0 // Placeholder as flow might not have bytes clearly exposed in snippet type
                });
            } else {
                prev.count += 1;
                if (f.ts_epoch > (prev.lastSeenEpoch || 0)) {
                    prev.lastSeenEpoch = f.ts_epoch;
                }
                // Keep max severity in window
                const order = { low: 1, medium: 2, high: 3, critical: 4 } as const;
                if (order[sev] > order[prev.severity]) prev.severity = sev;
            }
        }
        return Array.from(agg.values());
    }, [flows, nowEpoch, windowSec]);

    // Use props attacks if flows are empty (fallback) or use flows if active
    const attackPoints = flows.length > 0 ? derivedAttacks : (initialAttacks || []);

    // 4. Arcs Calculation (Real traffic lines)
    const arcs: Arc[] = useMemo(() => {
        // If we have flows, use them for arcs
        if (flows.length > 0) {
            return flows
                .filter(f => f?.src?.location && f?.dst?.location && (f.ts_epoch >= nowEpoch - windowSec))
                .map(f => {
                    const sevNum = f.severity ?? 5;
                    const severity = sevNum >= 9 ? "critical" : sevNum >= 7 ? "high" : sevNum >= 5 ? "medium" : "low";

                    return {
                        startLat: f.src.location.lat,
                        startLng: f.src.location.lon,
                        endLat: f.dst.location.lat,
                        endLng: f.dst.location.lon,
                        color: severity === "critical" ? "rgba(239, 68, 68, 0.9)" :
                            severity === "high" ? "rgba(251, 146, 60, 0.8)" :
                                severity === "medium" ? "rgba(250, 204, 21, 0.7)" :
                                    "rgba(34, 197, 94, 0.6)",
                        stroke: severity === "critical" ? 1.5 : severity === "high" ? 1.2 : 0.8,
                    };
                });
        }

        // Fallback arcs (if using static props)
        return attackPoints.map((attack) => ({
            startLat: attack.lat,
            startLng: attack.lng,
            endLat: TARGET.lat,
            endLng: TARGET.lng,
            color: attack.severity === "critical" ? "rgba(239, 68, 68, 0.9)" :
                attack.severity === "high" ? "rgba(251, 146, 60, 0.8)" :
                    attack.severity === "medium" ? "rgba(250, 204, 21, 0.7)" :
                        "rgba(34, 197, 94, 0.6)",
            stroke: attack.severity === "critical" ? 1.5 : attack.severity === "high" ? 1.2 : 0.8,
        }));
    }, [flows, attackPoints, nowEpoch, windowSec]);

    // 5. Points Data with Rich HTML Tooltips
    const pointsData = useMemo(() => {
        const points = attackPoints.map((a) => {
            const sevColor =
                a.severity === "critical" ? "#ef4444" :
                    a.severity === "high" ? "#fb923c" :
                        a.severity === "medium" ? "#facc15" : "#22c55e";

            const geoLine = `${a.country}${a.city ? ` • ${a.city}` : ""}${a.postal ? ` ${a.postal}` : ""}`;
            const asLine = a.asn ? `AS${a.asn}${a.org ? ` • ${a.org}` : ""}` : "ASN: n/a";
            const ruleLine = a.topRuleId ? `Rule: ${a.topRuleId}` : "";
            const last = a.lastSeenEpoch ? new Date(a.lastSeenEpoch * 1000).toISOString().replace("T", " ").slice(0, 19) + "Z" : "";

            return {
                lat: a.lat,
                lng: a.lng,
                size: Math.min(0.6 + a.count / 100, 2),
                color: sevColor,
                label: `
                    <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding:8px; border-radius:10px; background:rgba(2,6,23,.95); border:1px solid rgba(34,211,238,.25); min-width: 200px;">
                        <div style="font-weight:700; color:white; margin-bottom: 4px;">${geoLine}</div>
                        <div style="color:#22d3ee; font-size:11px; font-weight: 500;">${a.ip}</div>
                        <div style="color:#94a3b8; font-size:11px; margin-top:6px;">${asLine}</div>
                        ${ruleLine ? `<div style="color:#e2e8f0; font-size:11px; margin-top:6px;">${ruleLine}</div>` : ""}
                        ${last ? `<div style="color:#64748b; font-size:10px; margin-top:4px;">Last: ${last}</div>` : ""}
                        <div style="margin-top:8px; display: flex; align-items: center; justify-content: space-between;">
                             <span style="font-size:10px; text-transform: uppercase; color: #64748b; font-weight: bold;">SEVERITY: ${a.severity}</span>
                             <span style="font-size:14px; color:${sevColor}; font-weight:800;">${a.count} events</span>
                        </div>
                    </div>
                `,
                attack: a,
            };
        });

        // Add Target point
        points.push({
            lat: TARGET.lat,
            lng: TARGET.lng,
            size: 2.2,
            color: "#06b6d4",
            label: `<div style="padding:4px 8px; font-weight:bold; color:cyan;">🎯 ${TARGET.name}</div>`,
            attack: { ...TARGET, id: 'target', severity: 'low', count: 0 } as any // Dummy attack object for safety
        });

        return points;
    }, [attackPoints]);

    // 6. HexBin Points (Density Layer)
    const hexPoints = useMemo(() => {
        return attackPoints.map(a => ({ lat: a.lat, lng: a.lng, weight: Math.max(1, a.count) }));
    }, [attackPoints]);

    // Stats calculation
    const stats = useMemo(() => {
        const countriesSet = new Set(attackPoints.map(attack => attack.country).filter(Boolean));
        const blocked = attackPoints.reduce((sum, attack) => sum + (attack.count || 0), 0);
        return {
            blocked,
            active: attackPoints.length,
            countries: countriesSet.size,
        };
    }, [attackPoints]);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Cloud animation
    const handleGlobeReady = () => {
        if (!globeRef.current) return;

        // Initial view
        globeRef.current.pointOfView({ lat: 30, lng: -20, altitude: 2.2 }, 1000);

        const controls = globeRef.current.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
            controls.enableZoom = true;
        }

        // Add Realistic Cloud Layer
        const globeMaterial = globeRef.current.getGlobeMaterial();
        if (globeMaterial) {
            globeMaterial.bumpScale = 15;

            // Add Specular (Hydro) Map for water reflections - "chof file hydo"
            new THREE.TextureLoader().load('/textures/earth-water.png', (texture) => {
                globeMaterial.specularMap = texture;
                globeMaterial.specular = new THREE.Color(0x444444);
                globeMaterial.shininess = 20;
            });
        }

        // Note: Using a fallback if local image is missing might need a check, 
        // but react-lobe.gl just won't render if it fails to load.
        // Assuming user puts 'earth-clouds.png' in textures as well or we use remote for clouds for now 
        // or just use colors if detailed clouds needed. keeping remote for clouds as user didn't specify local clouds explicitly, 
        // but to be safe and "offline capable" strictly, we should use local. I will use local path.
        const CLOUDS_IMG_URL = '/textures/earth-clouds.png';
        const CLOUDS_ALT = 0.015;

        new THREE.TextureLoader().load(CLOUDS_IMG_URL, (cloudsTexture) => {
            const clouds = new THREE.Mesh(
                new THREE.SphereGeometry(globeRef.current.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
                new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true, opacity: 0.4 })
            );
            globeRef.current.scene().add(clouds);
            cloudRef.current = clouds;
        }, undefined, (err) => {
            console.warn("Could not load cloud texture", err);
        });
    };

    // Fly to location
    const flyTo = (lat: number, lng: number) => {
        globeRef.current?.pointOfView({ lat, lng, altitude: 1.3 }, 1500);
    };

    const criticalCount = attackPoints.filter(a => a.severity === "critical").length;

    return (
        <section className="relative h-full overflow-hidden rounded-2xl border border-neon-1/20 bg-bg-0 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            {/* HUD Overlay */}
            <div className="relative z-20 flex items-center justify-between border-b border-border-1 bg-bg-2/40 backdrop-blur-xl px-4 py-2.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-1 to-p-500">
                        <Globe className="h-5 w-5 text-text-1" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-1 uppercase tracking-wider">Global Threat Intelligence</h3>
                        <p className="text-[10px] text-neon-1 font-mono flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            REAL-TIME STREAM :: {flows.length > 0 ? "LIVE" : "WAITING"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Window Selector */}
                    <div className="hidden md:flex bg-bg-2/50 rounded-lg p-0.5 border border-border-1">
                        {["5m", "15m", "1h", "6h"].map(range => (
                            <button
                                key={range}
                                onClick={() => setCurrentTimeRange(range)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded ${currentTimeRange === range ? 'bg-neon-1/20 text-neon-1 shadow-sm' : 'text-text-3 hover:text-text-2'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-text-3 uppercase">Total Events</span>
                        <span className="text-sm font-bold text-success font-mono">{stats.blocked}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-border-1 pl-4">
                        <span className="text-[9px] text-text-3 uppercase">Critical Nodes</span>
                        <span className="text-sm font-bold text-danger font-mono">{criticalCount}</span>
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
                {mounted && (
                    <Globe3D
                        ref={globeRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(0,0,0,0)"

                        // Local Assets for Enterprise Offline Support
                        globeImageUrl="/textures/earth-night.jpg"
                        bumpImageUrl="/textures/earth-topology.png"
                        backgroundImageUrl="/textures/night-sky.png"

                        atmosphereColor="#38bdf8"
                        atmosphereAltitude={0.15}

                        // Arcs (Traffic Lines)
                        arcsData={arcs}
                        arcStartLat={(d: any) => d.startLat}
                        arcStartLng={(d: any) => d.startLng}
                        arcEndLat={(d: any) => d.endLat}
                        arcEndLng={(d: any) => d.endLng}
                        arcColor={(d: any) => d.color}
                        arcAltitudeAutoScale={0.4}
                        arcStroke={(d: any) => d.stroke}
                        arcDashLength={0.4}
                        arcDashGap={4}
                        arcDashAnimateTime={1500}

                        // Points (Attacks + Target)
                        pointsData={pointsData}
                        pointLat={(d: any) => d.lat}
                        pointLng={(d: any) => d.lng}
                        pointColor={(d: any) => d.color}
                        pointAltitude={0.01}
                        pointRadius={(d: any) => d.size}
                        pointsMerge={false} // Important for detailed tooltips per point
                        onPointClick={(p: any) => {
                            if (p?.attack) {
                                flyTo(p.lat, p.lng);
                                setHoveredAttack(p.attack);
                            }
                        }}
                        pointLabel={(d: any) => d.label}

                        // HexBin (Heatmap/Density)
                        hexBinPointsData={hexPoints}
                        hexBinPointLat={(d: any) => d.lat}
                        hexBinPointLng={(d: any) => d.lng}
                        hexBinPointWeight={(d: any) => d.weight}
                        hexBinResolution={4}
                        hexMargin={0.2}
                        hexAltitude={(d: any) => 0.04 + Math.min(0.25, d.sumWeight / 5000)}
                        hexTopColor={(d: any) => `rgba(239,68,68,${Math.min(0.85, 0.2 + d.sumWeight / 2000)})`}
                        hexSideColor={() => "rgba(6,182,212,0.08)"}

                        // Polygons (Countries Borders)
                        polygonsData={countries}
                        polygonAltitude={0.006}
                        polygonCapColor={() => "rgba(15,23,42,0.25)"} // Transparent dark fill
                        polygonSideColor={() => "rgba(6,182,212,0.08)"}
                        polygonStrokeColor={() => "rgba(34,211,238,0.15)"} // Cyan low opacity borders
                        polygonLabel={(d: any) => `
                          <div style="padding:6px 8px; background:rgba(2,6,23,.9); border:1px solid rgba(34,211,238,.25); border-radius:6px;">
                            <div style="color:white; font-weight:700; font-size: 12px; font-family: monospace;">${d.properties?.name || "Country"}</div>
                          </div>
                        `}

                        // Rings (Target Pulse)
                        ringsData={[{ lat: TARGET.lat, lng: TARGET.lng }]}
                        ringLat={(d: any) => d.lat}
                        ringLng={(d: any) => d.lng}
                        ringColor={() => (t: number) => `rgba(6,182,212,${1 - t})`}
                        ringMaxRadius={6}
                        ringPropagationSpeed={2.5}
                        ringRepeatPeriod={1000}

                        onGlobeReady={handleGlobeReady}
                    />
                )}

                {/* Info Overlay */}
                <div className="absolute bottom-6 left-6 z-20 space-y-2 pointer-events-none">
                    <div className="flex items-center gap-2 rounded-lg bg-black/60 border border-neon-1/30 px-3 py-2 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Radio className="h-3.5 w-3.5 text-neon-1 animate-pulse" />
                        <span className="text-[10px] font-bold text-text-1 font-mono tracking-tighter uppercase">
                            Operational Base: {TARGET.name}
                        </span>
                    </div>
                </div>

                {/* Optional: We can still show the Hover UI card if we want, OR rely on the detailed HTML tooltip. 
                    The user explicitly requested "Tooltip HTML" in point 2. 
                    However, the original code had a nice motion div. 
                    The react-globe.gl `pointLabel` shows a native-like tooltip which is very fast. 
                    If we use pointLabel with HTML, it renders *on hover* automatically by the library. 
                    We can keep the side panel for "clicked" state or remove it to avoid double tooltip. 
                    I'll keep the side panel only if a point is CLICKED or Hovered? 
                    The library tooltip is usually good enough for "hover". 
                    I will comment out the old "Hover UI" to avoid cluttering, or repurpose it for "Live Feed" list if needed later. 
                    Actually, let's keep it but make it show the "Last Clicked" / "Focused" attack details if we want persistent view. 
                */}
            </div>
        </section>
    );
}
