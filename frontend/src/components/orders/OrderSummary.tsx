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
    <div className="mt-5 rounded-md border bg-gray-50 p-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>

        <span>
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span>Delivery Fee</span>

        <span>
          {formatCurrency(deliveryFee)}
        </span>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
        <span>Total</span>

        <span>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}