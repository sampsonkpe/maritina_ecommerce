import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import {
  ORDER_STATUS,
  type OrderStatus,
} from "../../constants/order";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";

import OrderItemsList from "../../components/orders/OrderItemsList";
import OrderSummary from "../../components/orders/OrderSummary";
import OrderHeader from "../../components/orders/OrderHeader";
import OrderFooter from "../../components/orders/OrderFooter";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedOrders, setExpandedOrders] =
    useState<number[]>([]);

  const [collapsedSections, setCollapsedSections] =
    useState<string[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) =>
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section]
    );
  };

  const activeExcludedStatuses: OrderStatus[] = [
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.CANCELLED,
  ];

  const activeOrders = orders.filter(
    (order) =>
      !activeExcludedStatuses.includes(order.status)
  );

  const fulfilledOrders = orders.filter(
    (order) =>
      order.status === ORDER_STATUS.DELIVERED ||
      order.status === ORDER_STATUS.PICKED_UP
  );

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === ORDER_STATUS.CANCELLED
  );

  const renderOrders = (
    ordersToRender: Order[]
  ) => (
    <div className="space-y-5">
      {ordersToRender.map((order) => {
        const expanded = expandedOrders.includes(order.id);

        return (
          <article
            key={order.id}
            className="
              rounded-3xl
              border
              border-(--color-border)
              bg-(--color-surface)
              p-5
              sm:p-6
            "
          >
            <OrderHeader
              order={order}
              expanded={expanded}
              onToggle={() =>
                toggleOrder(order.id)
              }
            />

            {expanded && (
              <>
                <OrderItemsList
                  items={order.items}
                />

                <OrderSummary
                  subtotal={order.subtotal}
                  deliveryFee={order.delivery_fee}
                  total={order.total_amount}
                  refundedAmount={order.refunded_amount}
                  refundStatus={order.refund_status}
                />
              </>
            )}

            <OrderFooter
              orderId={order.id}
              createdAt={order.created_at}
              updatedAt={order.updated_at}
              showTrackOrder
            />
          </article>
        );
      })}
    </div>
  );

  const renderSection = (
    key: string,
    title: string,
    ordersToRender: Order[]
  ) => {
    if (ordersToRender.length === 0) {
      return null;
    }

    const collapsed =
      collapsedSections.includes(key);

    return (
      <section>
        <button
          type="button"
          onClick={() => toggleSection(key)}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-between text-left">
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em]">
            {title}
          </span>

          {collapsed ? (
            <ChevronDown
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          ) : (
            <ChevronUp
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          )}
        </button>

        <div
          className="mt-4 border-t border-(--color-border)"/>

        {!collapsed && (
          <div className="mt-6">
            {renderOrders(ordersToRender)}
          </div>
        )}
      </section>
    );
  };

  useEffect(() => {
    const loadOrders = async () => {
      setError("");

      try {
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
      <LoadingState message="Loading orders..." />
    );
  }

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto flex min-h-[calc(50vh-4rem)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your KAHWƐ Orders
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              All your orders in one place.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Keep track of your active orders, your completed orders and everything in between.
            </p>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
          {error && (
            <div className="mb-8">
              <Alert message={error} />
            </div>
          )}

          {orders.length === 0 ? (
            <EmptyState title="No orders found. Please place an order to get started." />
          ) : (
            <div className="mx-auto max-w-5xl space-y-12">
              {renderSection(
                "active",
                "Active Orders",
                activeOrders
              )}

              {renderSection(
                "fulfilled",
                "Fulfilled Orders",
                fulfilledOrders
              )}

              {renderSection(
                "cancelled",
                "Cancelled Orders",
                cancelledOrders
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}