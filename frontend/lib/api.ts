const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TokenStorage = {
  getAccess: () =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  getRefresh: () =>
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
  setUser: (user: User) =>
    localStorage.setItem("user", JSON.stringify(user)),
  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tier: number;
  university: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  university: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface ApiError {
  [key: string]: string | string[];
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = TokenStorage.getAccess();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw data as ApiError;
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

/** Login with username + password. Stores tokens on success. */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/user/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  TokenStorage.set(data.access, data.refresh);
  TokenStorage.setUser(data.user);
  return data;
}

/** Register a new Tier-1 user. Sends multipart so id_card_image is supported. */
export async function register(
  payload: RegisterPayload,
  idCardImage: File
): Promise<User> {
  const form = new FormData();
  (Object.keys(payload) as (keyof RegisterPayload)[]).forEach((k) =>
    form.append(k, payload[k])
  );
  form.append("id_card_image", idCardImage);

  const token = TokenStorage.getAccess();
  const res = await fetch(`${BASE_URL}/api/user/register/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data as ApiError;
  return data as User;
}

/** Logout — clears stored tokens. */
export function logout() {
  TokenStorage.clear();
}

/** Returns the currently logged-in user from localStorage, or null. */
export function getCurrentUser(): User | null {
  return TokenStorage.getUser();
}
