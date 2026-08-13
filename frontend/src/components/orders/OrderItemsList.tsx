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
    <div
      className="
        mt-4
        rounded-md
        border border-(--color-border)
        bg-(--color-surface-muted)
        p-4
      "
    >
      <div className="space-y-5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={
              index > 0
                ? "border-t border-(--color-border) pt-5"
                : ""
            }
          >
            <p className="font-medium">
              {item.product_name}
            </p>

            <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center text-sm">
              <span className="min-w-0 text-(--color-text-muted)">
                {item.variant_name || "Standard"}
              </span>

              <span className="justify-self-center text-(--color-text-muted)">
                ×{item.quantity}
              </span>

              {showPrice && (
                <span className="justify-self-end text-(--color-text-muted)">
                  {formatCurrency(item.subtotal)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}