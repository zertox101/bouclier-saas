/**
 * Typed API Client for Bouclier SaaS
 * Handles normalized error management and credentials
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8005';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('auth_org_id') : null;

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (orgId) {
    headers.set('X-Organization-ID', orgId);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const status = response.status;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      return { error: 'Unauthorized', status };
    }

    if (status === 204) return { status };

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: result.message || result.error || 'Unknown error occurred',
        status,
      };
    }

    return { data: result as T, status };
  } catch (error: any) {
    return {
      error: error.message || 'Network error occurred',
      status: 500,
    };
  }
}

export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  put: <T>(url: string, body: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
