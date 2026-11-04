// The server issues a Bearer JWT on login; it is kept in localStorage.
const TOKEN_KEY = "home_culture_admin_token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const hasStoredSession = (): boolean => Boolean(getToken());
