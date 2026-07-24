import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { cartService } from "../services/cartService";
import type { Cart } from "../types/cart";

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] =
    useState<Cart | null>(null);

  const refreshCart = async () => {
    try {
      const data =
        await cartService.getCart();

      setCart(data);
    } catch {
      setCart(null);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount:
          cart?.item_count ?? 0,
        refreshCart,
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