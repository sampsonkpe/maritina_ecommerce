import type { OrderItem } from "../../types/order";

import { formatCurrency } from "../../utils/currency";

interface OrderItemsListProps {
  items: OrderItem[];
  showPrice?: boolean;
}

export default function OrderItemsList({
  items,
  showPrice = true,
}: OrderItemsListProps) {
  return (
    <div className="mt-4 space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border bg-gray-50 p-4"
        >
          <p className="font-medium">
            {item.product_name}
          </p>

          <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
            <span>
              {item.variant_name || "Standard"}
            </span>

            <span>
              ×{item.quantity}
            </span>
          </div>

          {showPrice && (
            <div className="mt-2 text-right text-sm font-medium">
              {formatCurrency(item.subtotal)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}