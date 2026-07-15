import type { Cart } from "../../types/cart";

import { formatCurrency } from "../../utils/currency";

interface CheckoutSummaryProps {
  cart: Cart | null;
  deliveryFee: number;
  total: number;
  deliveryType: string;
  placingOrder: boolean;
  onCheckout: () => void;
}

export default function CheckoutSummary({
  cart,
  deliveryFee,
  total,
  deliveryType,
  placingOrder,
  onCheckout,
}: CheckoutSummaryProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:self-start">
      <h2 className="mb-5 text-xl font-semibold">
        Order Summary
      </h2>

      {cart?.items.map((item) => (
        <div
          key={item.id}
          className="mb-4 border-b pb-4 last:mb-0 last:border-b-0"
        >
          <p className="font-medium">
            {item.product_name}
          </p>

          <p className="text-sm text-gray-500">
            {item.variant_name}
          </p>

          <div className="mt-2 flex justify-between text-sm">
            <span>Qty: {item.quantity}</span>

            <span className="font-medium">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        </div>
      ))}

      <div className="mt-6 space-y-3 border-t pt-4">

        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>
            {formatCurrency(cart?.subtotal ?? 0)}
          </span>
        </div>

        {deliveryType === "DELIVERY" && (
          <div className="flex justify-between">
            <span>Delivery Fee</span>

            <span>
              {formatCurrency(deliveryFee)}
            </span>
          </div>
        )}

        <div className="flex justify-between border-t pt-3 text-lg font-semibold">
          <span>Total</span>

          <span>
            {formatCurrency(total)}
          </span>
        </div>

      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={placingOrder}
        className="mt-6 w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placingOrder
          ? "Creating Order..."
          : "Place Order"}
      </button>
    </div>
  );
}