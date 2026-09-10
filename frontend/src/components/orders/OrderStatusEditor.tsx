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
  cancelling: boolean;
  onStatusChange: (status: string) => void;
  onUpdate: () => void;
  onCancel: () => void;
}

export default function OrderStatusEditor({
  order,
  selectedStatus,
  updating,
  cancelling,
  onStatusChange,
  onUpdate,
  onCancel,
}: OrderStatusEditorProps) {
  const nextStatuses =
    ORDER_STATUS_TRANSITIONS[
      order.status as keyof typeof ORDER_STATUS_TRANSITIONS
    ] ?? [];

  const isPaid =
    order.payment_status === "PAID";

  const availableStatuses = [
    order.status,
    ...nextStatuses.filter((status) => {
      /*
       * Fulfilment may only begin after payment.
       *
       * This mirrors the backend protection in
       * OrderService.update_order_status().
       */
      const requiresPayment =
        status === ORDER_STATUS.CONFIRMED ||
        status === ORDER_STATUS.PREPARING ||
        status === ORDER_STATUS.OUT_FOR_DELIVERY ||
        status === ORDER_STATUS.READY_FOR_PICKUP ||
        status === ORDER_STATUS.DELIVERED ||
        status === ORDER_STATUS.PICKED_UP;

      if (requiresPayment && !isPaid) {
        return false;
      }

      /*
       * Delivery-specific statuses.
       */
      if (
        status === ORDER_STATUS.OUT_FOR_DELIVERY ||
        status === ORDER_STATUS.DELIVERED
      ) {
        return order.delivery_type === "DELIVERY";
      }

      /*
       * Pickup-specific statuses.
       */
      if (
        status === ORDER_STATUS.READY_FOR_PICKUP ||
        status === ORDER_STATUS.PICKED_UP
      ) {
        return order.delivery_type === "PICKUP";
      }

      return true;
    }),
  ];

  const isFinalStatus =
    order.status === ORDER_STATUS.DELIVERED ||
    order.status === ORDER_STATUS.PICKED_UP ||
    order.status === ORDER_STATUS.CANCELLED;

  const canCancel =
    order.status === ORDER_STATUS.PENDING ||
    order.status === ORDER_STATUS.CONFIRMED;

  if (isFinalStatus) {
    return (
      <div className="mt-8 border-t border-(--color-border) pt-6">
        <h3 className="mb-4 text-center font-semibold">
          Order Status
        </h3>

        <div className="flex justify-center">
          <StatusBadge status={order.status} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-(--color-border) pt-6">
      <h3 className="mb-5 text-center font-semibold">
        Order Status
      </h3>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <select
          value={selectedStatus}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          disabled={updating || cancelling}
          aria-label="Order status"
          className="
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface)
            px-4
            py-3
            text-(--color-text)
            outline-none
            focus:border-(--color-text-muted)
            disabled:cursor-not-allowed
            disabled:opacity-60
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
            cancelling ||
            selectedStatus === order.status
          }
          rounded="2xl"
        >
          {updating
            ? "Updating..."
            : "Update Status"}
        </Button>
      </div>

      {!isPaid &&
        order.status === ORDER_STATUS.PENDING && (
          <p className="mt-4 text-center text-sm text-(--color-text-muted)">
            This order must be paid before fulfilment
            can begin.
          </p>
        )}

      {canCancel && (
        <div className="mt-6 border-t border-(--color-border) pt-5 text-center">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={updating || cancelling}
            rounded="2xl"
          >
            {cancelling
              ? "Processing..."
              : "Cancel Order"}
          </Button>

          <p className="mt-2 text-sm text-(--color-text-muted)">
            Paid orders are refunded before cancellation
            is completed.
          </p>
        </div>
      )}
    </div>
  );
}