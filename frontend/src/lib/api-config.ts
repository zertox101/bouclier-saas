// API Configuration - Central configuration for all API endpoints
const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
const DEFAULT_WS = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8005";

export const API_CONFIG = {
    // Security API (Real-time monitoring)
    SECURITY_API: DEFAULT_API,

    // Main Backend API
    BACKEND_API: DEFAULT_API,

    // Notification Server
    NOTIFICATION_API: process.env.NEXT_PUBLIC_NOTIFICATION_API || "http://localhost:8080",

    // WebSocket endpoints
    WS_TRAFFIC: `${DEFAULT_WS}/ws/traffic`,
};

// API Endpoints
export const ENDPOINTS = {
    // Security API Endpoints
    TRAFFIC_LIVE: `${API_CONFIG.SECURITY_API}/api/traffic/live`,
    TRAFFIC_STATS: `${API_CONFIG.SECURITY_API}/api/traffic/stats`,
    EVENTS: `${API_CONFIG.SECURITY_API}/api/events`,
    DDOS_STATUS: `${API_CONFIG.SECURITY_API}/api/ddos/status`,
    NETWORK_INTERNAL: `${API_CONFIG.SECURITY_API}/api/network/internal`,
    SOURCES: `${API_CONFIG.SECURITY_API}/api/sources`,
    MONITOR_START: `${API_CONFIG.SECURITY_API}/api/monitor/start`,
    MONITOR_STOP: `${API_CONFIG.SECURITY_API}/api/monitor/stop`,
    SENTINEL_CHAT: `${API_CONFIG.SECURITY_API}/api/sentinel/chat`,

    // Backend API Endpoints
    SCAN: `${API_CONFIG.BACKEND_API}/api/v1/scan`,
    ALERTS: `${API_CONFIG.BACKEND_API}/api/v1/alerts`,
    LOGS: `${API_CONFIG.BACKEND_API}/api/v1/logs`,
    ANALYSIS: `${API_CONFIG.BACKEND_API}/api/v1/analysis`,
};

// Fetch helper with error handling
export async function fetchAPI<T>(
    url: string,
    options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        if (!res.ok) {
            return { data: null, error: `HTTP ${res.status}: ${res.statusText}` };
        }

        const data = await res.json();
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
    }
}

// Check if API is available
export async function checkAPIHealth(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(3000) });
        return res.ok;
    } catch {
        return false;
    }
}
