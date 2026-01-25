'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Shield, Smartphone, Globe, Info, RefreshCw, Lock, Unlock } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface WiFiNetwork {
    ssid: string;
    bssid: string;
    authentication: string;
    signal: number;
    radio_type: string;
    channel: number;
    type: string;
    security_score?: number;
    details?: any;
}

interface ThreatMapProps {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

// =============================================================================
// Global Threat Map Component
// =============================================================================

export function GlobalThreatMap({ autoRefresh = true, refreshInterval = 10000 }: ThreatMapProps) {
    const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [interfaceName, setInterfaceName] = useState<string>('Initializing...');
    const [error, setError] = useState<string | null>(null);

    // Fetch WiFi data from backend
    const scanNetworks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/v1/detection/scan/wifi', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to scan networks');
            }

            const data = await response.json();
            setNetworks(data.networks || []);
            setInterfaceName(data.interface || 'Unknown Adapter');
            setLastScan(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Scan error:', err);
            setError('Could not connect to Detection Engine (Is it running on port 8001?)');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scanNetworks();
        if (autoRefresh) {
            const interval = setInterval(scanNetworks, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    // Calculate position based on signal strength (stronger = closer to center)
    // We distribute them in a circle
    const getPosition = (index: number, total: number, signal: number) => {
        const angle = (index / total) * 2 * Math.PI;
        // Signal 100% -> radius 0.2 (close)
        // Signal 0% -> radius 0.9 (far)
        const normalizedSignal = Math.max(0, Math.min(100, signal));
        const radius = 0.9 - (normalizedSignal / 100) * 0.7; // 0.2 to 0.9

        // Convert to percentage for CSS
        const x = 50 + radius * 50 * Math.cos(angle);
        const y = 50 + radius * 50 * Math.sin(angle);

        return { x: `${x}%`, y: `${y}%` };
    };

    return (
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center backdrop-blur-sm">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        Global Threat Vector Map <span className="text-slate-500 font-normal">|</span> <span className="text-cyan-400 text-sm font-mono">{interfaceName}</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                        Detected: {networks.length} points • Last Scan: {lastScan || 'Never'}
                    </p>
                </div>
                <button
                    onClick={scanNetworks}
                    disabled={loading}
                    className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-5 h-5 text-cyan-400" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Radar Map */}
                <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-950 p-8">
                    {/* Radar Circles */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-[20%] h-[20%] border border-cyan-500 rounded-full"></div>
                        <div className="w-[40%] h-[40%] border border-cyan-500 rounded-full"></div>
                        <div className="w-[60%] h-[60%] border border-cyan-500 rounded-full"></div>
                        <div className="w-[80%] h-[80%] border border-cyan-500 rounded-full"></div>
                    </div>

                    {/* Radar Sweep Animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent rounded-full animate-spin-slow origin-center [mask-image:conic-gradient(from_0deg,transparent_0deg,white_360deg)]"></div>
                    </div>

                    {/* Center Point (You) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse"></div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-400 bg-slate-900/80 px-2 py-0.5 rounded">YOU</div>
                    </div>

                    {/* Network Points */}
                    <div className="relative w-full h-full">
                        {networks.map((net, i) => {
                            const pos = getPosition(i, networks.length, net.signal);
                            const isSelected = selectedNetwork?.bssid === net.bssid;
                            const isSecure = net.authentication.toLowerCase().includes('wpa') || net.authentication.toLowerCase().includes('secure');

                            return (
                                <button
                                    key={net.bssid + i}
                                    style={{ left: pos.x, top: pos.y }}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-500 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
                                    onClick={() => setSelectedNetwork(net)}
                                >
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors
                    ${isSelected ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-800/80 border-slate-600'}
                    ${!isSecure ? 'border-red-500/50' : ''}
                  `}>
                                        {isSecure ? (
                                            <Wifi className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                        ) : (
                                            <Unlock className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
                                        {net.ssid || 'Hidden Network'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-40">
                            <div className="bg-slate-900 p-6 rounded-xl border border-red-500/30 text-center max-w-md">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
                                <p className="text-slate-400 text-sm">{error}</p>
                                <button onClick={scanNetworks} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">Retry Connection</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Panel (Right Side) */}
                <div className="w-80 bg-slate-900 border-l border-slate-700/50 p-4 overflow-y-auto custom-scrollbar transition-all duration-300 transform">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                        Addressing Table
                    </h3>

                    {selectedNetwork ? (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                                        <Wifi className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg leading-tight">{selectedNetwork.ssid || 'Hidden SSID'}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${selectedNetwork.signal > 70 ? 'bg-green-500' : selectedNetwork.signal > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                            <span className="text-xs text-slate-400">{selectedNetwork.signal}% Signal</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 text-center">
                                        CH {selectedNetwork.channel}
                                    </span>
                                    <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800 text-center">
                                        {selectedNetwork.radio_type}
                                    </span>
                                </div>
                            </div>

                            {/* Addressing Table Details */}
                            <div className="space-y-1">
                                <DetailRow label="BSSID (MAC)" value={selectedNetwork.bssid} icon={<Smartphone className="w-3 h-3" />} />
                                <DetailRow label="Authentication" value={selectedNetwork.authentication} icon={selectedNetwork.authentication.includes('WPA') ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-red-400" />} />
                                <DetailRow label="Security Type" value={selectedNetwork.authentication.includes('Enterprise') ? 'Enterprise 802.1X' : 'Personal-PSK'} />

                                {/* Mocked IP info because we can't scan remote IP without connecting */}
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Network Layer (L3)</h4>
                                    <DetailRow label="IPv4 Subnet" value="192.168.1.0/24 (Est.)" mono />
                                    <DetailRow label="Gateway MAC" value={selectedNetwork.bssid} mono />
                                    <DetailRow label="DHCP Server" value="Unknown (Not Connected)" mono />
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Threat Analysis</h4>
                                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-400">Risk Score</span>
                                            <span className={`text-xs font-bold ${(selectedNetwork.security_score || 50) > 80 ? 'text-green-400' :
                                                (selectedNetwork.security_score || 50) > 50 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {selectedNetwork.security_score || calculateRisk(selectedNetwork)}/100
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${(selectedNetwork.security_score || 50) > 80 ? 'bg-green-500' :
                                                    (selectedNetwork.security_score || 50) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${selectedNetwork.security_score || calculateRisk(selectedNetwork)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 space-y-4">
                            <div className="p-4 bg-slate-800/30 rounded-full">
                                <Wifi className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm">Select a point on the map to view detailed addressing table</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon, mono = false }: { label: string, value: string, icon?: React.ReactNode, mono?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 px-2 rounded transition-colors group">
            <span className="text-xs text-slate-400 flex items-center gap-2">
                {icon}
                {label}
            </span>
            <span className={`text-xs text-slate-200 font-medium ${mono ? 'font-mono text-cyan-300/80' : ''}`}>
                {value}
            </span>
        </div>
    );
}

function calculateRisk(net: WiFiNetwork) {
    let score = 100;
    if (net.authentication.includes('Open')) score -= 80;
    if (net.authentication.includes('WEP')) score -= 60;
    if (net.authentication.includes('WPA-')) score -= 10;
    if ((net.signal || 0) < 40) score -= 10;
    return Math.max(0, score);
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    );
}

export default GlobalThreatMap;
