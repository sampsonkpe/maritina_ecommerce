import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";

import type { Order } from "../../types/order";

import { PAYMENT_STATUS } from "../../constants/payment";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import PageContainer from "../../components/common/PageContainer";
import Alert from "../../components/common/Alert";

import OrderItemsList from "../../components/orders/OrderItemsList";
import OrderSummary from "../../components/orders/OrderSummary";
import OrderHeader from "../../components/orders/OrderHeader";
import OrderFooter from "../../components/orders/OrderFooter";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePayment = async (orderId: number) => {
    setError("");

    try {
      const response = await paymentService.initializePayment(orderId);

      if (!response.status) {
        setError(response.message);
        return;
      }

      window.location.href = response.data.authorization_url;
    } catch (error: unknown) {
      console.error("FULL ERROR:", error);

      const isPaymentError = (value: unknown): value is {
        response?: { data?: { error?: string; message?: string } };
      } =>
        typeof value === "object" &&
        value !== null &&
        "response" in value;

      const message =
        isPaymentError(error)
          ? error.response?.data?.error || error.response?.data?.message
          : undefined;

      setError(
        message ||
          "Payment initialisation failed. Please try again."
      );
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setError("");

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

            setError(
              "We couldn't verify your payment. If you've been charged, please contact Support."
            );
          }
        }

        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <LoadingState
        message="Loading orders..."
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader title="My Orders" />
      {error && <Alert message={error} />}

      {orders.length === 0 ? (
        <EmptyState title="No orders found." />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-md border bg-white p-6 shadow-sm"
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
    </PageContainer>
  );
}