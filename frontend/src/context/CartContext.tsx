/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { cartService } from "../services/cartService";

import type { Cart } from "../types/cart";

import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;

  refreshCart: () => Promise<void>;

  addToCart: (
    variantId: number,
    quantity: number
  ) => Promise<void>;

  updateCart: (
    variantId: number,
    quantity: number
  ) => Promise<void>;

  removeItem: (
    variantId: number
  ) => Promise<void>;

  clearCart: () => Promise<void>;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const { authenticated } = useAuth();

  /*
   * Used when cart actions are performed
   * after the cart has already loaded.
   */
  const refreshCart = useCallback(async () => {
    setLoading(true);

    try {
      const data =
        await cartService.getCart();

      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (
    variantId: number,
    quantity: number
  ) => {
    await cartService.addToCart(
      variantId,
      quantity
    );

    await refreshCart();
  };

  const updateCart = async (
    variantId: number,
    quantity: number
  ) => {
    await cartService.updateCart(
      variantId,
      quantity
    );

    await refreshCart();
  };

  const removeItem = async (
    variantId: number
  ) => {
    await cartService.removeItem(
      variantId
    );

    await refreshCart();
  };

  const clearCart = async () => {
    await cartService.clearCart();

    await refreshCart();
  };

  /*
   * Initial/authentication-triggered cart load.
   *
   * This is kept separate from refreshCart()
   * so the effect does not synchronously trigger
   * setState through another function.
   */
  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      try {
        const data =
          await cartService.getCart();

        if (!cancelled) {
          setCart(data);
        }
      } catch {
        if (!cancelled) {
          setCart(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount:
          cart?.item_count ?? 0,

        refreshCart,
        addToCart,
        updateCart,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}