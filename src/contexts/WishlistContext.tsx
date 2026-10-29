import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getErrorMessage } from '../utils/apiClient';
import { wishlistApi } from '../utils/shopApi';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '../types/api';

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  pendingId: number | null;
  isSaved: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await wishlistApi.list());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    void refresh();
  }, [user, refresh]);

  const savedIds = useMemo(() => new Set(items.map((item) => item.product.id)), [items]);
  const isSaved = useCallback((productId: number) => savedIds.has(productId), [savedIds]);

  const toggle = useCallback(
    async (productId: number) => {
      if (!user) {
        toast('Sign in to save products to your wishlist.');
        navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      setPendingId(productId);
      try {
        const res = await wishlistApi.toggle(productId);
        toast.success(res.added ? 'Saved to wishlist' : 'Removed from wishlist');
        await refresh();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setPendingId(null);
      }
    },
    [user, navigate, location.pathname, location.search, refresh]
  );

  const value = useMemo(
    () => ({ items, loading, error, pendingId, isSaved, toggle, refresh }),
    [items, loading, error, pendingId, isSaved, toggle, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}