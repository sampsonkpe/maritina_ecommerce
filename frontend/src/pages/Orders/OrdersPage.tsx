import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

import type { Order } from "../../types/order";

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const formatStatus = (status: string) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
      char.toUpperCase()
      );
  };

  const [loading, setLoading] =
    useState(true);

  const handlePayment = async (
    orderId: number
  ) => {
    try {
      const response =
        await paymentService.initializePayment(
          orderId
        );

      if (!response.status) {
        alert(response.message);
        return;
      }

      window.location.href =
        response.data.authorization_url;
    } catch (error: any) {
      console.error("FULL ERROR:", error);

      console.log(
        "RESPONSE DATA:",
        error?.response?.data
      );
      
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Payment initialisation failed. Please try again.";

      alert(message);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const reference =
          params.get("reference");

        if (reference) {
          try {
            await paymentService.verifyPayment(
              reference
            );

            window.history.replaceState(
              {},
              document.title,
              "/orders"
            );
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error
            );
          }
        }

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
                    {formatStatus(order.delivery_type)}
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
                    {formatStatus(order.status)}
                  </span>

                  {order.status ===
                    "PENDING" && (
                    <button
                      onClick={() =>
                        handlePayment(
                          order.id
                        )
                      }
                      className="ml-3 rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Pay Now
                    </button>
                  )}

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
                  {order.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="text-sm"
                      >
                        {
                          item.product_name
                        }
                        {" "}
                        (
                        {
                          item.variant_name
                        }
                        )
                        {" "}
                        ×
                        {" "}
                        {
                          item.quantity
                        }
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}