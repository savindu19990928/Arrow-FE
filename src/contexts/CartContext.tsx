import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, tokenStore } from '../utils/apiClient';
import { cartApi } from '../utils/shopApi';
import { useAuth } from './AuthContext';
import type { Cart } from '../types/api';

interface CartContextValue {
  cart: Cart | null;
  count: number;
  loading: boolean;
  error: string | null;
  pendingItemId: number | null;
  refresh: () => Promise<void>;
  addItem: (productId: number, variantId: number | null, quantity: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: {children: React.ReactNode;}) {
  const { user, initializing } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await cartApi.get();
      if (!tokenStore.getAccess() && next.guest_token) tokenStore.setGuest(next.guest_token);
      setCart(next);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializing) return;
    setLoading(true);
    void refresh();
  }, [user?.id, initializing, refresh]);

  const addItem = useCallback(
    async (productId: number, variantId: number | null, quantity: number) => {
      try {
        await cartApi.add(productId, variantId, quantity);
        await refresh();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      }
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      setPendingItemId(itemId);
      try {
        await cartApi.update(itemId, quantity);
        await refresh();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setPendingItemId(null);
      }
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      setPendingItemId(itemId);
      try {
        await cartApi.remove(itemId);
        await refresh();
        toast('Removed from cart');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setPendingItemId(null);
      }
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      cart,
      count: cart?.total_items_count ?? 0,
      loading,
      error,
      pendingItemId,
      refresh,
      addItem,
      updateQuantity,
      removeItem
    }),
    [cart, loading, error, pendingItemId, refresh, addItem, updateQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}