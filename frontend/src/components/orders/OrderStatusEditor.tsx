import type { Order } from "../../types/order";

import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
} from "../../constants/order";

import { formatStatus } from "../../utils/status";

interface OrderStatusEditorProps {
  order: Order;
  selectedStatus: string;
  updating: boolean;
  onStatusChange: (status: string) => void;
  onUpdate: () => void;
}

export default function OrderStatusEditor({
  order,
  selectedStatus,
  updating,
  onStatusChange,
  onUpdate,
}: OrderStatusEditorProps) {
  const availableStatuses = [
    order.status,
    ...(ORDER_STATUS_TRANSITIONS[
      order.status as keyof typeof ORDER_STATUS_TRANSITIONS
    ] ?? []),
  ];

  const isFinalStatus =
    order.status === ORDER_STATUS.DELIVERED ||
    order.status === ORDER_STATUS.PICKED_UP ||
    order.status === ORDER_STATUS.CANCELLED;

  return (
    <div className="mt-8 border-t border-(--color-border) pt-6">
      <h3 className="mb-4 text-center font-semibold">
        Order Status
      </h3>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {isFinalStatus ? (
          <StatusBadge status={order.status} />
        ) : (
          <>
            <select
              value={selectedStatus}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              className="
                rounded-md
                border border-(--color-border)
                bg-(--color-surface)
                px-4
                py-3
                text-(--color-text)
                outline-none
                focus:border-(--color-text-muted)
              "
            >
              {availableStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="primary"
              onClick={onUpdate}
              disabled={
                updating ||
                selectedStatus === order.status
              }
            >
              {updating
                ? "Updating..."
                : "Update Status"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}