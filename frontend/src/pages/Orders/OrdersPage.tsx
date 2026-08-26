import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

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
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expandedOrders, setExpandedOrders] =
    useState<number[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter(
            (id) => id !== orderId
          )
        : [...prev, orderId]
    );
  };

  useEffect(() => {
    const loadOrders = async () => {
      setError("");

      try {
        const data =
          await orderService.getOrders();

        setOrders(data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load orders."
        );
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

      {error && (
        <Alert message={error} />
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="No orders found."
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="
                rounded-md
                border border-(--color-border)
                bg-(--color-surface)
                p-6
                shadow-sm
              "
            >
              <OrderHeader
                order={order}
                expanded={expandedOrders.includes(
                  order.id
                )}
                onToggle={() =>
                  toggleOrder(order.id)
                }
              />

              {expandedOrders.includes(order.id) && (
                <OrderItemsList
                  items={order.items}
                />
              )}

              <OrderSummary
                subtotal={order.subtotal}
                deliveryFee={order.delivery_fee}
                total={order.total_amount}
              />

              <div className="mt-5">
                <Link
                  to={`/orders/${order.id}`}
                  className="
                    inline-flex
                    items-center
                    text-sm
                    font-medium
                    text-(--color-text)
                    underline
                    underline-offset-4
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Track Order
                </Link>
              </div>

              <OrderFooter
                createdAt={order.created_at}
                updatedAt={order.updated_at}
                showPayButton={false}
              />
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}