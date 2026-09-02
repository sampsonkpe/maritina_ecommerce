import type { Order } from "../../types/order";

import SectionTitle from "../common/SectionTitle";

import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import OrderStatusEditor from "./OrderStatusEditor";
import OrderFooter from "./OrderFooter";

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
    <div className="mt-6 border-t pt-6">

      <div>
        <SectionTitle>
          Delivery Address
        </SectionTitle>

        <p className="mt-2 text-gray-600">
          {order.address_text ??
            "Pickup Order"}
        </p>
      </div>

      <div className="mt-8">
        <SectionTitle>
          Items
        </SectionTitle>

        <OrderItemsList
          items={order.items}
        />
      </div>

      <OrderSummary
        subtotal={order.subtotal}
        deliveryFee={order.delivery_fee}
        total={order.total_amount}
        refundedAmount={order.refunded_amount}
        refundStatus={order.refund_status}
      />

      <OrderStatusEditor
        order={order}
        selectedStatus={selectedStatus}
        updating={updating}
        onStatusChange={onStatusChange}
        onUpdate={onUpdate}
      />

      <OrderFooter
        createdAt={order.created_at}
        updatedAt={order.updated_at}
        showPayButton={false}
      />
    </div>
  );
}