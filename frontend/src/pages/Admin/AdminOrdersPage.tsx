import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data =
          await orderService.getAdminOrders();

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
    <div className="mx-auto max-w-6xl p-8">

      <h1 className="mb-8 text-3xl font-bold">
        All Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
          No orders found.
        </div>
      ) : (
        <div className="space-y-5">

          {orders.map((order) => (

            <div
              key={order.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <h2 className="text-xl font-semibold">
                    Order #{order.id}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.user_email}
                  </p>

                  <p className="mt-3 text-gray-700">
                    {order.delivery_type_display}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>

                </div>

                <div className="sm:text-right">

                  <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium">
                    {order.status}
                  </span>

                  <p className="mt-4 text-2xl font-bold">
                    GH₵
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}