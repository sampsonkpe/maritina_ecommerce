import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data =
          await orderService.getOrders();

        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded border p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">
                    Order #{order.id}
                  </h2>

                  <p>
                    {order.delivery_type}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.items.length} item
                    {order.items.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                    {order.status}
                  </span>

                  <p className="mt-3 font-semibold">
                    GHS {order.total_amount}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </div>

              <div className="mt-4">
                <div className="mb-3 rounded border p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      GHS {order.subtotal}
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span>Delivery Fee</span>
                    <span>
                      GHS {order.delivery_fee}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      GHS {order.total_amount}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-sm"
                    >
                      {item.product_name}
                      {" "}
                      ({item.variant_name})
                      {" "}
                      ×
                      {" "}
                      {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}