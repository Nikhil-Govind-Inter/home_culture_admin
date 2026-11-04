import { getToken } from "@/lib/authSession";

// Drop-in replacement for `fetch()` used by feature-service files. Adds the
// Bearer token and, on a 401, notifies the auth failure handler (the server has
// no refresh endpoint, so the session simply ends). Response parsing stays in
// each service file.

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler | null = null;

export const registerAuthFailureHandler = (handler: AuthFailureHandler | null): void => {
  onAuthFailure = handler;
};

export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) onAuthFailure?.();
  return response;
};
