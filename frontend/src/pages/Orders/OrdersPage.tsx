import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

import type { Order } from "../../types/order";

import { PAYMENT_STATUS } from "../../constants/payment";
import OrderItemsList from "../../components/orders/OrderItemsList";
import OrderSummary from "../../components/orders/OrderSummary";
import PageHeader from "../../components/common/PageHeader";
import OrderHeader from "../../components/orders/OrderHeader";
import OrderFooter from "../../components/orders/OrderFooter";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePayment = async (orderId: number) => {
    try {
      const response = await paymentService.initializePayment(orderId);

      if (!response.status) {
        alert(response.message);
        return;
      }

      window.location.href = response.data.authorization_url;
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
        const params = new URLSearchParams(window.location.search);
        const reference = params.get("reference");

        if (reference) {
          try {
            await paymentService.verifyPayment(reference);

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

        const data = await orderService.getOrders();
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
      <PageHeader title="My Orders" />

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <OrderHeader
                order={order}
                expanded={expandedOrders.includes(order.id)}
                onToggle={() => toggleOrder(order.id)}
              />

              {expandedOrders.includes(order.id) && (
                <OrderItemsList items={order.items} />
              )}

              <OrderSummary
                subtotal={order.subtotal}
                deliveryFee={order.delivery_fee}
                total={order.total_amount}
              />

              <OrderFooter
              createdAt={order.created_at}
              showPayButton={
                order.payment_status === PAYMENT_STATUS.PENDING
              }
              onPay={() => handlePayment(order.id)}
            />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}