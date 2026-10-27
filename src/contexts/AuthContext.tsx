import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SESSION_EXPIRED_EVENT, tokenStore } from '../utils/apiClient';
import { authApi, cartApi } from '../utils/storeApi';
import type { RegisterPayload, User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUserState] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!tokenStore.getAccess()) {
      setInitializing(false);
      return;
    }
    authApi.
    profile().
    then(setUserState).
    catch(() => tokenStore.clearTokens()).
    finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    const onExpired = () => setUserState(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const completeSignIn = useCallback(async (access: string, refresh: string, signedIn: User) => {
    tokenStore.setTokens(access, refresh);
    const guestToken = tokenStore.peekGuestToken();
    if (guestToken) {
      try {
        await cartApi.merge(guestToken);
      } catch {

        // Guest cart may be empty or already merged — safe to ignore.
      }tokenStore.clearGuestToken();
    }
    setUserState(signedIn);
    return signedIn;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      return completeSignIn(res.access, res.refresh, res.user);
    },
    [completeSignIn]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await authApi.register(payload);
      return completeSignIn(res.access, res.refresh, res.user);
    },
    [completeSignIn]
  );

  const logout = useCallback(() => {
    tokenStore.clearTokens();
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, setUser: setUserState }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}