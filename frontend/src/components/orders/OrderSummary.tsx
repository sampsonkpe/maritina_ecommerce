import { formatCurrency } from "../../utils/currency";

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function OrderSummary({
  subtotal,
  deliveryFee,
  total,
}: OrderSummaryProps) {
  return (
    <div
      className="
        mt-5
        rounded-md
        border border-[var(--color-border)]
        bg-[var(--color-surface-muted)]
        p-4
      "
    >
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text-muted)]">
          Subtotal
        </span>

        <span>
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span className="text-[var(--color-text-muted)]">
          Delivery Fee
        </span>

        <span>
          {formatCurrency(deliveryFee)}
        </span>
      </div>

      <div
        className="
          mt-3
          flex
          justify-between
          border-t
          border-[var(--color-border)]
          pt-3
          font-semibold
        "
      >
        <span>Total</span>

        <span>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}