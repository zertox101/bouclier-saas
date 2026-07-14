"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
    Activity,
    Globe,
    Navigation,
    Radio,
    Shield,
    Zap,
    Crosshair,
    Maximize2,
    Settings,
    Layers
} from "lucide-react";
import DeckGL from "@deck.gl/react";
import { ArcLayer, ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { GridLayer } from "@deck.gl/aggregation-layers";
import MapGL, { NavigationControl, MapRef } from "react-map-gl/maplibre";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../shared/NotificationSystem";

// Configuration
const TARGET = { lat: 33.5731, lng: -7.5898, name: "Casablanca HQ" };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8005";

// Architectural Constants (Nokod Style)
const NOKOD_COLORS = {
    black: "#000000",
    white: "#FFFFFF",
    purple: "#6D28D9",
    slate: "#94A3B8",
    emerald: "#10B981",
    rose: "#E11D48",
    blue: "#3B82F6"
};

const INITIAL_VIEW_STATE = {
    longitude: -7.5898,
    latitude: 33.5731,
    zoom: 5.5,
    pitch: 0,
    bearing: 0
};

// Types
type AttackPoint = {
    id: string;
    lat: number;
    lng: number;
    ip: string;
    severity: "critical" | "high" | "medium" | "low";
    count: number;
    country: string;
    city?: string;
    lastSeen: string;
};

type FlowLine = {
    source: [number, number];
    target: [number, number];
    color: [number, number, number, number];
    id: string;
};

export default function NetworkGPSMap() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [attacks, setAttacks] = useState<AttackPoint[]>([]);
    const [flows, setFlows] = useState<FlowLine[]>([]);
    const [selectedNode, setSelectedNode] = useState<AttackPoint | null>(null);
    const [isLive, setIsLive] = useState(true);
    const [mounted, setMounted] = useState(false);
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Real-time Adversary Emulation Link
    // We listen to the notification system to visualize attacks
    const { notifications } = useNotifications();

    useEffect(() => {
        if (!isLive || notifications.length === 0) return;

        // Take the latest notification if it looks like a threat or emulation event
        const latest = notifications[0];

        // Simple deduplication based on ID
        if (attacks.some(a => a.id === latest.id)) return;

        if (latest.type === 'critical' || latest.type === 'warning') {
            const lat = 20 + (Math.random() - 0.5) * 60; // In a real app, we'd parse this from latest.ip geo-lookup
            const lng = (Math.random() - 0.5) * 180;

            const severity = latest.type === 'critical' ? 'critical' : 'high';

            const newAttack: AttackPoint = {
                id: latest.id,
                lat,
                lng,
                ip: latest.ip || `192.168.1.${Math.floor(Math.random() * 255)}`, // Fallback if IP missing
                severity: severity as any,
                count: 1,
                country: latest.country || "UNKNOWN",
                lastSeen: new Date(latest.timestamp).toLocaleTimeString()
            };

            setAttacks(prev => [newAttack, ...prev].slice(0, 50));

            const newFlow: FlowLine = {
                id: latest.id,
                source: [lng, lat],
                target: [TARGET.lng, TARGET.lat],
                color: severity === 'critical' ? [225, 29, 72, 200] : [109, 40, 217, 150]
            };

            setFlows(prev => [newFlow, ...prev].slice(0, 100));
        }
    }, [notifications, isLive]);

    const layers = [
        // Base Grid Layer for architectural feel
        new GridLayer({
            id: 'grid-bg',
            data: flows.map(f => ({ position: f.source })),
            cellSize: 200000,
            extruded: false,
            colorRange: [
                [248, 250, 252, 50],
                [241, 245, 249, 100],
                [226, 232, 240, 150]
            ],
            getPosition: (d: any) => d.position,
        }),

        // Connection Arcs (Linear GPS Paths)
        new ArcLayer({
            id: 'gps-arcs',
            data: flows,
            getSourcePosition: (d: any) => d.source,
            getTargetPosition: (d: any) => d.target,
            getSourceColor: (d: any) => d.color,
            getTargetColor: (d: any) => [0, 0, 0, 50],
            getWidth: 1.5,
            greatCircle: true,
            dashJustified: true,
            highPrecision: true,
        }),

        // Network Nodes
        new ScatterplotLayer({
            id: 'network-nodes',
            data: attacks,
            getPosition: (d: any) => [d.lng, d.lat],
            getRadius: (d: any) => (d.severity === 'critical' ? 120000 : 80000),
            getFillColor: (d: any) => {
                if (d.severity === 'critical') return [225, 29, 72];
                if (d.severity === 'high') return [109, 40, 217];
                return [0, 0, 0];
            },
            getLineColor: [255, 255, 255, 100],
            lineWidthMinPixels: 2,
            stroked: true,
            pickable: true,
            onHover: (info) => setSelectedNode(info.object as AttackPoint),
        }),

        // Center Point (Operational GPS)
        new ScatterplotLayer({
            id: 'hq-node',
            data: [TARGET],
            getPosition: (d: any) => [d.lng, d.lat],
            getRadius: 150000,
            getFillColor: [0, 0, 0],
            getLineColor: [109, 40, 217],
            lineWidthMinPixels: 3,
            stroked: true,
        })
    ];

    return (
        <section className="relative h-full w-full bg-white overflow-hidden rounded-[3rem] border-8 border-slate-50 shadow-2xl flex flex-col">
            {/* Architectural HUD Upper */}
            <header className="relative z-20 flex justify-between items-center p-8 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-2xl shadow-black/20">
                        <Navigation className="h-7 w-7" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tactical Satellite</span>
                        <h2 className="text-3xl font-black text-black tracking-tighter leading-none">Network <span className="text-slate-300 font-medium">GPS.</span></h2>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Nodes</span>
                            <span className="text-lg font-black text-black leading-tight">{attacks.length}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
                            <span className="text-lg font-black text-nokod-purple leading-tight">12ms</span>
                        </div>
                    </div>

                    <button onClick={() => setIsLive(!isLive)} className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white transition-all shadow-sm">
                        {isLive ? <Radio className="h-6 w-6 text-emerald-500 animate-pulse" /> : <Shield className="h-6 w-6 text-slate-300" />}
                    </button>
                </div>
            </header>

            {/* The Map Core */}
            <div className="relative flex-1 bg-slate-50">
                {mounted && (
                    <DeckGL
                        id="gps-map-v9"
                        initialViewState={viewState as any}
                        controller={true}
                        layers={layers}
                        onViewStateChange={({ viewState }) => setViewState(viewState as any)}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                    >
                        <MapGL
                            mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                            style={{ width: '100%', height: '100%', filter: 'grayscale(1) contrast(0.8) brightness(1.1)' }}
                            reuseMaps
                        />
                    </DeckGL>
                )}

                {/* Sidebar Navigation HUD */}
                <div className="absolute top-8 right-8 z-20 flex flex-col gap-4">
                    <div className="p-1 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl flex flex-col gap-1">
                        <button className="p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-black focus:text-nokod-purple">
                            <Layers className="h-5 w-5" />
                        </button>
                        <button className="p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-black">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                        <button className="p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-black">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Bottom Stats Plane */}
                <div className="absolute bottom-8 left-8 right-8 z-20">
                    <div className="flex justify-between items-end">
                        <div className="p-6 rounded-3xl bg-black text-white shadow-2xl min-w-[300px]">
                            <div className="flex items-center gap-3 mb-4">
                                <Crosshair className="h-4 w-4 text-nokod-purple" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Selected Unit</span>
                            </div>
                            {selectedNode ? (
                                <div className="space-y-2">
                                    <div className="text-xl font-black">{selectedNode.ip}</div>
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">Region</span>
                                        <span className="text-nokod-purple tracking-widest uppercase">{selectedNode.country}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase">Status</span>
                                        <span className={selectedNode.severity === 'critical' ? 'text-rose-500' : 'text-emerald-500'}>
                                            {selectedNode.severity.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 text-xs font-bold py-4">NO NODE SELECTED</div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <div className="px-6 py-4 rounded-3xl bg-white border border-slate-100 shadow-xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Signal Strength</span>
                                <div className="flex gap-1 items-end">
                                    {[20, 40, 60, 40, 80].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-black rounded-full" style={{ height: `${h}%` }} />
                                    ))}
                                    <span className="ml-2 font-black text-xs">98%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom HUD Bar */}
            <footer className="relative z-20 px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center overflow-hidden">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GPS.LOCK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SAT.RELAY</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-300 font-mono">
                    <span>COORD: 33.5731N 7.5898W</span>
                    <span>SCALE: 1:250,000</span>
                </div>
            </footer>
        </section>
    );
}
