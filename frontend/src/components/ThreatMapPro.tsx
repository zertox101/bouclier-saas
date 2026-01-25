"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Globe as GlobeIcon, Clock, TrendingUp, Shield, Upload, FileCode } from "lucide-react";
import dynamic from "next/dynamic";
import * as THREE from 'three';
import { kml } from "@mapbox/togeojson";


const Globe3D = dynamic(() => import("react-globe.gl"), { ssr: false });

interface AttackPoint {
    lat: number;
    lng: number;
    country: string;
    countryCode: string;
    count: number;
    severity: "critical" | "high" | "medium" | "low";
}

interface Arc {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
}

const TARGET = { lat: 33.5731, lng: -7.5898, name: "Casablanca", code: "MA" };

const ATTACK_TYPES = [
    { name: "Brute Force", percentage: 33, color: "#ef4444" },
    { name: "Port Scan", percentage: 27, color: "#f97316" },
    { name: "Phishing", percentage: 19, color: "#f59e0b" },
    { name: "DDoS", percentage: 15, color: "#3b82f6" },
    { name: "Ransomware", percentage: 6, color: "#8b5cf6" },
];

export default function ThreatMapPro() {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

    // Real-time data states
    const [attackPoints, setAttackPoints] = useState<AttackPoint[]>([]);
    const [countryAttacks, setCountryAttacks] = useState<Array<{ name: string; code: string; count: number; flag: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    // map Data States
    const [customPolygons, setCustomPolygons] = useState<any[]>([]);
    const [customPaths, setCustomPaths] = useState<any[]>([]);
    const [customPoints, setCustomPoints] = useState<any[]>([]);


    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch real-time attack data
    const fetchAttackData = async () => {
        try {
            setIsLoading(true);

            // Fetch attack points from backend
            const pointsRes = await fetch(`${apiBase}/map/points?limit=100`);
            if (!pointsRes.ok) throw new Error("Failed to fetch attack points");

            const pointsData = await pointsRes.json();
            const points = pointsData.points || [];

            // Map to AttackPoint interface
            const mappedPoints: AttackPoint[] = points.map((point: any) => {
                const severity = String(point.severity || "low").toLowerCase();
                return {
                    lat: point.lat,
                    lng: point.lng,
                    country: point.country || "UNKNOWN",
                    countryCode: point.country_code || point.country?.substring(0, 2).toUpperCase() || "XX",
                    count: Number(point.count || 1),
                    severity: severity === "critical" ? "critical" :
                        severity === "high" ? "high" :
                            severity === "medium" ? "medium" : "low",
                };
            });

            setAttackPoints(mappedPoints);

            // Aggregate by country for the sidebar
            const countryMap = new Map<string, { count: number; lat: number; lng: number }>();
            mappedPoints.forEach(point => {
                const existing = countryMap.get(point.countryCode);
                if (existing) {
                    existing.count += point.count;
                } else {
                    countryMap.set(point.countryCode, {
                        count: point.count,
                        lat: point.lat,
                        lng: point.lng
                    });
                }
            });

            // Country flags mapping
            const flagMap: Record<string, string> = {
                CN: "🇨🇳", RU: "🇷🇺", BR: "🇧🇷", US: "🇺🇸", DE: "🇩🇪",
                FR: "🇫🇷", GB: "🇬🇧", IN: "🇮🇳", JP: "🇯🇵", KR: "🇰🇷",
                UA: "🇺🇦", VN: "🇻🇳", TR: "🇹🇷", NL: "🇳🇱", CA: "🇨🇦",
                MA: "🇲🇦", XX: "🏴"
            };

            const countryNameMap: Record<string, string> = {
                CN: "China", RU: "Russia", BR: "Brazil", US: "United States", DE: "Germany",
                FR: "France", GB: "United Kingdom", IN: "India", JP: "Japan", KR: "South Korea",
                UA: "Ukraine", VN: "Vietnam", TR: "Turkey", NL: "Netherlands", CA: "Canada",
                MA: "Morocco", XX: "Unknown"
            };

            // Convert to array and sort by count
            const countriesArray = Array.from(countryMap.entries())
                .map(([code, data]) => ({
                    name: countryNameMap[code] || code,
                    code,
                    count: data.count,
                    flag: flagMap[code] || "🏴"
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); // Top 10

            setCountryAttacks(countriesArray);
            setIsLoading(false);

        } catch (error) {
            console.error("Error fetching attack data:", error);
            // Fallback to some data on error
            setCountryAttacks([
                { name: "China", code: "CN", count: 185, flag: "🇨🇳" },
                { name: "Russia", code: "RU", count: 147, flag: "🇷🇺" },
                { name: "Brazil", code: "BR", count: 96, flag: "🇧🇷" },
            ]);
            setIsLoading(false);
        }
    };

    // Fetch on mount and refresh every 30 seconds
    useEffect(() => {
        fetchAttackData();
        const interval = setInterval(fetchAttackData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle resize
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Generate arcs from attack points to target
    const arcs: Arc[] = useMemo(() => {
        return attackPoints.map(point => ({
            startLat: point.lat,
            startLng: point.lng,
            endLat: TARGET.lat,
            endLng: TARGET.lng,
            color: point.severity === "critical" ? "rgba(239, 68, 68, 0.8)" :
                point.severity === "high" ? "rgba(249, 115, 22, 0.7)" : "rgba(245, 158, 11, 0.6)",
        }));
    }, [attackPoints]);

    const handleKmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            try {
                // Use browser's native DOMParser
                const parser = new DOMParser();
                const kmlDoc = parser.parseFromString(text, 'text/xml');
                const geoJson = kml(kmlDoc);

                const newPolygons: any[] = [];
                const newPaths: any[] = [];
                const newPoints: any[] = [];

                if (geoJson.type === 'FeatureCollection') {
                    geoJson.features.forEach((feature: any) => {
                        const type = feature.geometry.type;
                        if (type === 'Polygon' || type === 'MultiPolygon') {
                            newPolygons.push(feature);
                        } else if (type === 'LineString' || type === 'MultiLineString') {
                            newPaths.push(feature);
                        } else if (type === 'Point') {
                            // Convert GeoJSON point to our format or keep as is if Globe supports it
                            // react-globe.gl pointsData usually takes manual objects, but we can adapt
                            const [lng, lat] = feature.geometry.coordinates;
                            newPoints.push({
                                lat,
                                lng,
                                count: 1, // Default
                                severity: 'high', // Default
                                name: feature.properties?.name || 'KML Point'
                            });
                        }
                    });
                }

                setCustomPolygons(newPolygons);
                setCustomPaths(newPaths);
                setCustomPoints(newPoints);

                console.log(`Loaded KML: ${newPolygons.length} polygons, ${newPaths.length} paths, ${newPoints.length} points`);

            } catch (err) {
                console.error("Error parsing KML:", err);
                alert("Failed to parse KML file.");
            }
        };
        reader.readAsText(file);
    };


    const handleGlobeReady = () => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 30, lng: -20, altitude: 2.5 }, 1000);

        const controls = globeRef.current.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.3;
        }
    };

    // Stats for right panel
    const totalAttacks = countryAttacks.reduce((sum, c) => sum + c.count, 0);
    const criticalCount = attackPoints.filter(a => a.severity === "critical").length;
    const highCount = attackPoints.filter(a => a.severity === "high").length;
    const mediumCount = attackPoints.filter(a => a.severity === "medium").length;

    return (
        <div className="relative h-full w-full bg-transparent overflow-hidden">
            {/* Starfield Background */}
            <div className="absolute inset-0 bg-[url('/textures/stars.png')] opacity-30" />

            {/* Top Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#0a0e1a] to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <GlobeIcon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Threat Map</h1>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    {/* Upload KML Button */}
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg cursor-pointer transition-colors group backdrop-blur-md">
                        <Upload className="h-4 w-4 text-slate-400 group-hover:text-cyan-400" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Load KML</span>
                        <input
                            type="file"
                            accept=".kml,.xml"
                            className="hidden"
                            onChange={handleKmlUpload}
                        />
                    </label>

                    {/* Severity Legend */}
                    <div className="flex items-center gap-6 bg-slate-900/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-xs font-medium text-red-400">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <span className="text-xs font-medium text-orange-400">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span className="text-xs font-medium text-yellow-400">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-400">Low</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="absolute inset-0 pt-20 pb-32 px-6">
                <div className="h-full grid grid-cols-12 gap-6">

                    {/* Left Panel - Attacks Timeline */}
                    <div className="col-span-3 space-y-4">
                        <div className="bg-[#0f1419]/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Attacks Timeline</h2>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400">Real-time</span>
                                </div>
                            </div>

                            {/* Country Filter */}
                            <div className="mb-6">
                                <select className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                                    <option>China</option>
                                    <option>All Countries</option>
                                </select>
                            </div>

                            {/* Country List */}
                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="text-center text-slate-500 py-4">Loading...</div>
                                ) : countryAttacks.length === 0 ? (
                                    <div className="text-center text-slate-500 py-4">No data available</div>
                                ) : (
                                    countryAttacks.map((country, idx) => (
                                        <div key={country.code} className="flex items-center justify-between group hover:bg-slate-800/30 rounded-lg p-2 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{country.flag}</span>
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-white">{country.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">{country.count}</div>
                                                <div className="h-1 w-20 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                        style={{ width: `${Math.min(100, (country.count / (countryAttacks[0]?.count || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Top Attack Types (Left) */}
                            <div className="mt-8 pt-6 border-t border-slate-800">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Attack Types</h3>
                                <div className="space-y-3">
                                    {ATTACK_TYPES.map(type => (
                                        <div key={type.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                                                <span className="text-sm text-slate-300">{type.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{type.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Panel - Globe */}
                    <div className="col-span-6 relative">
                        <div ref={containerRef} className="h-full w-full rounded-2xl border border-slate-800/50 bg-gradient-to-b from-slate-900/20 to-transparent overflow-hidden">
                            {mounted && (
                                <Globe3D
                                    ref={globeRef}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    backgroundColor="rgba(0,0,0,0)"
                                    globeImageUrl="/textures/earth-night.jpg"
                                    bumpImageUrl="/textures/earth-topology.png"
                                    atmosphereColor="#38bdf8"
                                    atmosphereAltitude={0.15}

                                    // Arcs
                                    arcsData={arcs}
                                    arcStartLat={(d: any) => d.startLat}
                                    arcStartLng={(d: any) => d.startLng}
                                    arcEndLat={(d: any) => d.endLat}
                                    arcEndLng={(d: any) => d.endLng}
                                    arcColor={(d: any) => d.color}
                                    arcAltitudeAutoScale={0.4}
                                    arcStroke={1.5}
                                    arcDashLength={0.5}
                                    arcDashGap={2}
                                    arcDashAnimateTime={1500}

                                    // Polygons (KML)
                                    polygonsData={customPolygons}
                                    polygonGeoJsonGeometry={(d: any) => d.geometry}
                                    polygonSideColor={() => 'rgba(6, 182, 212, 0.1)'}
                                    polygonCapColor={() => 'rgba(6, 182, 212, 0.2)'}
                                    polygonStrokeColor={() => '#22d3ee'}
                                    polygonLabel={({ properties }: any) => `
                                        <div style="background:#0f172a; color:white; padding:4px 8px; border-radius:4px; font-size:12px;">
                                            ${properties?.name || 'Zone'}
                                        </div>
                                    `}

                                    // Paths (KML)
                                    pathsData={customPaths}
                                    pathPoints={(d: any) => d.geometry.coordinates}
                                    pathColor={() => '#a78bfa'}
                                    pathDashLength={0.1}
                                    pathDashGap={0.05}
                                    pathDashAnimateTime={2000}


                                    // Points
                                    pointsData={[...attackPoints, ...customPoints, { lat: TARGET.lat, lng: TARGET.lng, count: 512, severity: "low" as const }]}

                                    pointLat={(d: any) => d.lat}
                                    pointLng={(d: any) => d.lng}
                                    pointColor={(d: any) =>
                                        d.count === 512 ? "#06b6d4" :
                                            d.name ? "#a78bfa" : // KML points
                                                d.severity === "critical" ? "#ef4444" :
                                                    d.severity === "high" ? "#f97316" : "#f59e0b"
                                    }

                                    pointAltitude={0.01}
                                    pointRadius={(d: any) => d.count === 512 ? 0.8 : 0.4}

                                    onGlobeReady={handleGlobeReady}
                                />
                            )}
                        </div>

                        {/* Bottom Stats Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-[#0f1419]/95 backdrop-blur-xl border-t border-slate-800/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Top Attack Types</h3>
                                <span className="text-xs text-slate-500">Now</span>
                            </div>
                            <div className="grid grid-cols-5 gap-4 mt-3">
                                {ATTACK_TYPES.map(type => (
                                    <div key={type.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-400">{type.name}</span>
                                            <span className="text-xs font-bold text-white">{type.percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${type.percentage}%`,
                                                    backgroundColor: type.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Target Overview */}
                    <div className="col-span-3 space-y-4">
                        <div className="bg-[#0f1419]/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                            {/* Target Info */}
                            <div className="mb-6">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Target Overview</h2>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">🇫🇷</span>
                                    <h3 className="text-2xl font-bold text-white">{TARGET.name}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Last 24hr</span>
                                    <span className="ml-auto text-2xl font-bold text-white">{totalAttacks}</span>
                                </div>
                            </div>

                            {/* Top Attack Types (Right) */}
                            <div className="mb-6 pb-6 border-b border-slate-800">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Attack Types</h3>
                                <div className="space-y-3">
                                    {ATTACK_TYPES.map(type => (
                                        <div key={type.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-3 w-3" style={{ color: type.color }} />
                                                    <span className="text-sm text-slate-300">{type.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-white">{type.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${type.percentage * 3}%`,
                                                        backgroundColor: type.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attack Distribution Graph */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attack Distribution</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <span>Last</span>
                                        <span className="font-bold text-white">56</span>
                                    </div>
                                </div>

                                {/* Simple Area Chart */}
                                <div className="h-32 relative">
                                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,80 Q50,40 75,50 T150,45 Q200,30 225,40 T300,35 L300,100 L0,100 Z"
                                            fill="url(#areaGradient)"
                                            stroke="none"
                                        />
                                        <path
                                            d="M0,80 Q50,40 75,50 T150,45 Q200,30 225,40 T300,35"
                                            fill="none"
                                            stroke="#06b6d4"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </div>

                                {/* Time Labels */}
                                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                                    <span>Feb 2, 2m</span>
                                    <span>8 am</span>
                                </div>
                            </div>

                            {/* Real-time Stats */}
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Top Tunes</span>
                                    <span className="text-3xl font-bold text-white">{totalAttacks}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="h-2 w-2 rounded-full bg-red-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-red-400">Critical</div>
                                        <div className="text-xs text-slate-500">{criticalCount * 35}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-2 w-2 rounded-full bg-orange-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-orange-400">High</div>
                                        <div className="text-xs text-slate-500">{highCount * 12}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-2 w-2 rounded-full bg-cyan-500 mx-auto mb-1" />
                                        <div className="text-sm font-bold text-cyan-400">Medium</div>
                                        <div className="text-xs text-slate-500">{mediumCount * 7}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
