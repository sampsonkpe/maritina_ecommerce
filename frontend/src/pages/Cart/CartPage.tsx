import { useNavigate } from "react-router-dom";

import type { CartItem } from "../../types/cart";

import { useCart } from "../../context/CartContext";

import { formatCurrency } from "../../utils/currency";

import LoadingState from "../../components/common/LoadingState";
import PageContainer from "../../components/common/PageContainer";

export default function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    updateCart,
    removeItem,
    clearCart,
  } = useCart();

  const handleRemove = async (
    variantId: number
  ) => {
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
      <LoadingState
        message="Loading cart..."
      />
    );
  }

  const total =
    cart?.items.reduce(
      (sum, item) =>
        sum + Number(item.subtotal),
      0
    ) ?? 0;

  return (
    <PageContainer>
      <h1 className="mb-8 text-3xl font-bold">
        Cart
      </h1>

      {cart?.items?.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleClearCart}
              className="
                text-sm
                text-(--color-text-muted)
                transition-opacity
                hover:opacity-60
              "
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-4">
            {cart?.items?.map(
              (item: CartItem) => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 items-center border p-5 rounded-md"
                >
                  {/* Left */}
                  <div>
                    <h2 className="font-semibold">
                      {item.product_name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {item.variant_name}
                    </p>
                  </div>

                  {/* Centre */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>

                    <div className="mt-2 flex items-center justify-center gap-3">
                      <button
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          handleDecrease(
                            item.variant,
                            item.quantity
                          )
                        }
                        className="h-6 w-6 rounded-sm border"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          handleIncrease(
                            item.variant,
                            item.quantity
                          )
                        }
                        className="h-6 w-6 rounded-sm border"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>

                    <button
                      onClick={() =>
                        handleRemove(item.variant)
                      }
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-sm text-gray-500">
                Total
              </p>

              <h2 className="text-2xl font-bold">
                {formatCurrency(total)}
              </h2>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="rounded-md bg-black px-8 py-3 text-white"
            >
              Continue to Checkout
            </button>
          </div>
        </>
      )}
    </PageContainer>
  );
}