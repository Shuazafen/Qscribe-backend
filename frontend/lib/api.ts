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
  [key: string]: string | string[] | undefined;
}

// ─── Token refresh ────────────────────────────────────────────────────────────
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = TokenStorage.getRefresh();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/api/user/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    TokenStorage.clear();
    throw new Error("Refresh failed");
  }

  TokenStorage.set(data.access, data.refresh ?? refreshToken);
  return data.access;
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

  // Handle token refresh on 401
  if (res.status === 401 && TokenStorage.getRefresh()) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      });

      const retryData = await retryRes.json().catch(() => ({}));
      if (!retryRes.ok) throw retryData as ApiError;
      return retryData as T;
    } catch {
      TokenStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired");
    }
  }

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

// ─── Dashboard Data Types ──────────────────────────────────────────────

export interface Habit {
  id: number;
  name: string;
  goal: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCreatePayload {
  name: string;
  goal: string;
}

export interface Saving {
  id: number;
  goal_name: string;
  target_amount: string;
  current_amount: string;
  interest_rate: string;
  created_at: string;
}

export interface SavingCreatePayload {
  goal_name: string;
  target_amount: string;
}

export interface TransactionData {
  id: number;
  amount: string;
  transaction_type: "deposit" | "withdrawal";
  description: string;
  created_at: string;
}

export interface TransactionCreatePayload {
  amount: string;
  transaction_type: "deposit" | "withdrawal";
  description?: string;
}

export interface PetData {
  id: number;
  name: string;
  description: string;
  image: string | null;
  is_rare: boolean;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Habits API ───────────────────────────────────────────────────────────────

export async function fetchHabits(): Promise<Habit[]> {
  return apiFetch<Habit[]>("/api/habits/");
}

export async function createHabit(payload: HabitCreatePayload): Promise<Habit> {
  return apiFetch<Habit>("/api/habits/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHabit(
  id: number,
  payload: Partial<HabitCreatePayload & { is_completed: boolean }>
): Promise<Habit> {
  return apiFetch<Habit>(`/api/habits/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteHabit(id: number): Promise<void> {
  await apiFetch<void>(`/api/habits/${id}/`, { method: "DELETE" });
}

// ─── Savings API ──────────────────────────────────────────────────────────────

export async function fetchSavings(): Promise<Saving[]> {
  return apiFetch<Saving[]>("/api/savings/");
}

export async function createSaving(payload: SavingCreatePayload): Promise<Saving> {
  return apiFetch<Saving>("/api/savings/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSaving(
  id: number,
  payload: Partial<SavingCreatePayload>
): Promise<Saving> {
  return apiFetch<Saving>(`/api/savings/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSaving(id: number): Promise<void> {
  await apiFetch<void>(`/api/savings/${id}/`, { method: "DELETE" });
}

// ─── Transactions API ─────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<TransactionData[]> {
  return apiFetch<TransactionData[]>("/api/transactions/");
}

export async function createTransaction(
  payload: TransactionCreatePayload
): Promise<TransactionData> {
  return apiFetch<TransactionData>("/api/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Pets API ─────────────────────────────────────────────────────────────────

export async function fetchPets(): Promise<PetData[]> {
  return apiFetch<PetData[]>("/api/pets/");
}

// ─── User Profile API ─────────────────────────────────────────────────────────

export async function fetchProfile(): Promise<User> {
  return apiFetch<User>("/api/user/profile/");
}

export async function updateProfile(
  payload: Partial<Pick<User, "first_name" | "last_name" | "university" | "phone_number">>
): Promise<User> {
  return apiFetch<User>("/api/user/profile/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Logout / Current User ────────────────────────────────────────────────────

/** Logout — clears stored tokens. */
export function logout() {
  TokenStorage.clear();
}

/** Returns the currently logged-in user from localStorage, or null. */
export function getCurrentUser(): User | null {
  return TokenStorage.getUser();
}

/** Checks if a 403/401 error is a tier permission error */
export function isTierPermissionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.detail === "You do not have permission to perform this action." ||
    err.detail === "PermissionDenied" ||
    (typeof err.detail === "string" && err.detail.includes("permission"))
  );
}
