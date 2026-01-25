"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8005";

export interface TrafficEvent {
    timestamp: string;
    src_ip: string;
    src_port: number;
    dst_ip: string;
    dst_port: number;
    service: string;
    country: string;
    state: string;
    alerts?: string[];
    severity?: string;
    type?: string;
}

export interface TrafficStats {
    by_country: Array<{ label: string; count: number; tone: string }>;
    severity: Record<string, number>;
    total_packets: number;
}

export interface DDoSStatus {
    detected: boolean;
    attackers: Array<{ ip: string; count: number; country: string }>;
    severity: string;
}

export interface NetworkStats {
    methods: Array<{ label: string; value: number }>;
}

export function useSecurityAPI() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
    const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
    const [ddosStatus, setDdosStatus] = useState<DDoSStatus | null>(null);
    const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);

    // Check API connection
    const checkConnection = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/status`);
            if (res.ok) {
                setIsConnected(true);
                setError(null);
                return true;
            }
        } catch {
            setIsConnected(false);
            setError("API non disponible. Démarrez le serveur backend.");
        }
        return false;
    }, []);

    // Fetch live traffic
    const fetchLiveTraffic = useCallback(async () => {
        if (!isConnected) return;

        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/traffic/live`);
            if (res.ok) {
                const data = await res.json();
                setTrafficEvents(data.connections || []);
            }
        } catch (err) {
            console.error("Error fetching traffic:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected]);

    // Fetch traffic stats
    const fetchTrafficStats = useCallback(async () => {
        if (!isConnected) return;

        try {
            const res = await fetch(`${API_URL}/api/traffic/stats`);
            if (res.ok) {
                const data = await res.json();
                setTrafficStats(data);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    }, [isConnected]);

    // Fetch security events
    const fetchEvents = useCallback(async () => {
        if (!isConnected) return;

        try {
            const res = await fetch(`${API_URL}/api/events`);
            if (res.ok) {
                const data = await res.json();
                setTrafficEvents(data.events || []);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    }, [isConnected]);

    // Check DDoS status
    const checkDDoS = useCallback(async () => {
        if (!isConnected) return;

        try {
            const res = await fetch(`${API_URL}/api/ddos/status`);
            if (res.ok) {
                const data = await res.json();
                setDdosStatus(data);
            }
        } catch (err) {
            console.error("Error checking DDoS:", err);
        }
    }, [isConnected]);

    // Fetch internal network stats
    const fetchNetworkStats = useCallback(async () => {
        if (!isConnected) return;

        try {
            const res = await fetch(`${API_URL}/api/network/internal`);
            if (res.ok) {
                const data = await res.json();
                setNetworkStats(data);
            }
        } catch (err) {
            console.error("Error fetching network stats:", err);
        }
    }, [isConnected]);

    // Start monitoring
    const startMonitoring = async () => {
        try {
            const res = await fetch(`${API_URL}/api/monitor/start`, { method: "POST" });
            if (res.ok) {
                return true;
            }
        } catch {
            return false;
        }
        return false;
    };

    // Stop monitoring
    const stopMonitoring = async () => {
        try {
            const res = await fetch(`${API_URL}/api/monitor/stop`, { method: "POST" });
            if (res.ok) {
                return true;
            }
        } catch {
            return false;
        }
        return false;
    };

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchLiveTraffic(),
            fetchTrafficStats(),
            checkDDoS(),
            fetchNetworkStats(),
        ]);
    }, [fetchLiveTraffic, fetchTrafficStats, checkDDoS, fetchNetworkStats]);

    // Initial connection check
    useEffect(() => {
        checkConnection();

        // Auto-refresh every 5 seconds if connected
        const interval = setInterval(() => {
            if (isConnected) {
                refreshAll();
            } else {
                checkConnection();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [checkConnection, isConnected, refreshAll]);

    return {
        isConnected,
        isLoading,
        error,
        trafficEvents,
        trafficStats,
        ddosStatus,
        networkStats,
        fetchLiveTraffic,
        fetchTrafficStats,
        fetchEvents,
        checkDDoS,
        fetchNetworkStats,
        startMonitoring,
        stopMonitoring,
        refreshAll,
        checkConnection,
    };
}

// WebSocket hook for real-time updates
export function useSecurityWebSocket(onData: (data: unknown) => void) {
    const [isConnected, setIsConnected] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const websocket = new WebSocket("ws://localhost:8005/ws/traffic");

        websocket.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onData(data);
            } catch (err) {
                console.error("WebSocket parse error:", err);
            }
        };

        websocket.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [onData]);

    return { isConnected, ws };
}
