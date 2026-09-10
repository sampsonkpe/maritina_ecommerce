import { formatCurrency } from "../../utils/currency";

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  refundedAmount?: number | string;
  refundStatus?: string | null;
}

export default function OrderSummary({
  subtotal,
  deliveryFee,
  total,
  refundedAmount = 0,
  refundStatus = null,
}: OrderSummaryProps) {
  const refunded = Number(refundedAmount);
  const amountPaid = Math.max(
    Number(total) - refunded,
    0
  );

  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        border-(--color-border)
        bg-(--color-surface-muted)
        p-4
        sm:p-5
      "
    >
      {/* Subtotal */}
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-(--color-text-muted)">
          Subtotal
        </span>

        <span className="shrink-0">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* Delivery Fee */}
      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-(--color-text-muted)">
          Delivery Fee
        </span>

        <span className="shrink-0">
          {formatCurrency(deliveryFee)}
        </span>
      </div>

      {/* Total */}
      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-(--color-border)
          pt-3
          font-semibold
        "
      >
        <span>Total</span>

        <span className="shrink-0">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Refund information */}
      {refunded > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-(--color-text-muted)">
              Refunded
            </span>

            <span className="shrink-0">
              {formatCurrency(refunded)}
            </span>
          </div>

          {/* Amount Paid */}
          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-4
              border-t
              border-(--color-border)
              pt-3
              font-semibold
            "
          >
            <span>Amount Paid</span>

            <span className="shrink-0">
              {formatCurrency(amountPaid)}
            </span>
          </div>

          {/* Refund Status */}
          {refundStatus && (
            <div className="mt-2 text-right text-xs text-(--color-text-muted)">
              Refund status:{" "}
              <span className="font-medium">
                {refundStatus}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}