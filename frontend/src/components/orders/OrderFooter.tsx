import { formatDate } from "../../utils/date";

interface OrderFooterProps {
  createdAt: string;
  showPayButton?: boolean;
  onPay?: () => void;
}

export default function OrderFooter({
  createdAt,
  showPayButton = false,
  onPay,
}: OrderFooterProps) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Order placed on {formatDate(createdAt)}
      </div>

      {showPayButton && (
        <button
          type="button"
          onClick={onPay}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Pay Now
        </button>
      )}
    </div>
  );
}