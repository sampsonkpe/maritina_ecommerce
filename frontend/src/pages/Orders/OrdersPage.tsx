import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

import type { Order } from "../../types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const formatStatus = (status: string) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatCurrency = (
    amount: number | string
  ) => {
    return `GH₵${Number(amount).toFixed(2)}`;
  };

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700";

      case "PAID":
        return "bg-yellow-100 text-yellow-800";

      case "PREPARING":
        return "bg-blue-100 text-blue-800";

      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800";

      case "DELIVERED":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Order #{order.id}
                </h2>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">
                      {order.delivery_type_display}
                      {order.address_text
                        ? ` - ${order.address_text}`
                        : ""}
                    </p>
                  </div>

                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>
            </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Order Items (
                  {order.items.length})
                </h3>

                <div className="space-y-3">
                  {order.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="rounded-lg bg-gray-50 p-4"
                      >
                        <p className="font-medium">
                          {
                            item.product_name
                          }
                        </p>

                        <p className="text-sm text-gray-500">
                          {
                            item.variant_name
                          }
                        </p>

                        <div className="mt-2 flex justify-between text-sm">
                          <span>
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </span>

                          <span className="font-medium">
                            {formatCurrency(
                              item.subtotal
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-xl border bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatCurrency(
                      order.subtotal
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span>
                    Delivery Fee
                  </span>

                  <span>
                    {formatCurrency(
                      order.delivery_fee
                    )}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                  <span>Total</span>

                  <span>
                    {formatCurrency(
                      order.total_amount
                    )}
                  </span>
                </div>
              </div>

                  {order.status ===
                    "PENDING" && (
                    <div className="mt-4 flex justify-end">
                    <button
                      onClick={() =>
                        handlePayment(
                          order.id
                        )
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Pay Now
                    </button>
                  </div>
                  )}

              <div className="mt-5 text-sm text-gray-500">
                Ordered on{" "}
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}