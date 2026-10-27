import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { errorMessage, tokenStore } from '../utils/apiClient';
import { cartApi } from '../utils/storeApi';
import { useAuth } from './AuthContext';
import type { Cart } from '../types/api';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  busyItemId: number | null;
  count: number;
  refresh: () => Promise<void>;
  addItem: (productId: number, variantId: number | null, quantity: number) => Promise<boolean>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: {children: React.ReactNode;}) {
  const { user, initializing } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);

  const applyCart = useCallback(
    (next: Cart) => {
      setCart(next);
      if (!user && next.guest_token) tokenStore.setGuestToken(next.guest_token);
    },
    [user]
  );

  const refresh = useCallback(async () => {
    setError(null);
    try {
      applyCart(await cartApi.get());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    if (initializing) return;
    setLoading(true);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, initializing]);

  const addItem = useCallback(
    async (productId: number, variantId: number | null, quantity: number) => {
      try {
        applyCart(await cartApi.add(productId, variantId, quantity));
        return true;
      } catch (err) {
        toast.error(errorMessage(err));
        return false;
      }
    },
    [applyCart]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      setBusyItemId(itemId);
      try {
        await cartApi.updateItem(itemId, quantity);
        await refresh();
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        setBusyItemId(null);
      }
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      setBusyItemId(itemId);
      try {
        await cartApi.removeItem(itemId);
        await refresh();
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        setBusyItemId(null);
      }
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      busyItemId,
      count: cart?.total_items_count ?? 0,
      refresh,
      addItem,
      updateItem,
      removeItem
    }),
    [cart, loading, error, busyItemId, refresh, addItem, updateItem, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}