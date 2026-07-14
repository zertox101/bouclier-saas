// Helper to get consistent host in browser
const getHost = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname;
    }
    return "localhost";
};

// Helper to get consistent protocol in browser
const getProtocol = () => {
    if (typeof window !== 'undefined') {
        return window.location.protocol;
    }
    return "http:";
};

const host = getHost();
const protocol = getProtocol();
const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${host}:8005`;
const DEFAULT_WS = process.env.NEXT_PUBLIC_WS_URL || `ws://${host}:8005`;

export const API_CONFIG = {
    // Security API (Real-time monitoring)
    SECURITY_API: DEFAULT_API,

    // Main Backend API
    BACKEND_API: DEFAULT_API,

    // Notification Server / World Monitor
    NOTIFICATION_API: process.env.NEXT_PUBLIC_NOTIFICATION_API || `${protocol}//monitor.${host}`,

    // WebSocket endpoints
    WS_TRAFFIC: `${DEFAULT_WS}/ws/traffic`,

    // Tools API Config (Kali Cluster) - points to main backend which proxies kali tools
    TOOLS_API_BASE: process.env.NEXT_PUBLIC_TOOLS_API_BASE || `${protocol}//${host}:8005`,
    TOOLS_API_KEY: process.env.NEXT_PUBLIC_TOOLS_API_KEY || "BOUCLIER_ALPHA_SESSION_2026",

    // World Monitor
    WORLD_MONITOR_URL: process.env.NEXT_PUBLIC_WORLD_MONITOR_URL || `http://${host}:3050`,

    // AI Pentester Tool-Main API
    PENTESTER_API_URL: process.env.NEXT_PUBLIC_PENTESTER_API_URL || `http://${host}:9100`,

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
    ALERTS: `${API_CONFIG.BACKEND_API}/alerts`,
    LOGS: `${API_CONFIG.BACKEND_API}/events`,
    ANALYSIS: `${API_CONFIG.BACKEND_API}/analysis`,
};

// Fetch helper with error handling
export async function fetchAPI<T>(
    url: string,
    options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('auth_org_id') : null;
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                ...(orgId ? { "X-Organization-ID": orgId } : {}),
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
