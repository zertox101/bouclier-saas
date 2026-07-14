export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

import { apiClient } from "./api-client";

async function requestAuth(
  path: string,
  body: Record<string, string>
): Promise<AuthResponse> {
  try {
    const data = await apiClient<AuthResponse>(path, {
      method: "POST",
      json: body,
    });
    return data;
  } catch (err: any) {
    const message =
      typeof err?.data?.detail === "string" ? err.data.detail : "Authentication failed";
    throw new Error(message);
  }
}

export function loginUser(email: string, password: string): Promise<AuthResponse> {
  return requestAuth("/api/auth/login", { email, password });
}

export function registerUser(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return requestAuth("/api/auth/register", { username, email, password });
}

export function storeAuth(auth: AuthResponse): void {
  localStorage.setItem("auth_token", auth.access_token);
  localStorage.setItem("auth_user", JSON.stringify(auth.user));
}

export function clearAuth(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}
