import { formatDate } from "../../utils/date";

import Button from "../common/Button";

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
        <Button
          type="button"
          variant="success"
          onClick={onPay}
        >
          Pay Now
        </Button>
      )}
    </div>
  );
}