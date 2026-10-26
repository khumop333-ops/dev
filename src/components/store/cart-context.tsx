"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export interface StoredCartItem {
  variantId: string;
  quantity: number;
}

interface CartContextValue {
  items: StoredCartItem[];
  isHydrated: boolean;
  totalQuantity: number;
  addItem: (variantId: string, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "hhc_cart_v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter(
              (item): item is StoredCartItem =>
                typeof item?.variantId === "string" &&
                typeof item?.quantity === "number" &&
                item.quantity > 0
            )
            .map((item) => ({
              variantId: item.variantId,
              quantity: Math.min(50, Math.floor(item.quantity)),
            }));
          setItems(valid);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, isHydrated]);

  const addItem = useCallback((variantId: string, quantity = 1) => {
    const cleanQty = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.variantId === variantId);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          variantId,
          quantity: Math.min(50, next[idx].quantity + cleanQty),
        };
        return next;
      }
      return [...prev, { variantId, quantity: Math.min(50, cleanQty) }];
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    const cleanQty = Math.floor(quantity);
    setItems((prev) => {
      if (cleanQty <= 0) {
        return prev.filter((i) => i.variantId !== variantId);
      }
      return prev.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.min(50, cleanQty) }
          : i
      );
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      totalQuantity,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, isHydrated, totalQuantity, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
