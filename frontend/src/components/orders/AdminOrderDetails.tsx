import type { Order } from "../../types/order";

import SectionTitle from "../common/SectionTitle";

import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import OrderStatusEditor from "./OrderStatusEditor";

interface AdminOrderDetailsProps {
  order: Order;
  selectedStatus: string;
  updating: boolean;
  cancelling: boolean;
  onStatusChange: (status: string) => void;
  onUpdate: () => void;
  onCancel: () => void;
}

export default function AdminOrderDetails({
  order,
  selectedStatus,
  updating,
  cancelling,
  onStatusChange,
  onUpdate,
  onCancel,
}: AdminOrderDetailsProps) {
  return (
    <div className="mt-6 border-t border-(--color-border) pt-6">
      {/* Delivery Address */}
      {order.address_text && (
        <div>
          <SectionTitle>
            Delivery Address
          </SectionTitle>

          <p className="mt-2 text-(--color-text-muted)">
            {order.address_text}
          </p>
        </div>
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
      <OrderStatusEditor
        order={order}
        selectedStatus={selectedStatus}
        updating={updating}
        cancelling={cancelling}
        onStatusChange={onStatusChange}
        onUpdate={onUpdate}
        onCancel={onCancel}
      />
    </div>
  );
}