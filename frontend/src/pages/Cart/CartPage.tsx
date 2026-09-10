import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import type { CartItem } from "../../types/cart";

import { useCart } from "../../context/CartContext";

import { formatCurrency } from "../../utils/currency";

import LoadingState from "../../components/common/LoadingState";

export default function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    updateCart,
    removeItem,
    clearCart,
  } = useCart();

  const handleRemove = async (variantId: number) => {
    try {
      await removeItem(variantId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await clearCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleIncrease = async (
    variantId: number,
    currentQty: number
  ) => {
    try {
      await updateCart(
        variantId,
        currentQty + 1
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecrease = async (
    variantId: number,
    currentQty: number
  ) => {
    if (currentQty <= 1) {
      return;
    }

    try {
      await updateCart(
        variantId,
        currentQty - 1
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading cart..." />
    );
  }

  const items = cart?.items ?? [];

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.subtotal),
    0
  );

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your KAHWƐ Picks
            </p>

            <h1
              className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              Ready to eat?
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Review your cart and proceed to checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Cart */}
      <section>
        <div
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">
          {items.length === 0 ? (
            <div
              className="rounded-4xl border border-(--color-border) px-6 py-24 text-center">
              <h2
                className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Nothing here yet.
              </h2>

              <p className="mx-auto mt-4 max-w-md text-(--color-text-muted)">
                Explore the menu and add something you fancy.
              </p>

              <div className="mt-10">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)">
                  Explore the Menu

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"/>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Cart header */}
              <div
                className="mb-8 flex items-end justify-between gap-6">
                <p className="text-sm text-(--color-text-muted)">
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </p>

                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-sm font-medium text-(--color-text-muted) transition-opacity hover:opacity-60">
                  Clear Cart
                </button>
              </div>

              {/* Cart items */}
              <div className="space-y-4">
                {items.map(
                  (item: CartItem) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-(--color-border) p-5 sm:p-6">
                      <div
                        className="grid grid-cols-3 items-center gap-4 sm:gap-6">
                        {/* Product information */}
                        <div className="min-w-0">
                          <h2
                            className="text-base font-semibold tracking-tight sm:text-lg">
                            {item.product_name}
                          </h2>

                          <p className="mt-1 text-sm text-(--color-text-muted)">
                            {item.variant_name}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div
                          className="flex flex-col items-center justify-center gap-2 text-center">
                          {/* Unit price × quantity */}
                          <p className="whitespace-nowrap text-sm text-(--color-text-muted)">
                            {formatCurrency(item.unit_price)} ×{" "}
                            {item.quantity}
                          </p>

                          {/* Stepper */}
                          <div
                            className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.product_name}`}
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                handleDecrease(
                                  item.variant,
                                  item.quantity
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-sm transition-colors hover:bg-(--color-surface-muted) disabled:cursor-not-allowed disabled:opacity-30">
                              -
                            </button>

                            <span
                              className="min-w-5 text-center text-sm font-medium">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.product_name}`}
                              onClick={() =>
                                handleIncrease(
                                  item.variant,
                                  item.quantity
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) text-sm transition-colors hover:bg-(--color-surface-muted)">
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price / remove */}
                        <div
                          className="flex flex-col items-end justify-center gap-2 text-right">
                          <p className="whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg">
                            {formatCurrency(item.subtotal)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(item.variant)
                            }
                            className="text-sm text-(--color-text-muted) transition-opacity ">
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>

              {/* Summary */}
              <div
                className="mt-12 border-t border-(--color-border) pt-8">
                <div
                  className="flex items-end justify-between gap-4">
                  <div>
                    <p className=" text-sm text-(--color-text-muted)">
                      Total
                    </p>

                    <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-(--color-border) px-4 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted) sm:px-6">
                    <span className="hidden sm:inline">
                      Continue to Checkout
                    </span>

                    <span className="sm:hidden">
                      Continue to Checkout
                    </span>

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"/>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}