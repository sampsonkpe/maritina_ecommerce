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

  return (
    <div
      className="
        mt-5
        rounded-md
        border border-(--color-border)
        bg-(--color-surface-muted)
        p-4
      "
    >
      <div className="flex justify-between text-sm">
        <span className="text-(--color-text-muted)">
          Subtotal
        </span>

        <span>
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span className="text-(--color-text-muted)">
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
          border-(--color-border)
          pt-3
          font-semibold
        "
      >
        <span>Total</span>

        <span>
          {formatCurrency(total)}
        </span>
      </div>

      {refunded > 0 && (
        <>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-(--color-text-muted)">
              Refunded
            </span>

            <span>
              {formatCurrency(refunded)}
            </span>
          </div>

          <div
            className="
              mt-3
              flex
              justify-between
              border-t
              border-(--color-border)
              pt-3
              font-semibold
            "
          >
            <span>Amount Paid</span>

            <span>
              {formatCurrency(
                Math.max(
                  Number(total) - refunded,
                  0
                )
              )}
            </span>
          </div>

          {refundStatus && (
            <div className="mt-2 text-right text-xs text-(--color-text-muted)">
              Refund status:{" "}
              <span className="font-medium">
                {refundStatus}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}