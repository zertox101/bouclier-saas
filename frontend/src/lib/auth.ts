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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

async function requestAuth(
  path: string,
  body: Record<string, string>
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.detail === "string" ? data.detail : "Authentication failed";
    throw new Error(message);
  }

  return data as AuthResponse;
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
