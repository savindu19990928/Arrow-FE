import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { errorMessage, toList } from '../utils/apiClient';
import { wishlistApi } from '../utils/storeApi';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '../types/api';

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  has: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(toList(await wishlistApi.list()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const has = useCallback(
    (productId: number) => items.some((item) => item.product.id === productId),
    [items]
  );

  const toggle = useCallback(
    async (productId: number) => {
      if (!user) {
        toast('Sign in to save products to your wishlist.');
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
      try {
        const res = await wishlistApi.toggle(productId);
        toast.success(res.message || (res.added ? 'Added to wishlist' : 'Removed from wishlist'));
        await refresh();
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [user, navigate, refresh]
  );

  const value = useMemo(
    () => ({ items, loading, error, has, toggle, refresh }),
    [items, loading, error, has, toggle, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}