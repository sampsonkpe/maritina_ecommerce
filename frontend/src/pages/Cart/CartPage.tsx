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
          <div className="space-y-4">
            {cart?.items?.map(
              (item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h2 className="font-semibold">
                      {item.product_name}
                    </h2>

                    <p>
                      {item.variant_name}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <button
                        aria-label="Decrease quantity"
                        disabled={
                          item.quantity <= 1
                        }
                        onClick={() =>
                          handleDecrease(
                            item.variant,
                            item.quantity
                          )
                        }
                        className="h-8 w-8 rounded-lg border"
                      >
                        -
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          handleIncrease(
                            item.variant,
                            item.quantity
                          )
                        }
                        className="h-8 w-8 rounded-lg border"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p>
                      {formatCurrency(
                        item.subtotal
                      )}
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
              Total:{" "}
              {formatCurrency(total)}
            </h2>

            <button
              onClick={() =>
                navigate("/checkout")
              }
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </PageContainer>
  );
}