// Auth talks to the home_culture server: POST /admin/auth/login returns a Bearer JWT,
// GET /admin/auth/profile returns the current admin. There is no refresh/logout endpoint.
// Plain `fetch` on purpose — `apiFetch` depends on this module's session helpers.
import { getToken } from "@/lib/authSession";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AdminUser {
  id: number;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data: T;
  meta?: unknown;
  pagination?: unknown;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export const parseEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    const message =
      body?.error?.message || body?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, body?.error?.code, body?.error?.details ?? body?.errors);
  }
  return body as ApiEnvelope<T>;
};

export const login = async (
  email: string,
  password: string
): Promise<{ token: string; admin: AdminUser }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const envelope = await parseEnvelope<{ token: string; admin: AdminUser }>(response);
  return envelope.data;
};

export const getCurrentAdmin = async (): Promise<AdminUser> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const envelope = await parseEnvelope<AdminUser>(response);
  return envelope.data;
};

const postJson = async (path: string, payload: unknown) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<null>(response);
};

export const forgotPassword = async (email: string): Promise<string> =>
  (await postJson("/auth/forgot-password", { email })).message;

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  await postJson("/auth/verify-otp", { email, otp });
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<string> =>
  (await postJson("/auth/reset-password", { email, otp, newPassword, confirmPassword })).message;
