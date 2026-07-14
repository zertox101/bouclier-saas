
interface ApiOptions extends RequestInit {
    json?: any;
}

// Dynamic Base URL detection for cross-environment reliability
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:8005`;
    }
    return 'http://localhost:8005';
};

const BASE_URL = getBaseUrl();

export class ApiError extends Error {
    status: number;
    data: any;
    constructor(status: number, data: any) {
        super(`API Error: ${status}`);
        this.status = status;
        this.data = data;
    }
}

export async function apiClient<T = any>(endpoint: string, { json, ...customConfig }: ApiOptions = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('auth_org_id') : null;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customConfig.headers as any || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (orgId) {
        headers['X-Organization-ID'] = orgId;
    }

    const config: RequestInit = {
        method: customConfig.method || (json ? 'POST' : 'GET'),
        ...customConfig,
        headers,
        body: json ? JSON.stringify(json) : customConfig.body,
        credentials: 'include',
    };

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Token expired or invalid
            console.warn("[API] 401 Unauthorized - Token may be missing or invalid.");
            /*
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
            }
            */
        }

        if (response.status === 204) return {} as T;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new ApiError(response.status, data);
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("API Fetch Failed:", error);
        throw error;
    }
}

// Mock Helper for Demo
export function mockDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
