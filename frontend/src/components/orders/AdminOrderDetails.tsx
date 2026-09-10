import type { Order } from "../../types/order";

import SectionTitle from "../common/SectionTitle";

import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import OrderStatusEditor from "./OrderStatusEditor";

interface AdminOrderDetailsProps {
  order: Order;
  selectedStatus: string;
  updating: boolean;
  onStatusChange: (status: string) => void;
  onUpdate: () => void;
}

export default function AdminOrderDetails({
  order,
  selectedStatus,
  updating,
  onStatusChange,
  onUpdate,
}: AdminOrderDetailsProps) {
  return (
    <div className="mt-6 border-t border-(--color-border) pt-6">
      {/* Delivery Address */}
      {order.address_text && (
        <p className="text-(--color-text-muted)">
          To{" "}
          <span className="text-(--color-text)">
            {order.address_text}
          </span>
        </p>
      )}

      {/* Items */}
      <div className="mt-8">
        <SectionTitle>
          Items
        </SectionTitle>

        <OrderItemsList items={order.items} />
      </div>

      {/* Order Summary */}
      <OrderSummary
        subtotal={order.subtotal}
        deliveryFee={order.delivery_fee}
        total={order.total_amount}
        refundedAmount={order.refunded_amount}
        refundStatus={order.refund_status}
      />

      {/* Status */}
      <div className="mt-8">
        <OrderStatusEditor
          order={order}
          selectedStatus={selectedStatus}
          updating={updating}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}