import { ArrowRight } from "lucide-react";

import type { Cart } from "../../types/cart";

import { formatCurrency } from "../../utils/currency";
import { DELIVERY_TYPE } from "../../constants/order";

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
    <aside
      className="
        rounded-(--radius-lg)
        border
        border-(--color-border)
        p-5
        sm:p-6
        lg:sticky
        lg:top-8
      "
    >
      <h2
        className="
          text-center
          text-xl
          font-semibold
          tracking-tight
          sm:text-2xl
        "
      >
        Order Summary
      </h2>

      {/* Items */}
      <div className="mt-6 space-y-4">
        {cart?.items.map((item) => (
          <div
            key={item.id}
            className="
              grid
              grid-cols-3
              items-center
              gap-4
              border-b
              border-(--color-border)
              pb-4
              last:border-b-0
              last:pb-0
              sm:gap-6
            "
          >
            {/* Product */}
            <div className="min-w-0">
              <p
                className="
                  text-base
                  font-semibold
                  leading-6
                  tracking-tight
                  sm:text-lg
                  sm:leading-7
                "
              >
                {item.product_name}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-(--color-text-muted)
                "
              >
                {item.variant_name}
              </p>
            </div>

            {/* Unit price × quantity */}
            <p
              className="
                text-center
                text-sm
                text-(--color-text-muted)
                whitespace-nowrap
              "
            >
              {formatCurrency(item.unit_price)} ×{" "}
              {item.quantity}
            </p>

            {/* Subtotal */}
            <p
              className="
                text-right
                text-sm
                font-medium
                whitespace-nowrap
              "
            >
              {formatCurrency(item.subtotal)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        className="
          mt-6
          border-t
          border-(--color-border)
          pt-6
        "
      >
        <div className="space-y-3">
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              text-sm
            "
          >
            <span className="text-(--color-text-muted)">
              Subtotal
            </span>

            <span className="whitespace-nowrap">
              {formatCurrency(cart?.subtotal ?? 0)}
            </span>
          </div>

          {deliveryType === DELIVERY_TYPE.DELIVERY && (
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                text-sm
              "
            >
              <span className="text-(--color-text-muted)">
                Delivery Fee
              </span>

              <span className="whitespace-nowrap">
                {formatCurrency(deliveryFee)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div
          className="
            mt-6
            border-t
            border-(--color-border)
            pt-5
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <span
              className="
                text-base
                font-semibold
                tracking-tight
                text-(--color-text-muted)
                sm:text-lg
              "
            >
              Total
            </span>

            <span
              className="
                text-2xl
                font-semibold
                tracking-tight
                sm:text-3xl
                whitespace-nowrap
              "
            >
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <button
        type="button"
        onClick={onCheckout}
        disabled={placingOrder}
        className="
          group
          mt-6
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-(--radius-full)
          border
          border-(--color-border)
          px-6
          py-3
          text-sm
          font-medium
          transition-colors
          hover:bg-(--color-surface-muted)
          disabled:cursor-not-allowed
          disabled:opacity-40
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-(--color-accent)
          focus-visible:ring-offset-2
          focus-visible:ring-offset-(--color-background)
        "
      >
        <span>
          {placingOrder
            ? "Processing..."
            : "Continue to Payment"}
        </span>

        {!placingOrder && (
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        )}
      </button>
    </aside>
  );
}