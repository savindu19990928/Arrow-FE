import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SESSION_EXPIRED_EVENT, tokenStore } from '../utils/apiClient';
import { authApi, cartApi } from '../utils/shopApi';
import type { AuthResponse, AuthSession, RegisterPayload, User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUserState] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    if (!tokenStore.getAccess()) {
      setInitializing(false);
      return;
    }
    authApi.
    profile().
    then((profile) => {
      if (active) setUserState(profile);
    }).
    catch(() => tokenStore.clearTokens()).
    finally(() => {
      if (active) setInitializing(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUserState(null);
      toast.error('Your session expired. Please sign in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const completeAuth = useCallback(async (session: AuthSession) => {
    tokenStore.setTokens(session.access, session.refresh);
    const guestToken = tokenStore.getGuest();
    try {
      await cartApi.merge(guestToken);
    } catch {

      // An empty guest cart has nothing to merge.
    }tokenStore.resetGuest();
    try {
      setUserState(await authApi.profile());
    } catch {
      setUserState(session.user);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      await completeAuth(normalizeSession(res));
    },
    [completeAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await authApi.register(payload);
      await completeAuth(normalizeSession(res));
    },
    [completeAuth]
  );

  const logout = useCallback(() => {
    tokenStore.clearTokens();
    setUserState(null);
    toast('You have been signed out.');
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, setUser: setUserState }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function normalizeSession(res: AuthResponse): AuthSession {
  const access = res.data?.access ?? res.access;
  const refresh = res.data?.refresh ?? res.refresh ?? '';
  const user = res.data?.user ?? res.user;
  if (!access || !user) throw new Error('Unexpected response from the server. Please try again.');
  return { access, refresh, user };
}