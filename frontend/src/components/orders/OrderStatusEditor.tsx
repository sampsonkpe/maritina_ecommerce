import type { Order } from "../../types/order";

import StatusBadge from "../common/StatusBadge";

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
    order.status === ORDER_STATUS.CANCELLED;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="mb-4 font-semibold">
        Order Status
      </h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {isFinalStatus ? (
          <StatusBadge status={order.status} />
        ) : (
          <>
            <select
              value={selectedStatus}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              className="rounded-lg border px-4 py-3"
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

            <button
              type="button"
              onClick={onUpdate}
              disabled={
                updating ||
                selectedStatus === order.status
              }
              className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? "Updating..."
                : "Update Status"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}