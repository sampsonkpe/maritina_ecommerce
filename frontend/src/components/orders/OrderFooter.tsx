import { formatDate } from "../../utils/date";

import Button from "../common/Button";

interface OrderFooterProps {
  createdAt: string;
  updatedAt: string;
  showPayButton?: boolean;
  onPay?: () => void;
}

export default function OrderFooter({
  createdAt,
  updatedAt,
  showPayButton = false,
  onPay,
}: OrderFooterProps) {
  return (
    <div className="mt-6 border-t border-(--color-border) pt-5 flex items-center justify-between gap-4">
      <div className="text-sm text-(--color-text-muted)">
        Order placed on {formatDate(createdAt)}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right text-sm text-(--color-text-muted)">
          Status updated on {formatDate(updatedAt)}
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
    </div>
  );
}