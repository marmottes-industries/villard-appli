import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { authApi, type LoginPayload, type User } from '@/src/api/auth';
import { REFRESH_TOKEN_KEY, TOKEN_KEY, setOnUnauthorized } from '@/src/api/client';
import { storage } from '@/src/lib/storage';

type AuthState = {
  token: string | null;
  user: User | null;
  hydrating: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) return;
    const { data } = await authApi.me();
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    tokenRef.current = null;
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    await storage.setItem(TOKEN_KEY, data.token);
    await storage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    tokenRef.current = data.token;
    setToken(data.token);
    await refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
      tokenRef.current = null;
    });
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem(TOKEN_KEY);
      tokenRef.current = stored;
      setToken(stored);
      if (stored) {
        try { await refreshUser(); } catch { /* swallow — interceptor handles 401 */ }
      }
      setHydrating(false);
    })();
  }, [refreshUser]);

  const value = useMemo<AuthState>(() => ({
    token,
    user,
    hydrating,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUser,
  }), [token, user, hydrating, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
