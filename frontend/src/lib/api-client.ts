
interface ApiOptions extends RequestInit {
    json?: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8005';

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
    const headers = {
        'Content-Type': 'application/json',
        ...(customConfig.headers || {}),
    };

    const config: RequestInit = {
        method: json ? 'POST' : 'GET',
        ...customConfig,
        headers: headers as any,
        body: json ? JSON.stringify(json) : undefined,
        credentials: 'include',
    };

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Ideally trigger redirect or logout logic here
            // window.location.href = '/login'; // simplified
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new ApiError(response.status, data);
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        // Handle network errors or return mock if needed for demo
        console.error("API Fetch Failed:", error);
        throw error;
    }
}

// Mock Helper for Demo
export function mockDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
