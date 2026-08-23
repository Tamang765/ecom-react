import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, api, endpoints } from '@/lib/api';
import type { Cart, CartContextType } from '@/types';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setCart(await api.get<Cart>(endpoints.cart.get));
    } catch (requestError) {
      setCart(null);
      setError(requestError instanceof Error ? requestError.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void refreshCart();
  }, [authLoading, refreshCart]);

  const addItem = async (productId: string, quantity = 1) => {
    try {
      setCart(await api.post<Cart>(endpoints.cart.addItem, { productId, quantity }));
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.code === 'INSUFFICIENT_STOCK') {
        await refreshCart();
      }
      throw requestError;
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    try {
      setCart(await api.patch<Cart>(endpoints.cart.updateItem(productId), { quantity }));
    } catch (requestError) {
      if (
        requestError instanceof ApiError
        && ['INSUFFICIENT_STOCK', 'CART_ITEM_NOT_FOUND', 'PRODUCT_NOT_FOUND'].includes(requestError.code)
      ) {
        await refreshCart();
      }
      throw requestError;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(endpoints.cart.removeItem(productId));
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.code === 'CART_ITEM_NOT_FOUND')) {
        throw requestError;
      }
    } finally {
      await refreshCart();
    }
  };

  const resetCart = () => {
    setCart((current) =>
      current ? { ...current, items: [], total: '0.00' } : current,
    );
  };

  const items = cart?.items ?? [];

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        total: cart?.total ?? '0.00',
        isLoading: authLoading || isLoading,
        error,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
