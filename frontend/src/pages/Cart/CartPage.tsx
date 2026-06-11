import { useEffect, useState } from "react";

import { cartService } from "../../services/cartService";

import type {
  Cart,
  CartItem,
} from "../../types/cart";

export default function CartPage() {
  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadCart = async () => {
    try {
      const data =
        await cartService.getCart();

      setCart(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (
    variantId: number
  ) => {
    try {
      await cartService.removeItem(
        variantId
      );

      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        Loading cart...
      </div>
    );
  }

  const total =
    cart?.items.reduce(
      (sum, item) =>
        sum + Number(item.total_price),
      0
    ) ?? 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Cart
      </h1>

      {cart?.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart?.items.map(
              (item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded border p-4"
                >
                  <div>
                    <h2 className="font-semibold">
                      {item.product_name}
                    </h2>

                    <p>
                      {item.variant_name}
                    </p>

                    <p>
                      Qty:
                      {" "}
                      {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>
                      GHS {item.total_price}
                    </p>

                    <button
                      onClick={() =>
                        handleRemove(
                          item.variant
                        )
                      }
                      className="mt-2 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold">
              Total: GHS {total}
            </h2>

            <button
              className="mt-4 rounded bg-black px-6 py-3 text-white"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}