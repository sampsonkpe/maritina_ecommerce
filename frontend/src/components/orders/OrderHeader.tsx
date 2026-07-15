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
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

      <div>
        <h2 className="text-2xl font-semibold">
          Order #{order.id}
        </h2>

        {showCustomer && (
          <p className="mt-2 text-sm text-gray-500">
            {order.user_email}
          </p>
        )}

        <p className="mt-3 text-gray-900">
          {order.delivery_type_display}
        </p>

        {showCustomer && (
          <p className="mt-2 text-sm text-gray-500">
            {formatDate(order.created_at)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-4 md:items-end">

        <StatusBadge status={order.status} />

        <div className="flex items-center gap-4 pr-4">

          <p className="text-3xl font-bold">
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
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
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