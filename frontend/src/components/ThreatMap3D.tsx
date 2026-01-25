"use client";

import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

interface ThreatPoint {
    lat: number;
    lng: number;
    size: number;
    color: string;
    label: string;
}

interface Arc {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
}

export default function ThreatMap3D() {
    const globeEl = useRef<any>();
    const [points, setPoints] = useState<ThreatPoint[]>([]);
    const [arcs, setArcs] = useState<Arc[]>([]);

    useEffect(() => {
        // Mock threat data - replace with real SSE stream
        const mockPoints: ThreatPoint[] = [
            { lat: 48.8566, lng: 2.3522, size: 0.8, color: '#10b981', label: 'Paris SOC (HQ)' },
            { lat: 40.7128, lng: -74.0060, size: 0.5, color: '#ef4444', label: 'NYC - Attack Source' },
            { lat: 35.6762, lng: 139.6503, size: 0.4, color: '#f59e0b', label: 'Tokyo - Suspicious' },
            { lat: -33.8688, lng: 151.2093, size: 0.3, color: '#ef4444', label: 'Sydney - Breach Attempt' },
            { lat: 51.5074, lng: -0.1278, size: 0.4, color: '#3b82f6', label: 'London - Monitoring' },
            { lat: 55.7558, lng: 37.6173, size: 0.6, color: '#ef4444', label: 'Moscow - High Risk' },
            { lat: 39.9042, lng: 116.4074, size: 0.5, color: '#f59e0b', label: 'Beijing - Scanning' },
        ];

        const mockArcs: Arc[] = [
            { startLat: 40.7128, startLng: -74.0060, endLat: 48.8566, endLng: 2.3522, color: '#ef4444' },
            { startLat: 55.7558, startLng: 37.6173, endLat: 48.8566, endLng: 2.3522, color: '#ef4444' },
            { startLat: 39.9042, startLng: 116.4074, endLat: 48.8566, endLng: 2.3522, color: '#f59e0b' },
            { startLat: -33.8688, startLng: 151.2093, endLat: 48.8566, endLng: 2.3522, color: '#ef4444' },
        ];

        setPoints(mockPoints);
        setArcs(mockArcs);

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.pointOfView({ lat: 48.8566, lng: 2.3522, altitude: 2.5 }, 1000);
        }
    }, []);

    return (
        <div className="w-full h-full relative">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                // Points
                pointsData={points}
                pointLat="lat"
                pointLng="lng"
                pointColor="color"
                pointAltitude={0.01}
                pointRadius="size"
                pointLabel="label"

                // Arcs
                arcsData={arcs}
                arcStartLat="startLat"
                arcStartLng="startLng"
                arcEndLat="endLat"
                arcEndLng="endLng"
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={0.2}
                arcDashAnimateTime={2000}
                arcStroke={0.5}

                // Atmosphere
                atmosphereColor="#7c3aed"
                atmosphereAltitude={0.15}

                // Performance
                animateIn={true}
                waitForGlobeReady={true}
            />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-400">HQ / Safe</span>
                </div>
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-yellow-400">Suspicious</span>
                </div>
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-red-400">Attack Source</span>
                </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-black/60 px-4 py-3 rounded-xl backdrop-blur-sm border border-primary/20">
                <div className="text-xs font-bold text-slate-400 mb-2">GLOBAL THREAT INTEL</div>
                <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500">Active Nodes:</span>
                        <span className="text-xs font-bold text-primary">{points.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-xs text-slate-500">Attack Vectors:</span>
                        <span className="text-xs font-bold text-red-400">{arcs.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
