import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "@/services/auth/authApi";
import { registerAuthFailureHandler } from "@/lib/apiClient";
import { hasStoredSession, setToken, clearToken } from "@/lib/authSession";
import type { AdminUser } from "@/services/auth/authApi";

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  role: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const role = user?.role ?? "admin";

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    clearToken();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!hasStoredSession()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.getCurrentAdmin();
        if (!cancelled) {
          setUser(me);
          setIsAuthenticated(true);
        }
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    registerAuthFailureHandler(() => clearSession());
    return () => registerAuthFailureHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin } = await authApi.login(email, password);
    setToken(token);
    setUser(admin);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => clearSession(), [clearSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
