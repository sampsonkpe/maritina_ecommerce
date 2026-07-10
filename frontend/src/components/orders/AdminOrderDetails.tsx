import type { Order } from "../../types/order";

import OrderItemsList from "./OrderItemsList";
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
    <div className="mt-6 border-t pt-6">

      <div>
        <h3 className="font-semibold">
          Delivery Address
        </h3>

        <p className="mt-2 text-gray-600">
          {order.address_text ??
            "Pickup Order"}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold">
          Items ({order.items.length})
        </h3>

        <OrderItemsList
          items={order.items}
          showPrice={false}
        />
      </div>

      <OrderStatusEditor
        order={order}
        selectedStatus={selectedStatus}
        updating={updating}
        onStatusChange={onStatusChange}
        onUpdate={onUpdate}
      />

    </div>
  );
}