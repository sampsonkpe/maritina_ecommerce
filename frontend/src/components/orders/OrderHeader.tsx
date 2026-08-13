import type { Order } from "../../types/order";

import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrderHeaderProps {
  order: Order;
  showCustomer?: boolean;
  onToggle: () => void;
  expanded: boolean;
}

export default function OrderHeader({
  order,
  expanded,
  onToggle,
  showCustomer = false,
}: OrderHeaderProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4">

      {/* Left */}
      <div className="min-w-0">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Order #{order.id}
        </h2>

        {showCustomer && (
          <p className="mt-2 text-sm text-(--color-text-muted)">
            {order.user_email}
          </p>
        )}

        <p className="mt-3 text-(--color-text)">
          {order.delivery_type_display}
        </p>

        {showCustomer && (
          <p className="mt-2 text-sm text-(--color-text-muted)">
            {formatDate(order.created_at)}
          </p>
        )}
      </div>

      {/* Right */}
      <div className="flex min-w-0 flex-col items-end gap-4">
        <StatusBadge status={order.status} />

        <div className="flex items-center gap-2">
          <p className="text-xl font-bold sm:text-3xl">
            {formatCurrency(order.total_amount)}
          </p>

          <button
            type="button"
            aria-label={
              expanded
                ? "Collapse order"
                : "Expand order"
            }
            aria-expanded={expanded}
            onClick={onToggle}
            className="
              rounded-md
              p-2
              text-(--color-text-muted)
              transition
              hover:bg-(--color-surface-muted)
              hover:text-(--color-text)
            "
          >
            {expanded ? (
              <ChevronUp size={22} />
            ) : (
              <ChevronDown size={22} />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}