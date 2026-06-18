import { useEffect, useState } from "react";

import { adminOrderService } from "../../services/adminOrderService";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);

  const loadOrders = async () => {
    try {
      const data =
        await adminOrderService.getOrders();

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (
    orderId: number,
    status: string
  ) => {
    try {
      await adminOrderService.updateStatus(
        orderId,
        status
      );

      loadOrders();
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
        "Failed to update order"
      );
    }
  };

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
        Admin Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded border p-5"
          >
            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-semibold">
                  Order #{order.id}
                </h2>

                <p>
                  {order.user_email}
                </p>

                <p>
                  {order.delivery_type_display}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {order.status
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())
                  }
                </p>

                <p>
                  GHS {order.total_amount}
                </p>
              </div>

            </div>

            <div className="mt-4 flex gap-3">

              {order.status === "PAID" && (
                <button
                  onClick={() =>
                    updateStatus(
                      order.id,
                      "PREPARING"
                    )
                  }
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Mark Preparing
                </button>
              )}

              {order.status ===
                "PREPARING" && (
                <button
                  onClick={() =>
                    updateStatus(
                      order.id,
                      "OUT_FOR_DELIVERY"
                    )
                  }
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Out For Delivery
                </button>
              )}

              {order.status ===
                "OUT_FOR_DELIVERY" && (
                <button
                  onClick={() =>
                    updateStatus(
                      order.id,
                      "DELIVERED"
                    )
                  }
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Mark Delivered
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}