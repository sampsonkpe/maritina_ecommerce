import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  ORDER_STATUS,
  type OrderStatus,
} from "../../constants/order";

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

  const [collapsedSections, setCollapsedSections] =
    useState<string[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter(
            (id) => id !== orderId
          )
        : [...prev, orderId]
    );
  };

  const toggleSection = (
    section: string
  ) => {
    setCollapsedSections((prev) =>
      prev.includes(section)
        ? prev.filter(
            (item) => item !== section
          )
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
      !activeExcludedStatuses.includes(
        order.status
      )
  );

  const fulfilledOrders = orders.filter(
    (order) =>
      order.status ===
        ORDER_STATUS.DELIVERED ||
      order.status ===
        ORDER_STATUS.PICKED_UP
  );

  const cancelledOrders = orders.filter(
    (order) =>
      order.status ===
      ORDER_STATUS.CANCELLED
  );

  const renderOrders = (
    ordersToRender: Order[]
  ) => (
    <div className="space-y-6">
      {ordersToRender.map((order) => (
        <div
          key={order.id}
          className="
            rounded-md
            border
            border-(--color-border)
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

          {expandedOrders.includes(
            order.id
          ) && (
            <OrderItemsList
              items={order.items}
            />
          )}

          <OrderSummary
            subtotal={order.subtotal}
            deliveryFee={order.delivery_fee}
            total={order.total_amount}
            refundedAmount={order.refunded_amount}
            refundStatus={order.refund_status}
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
          onClick={() =>
            toggleSection(key)
          }
          aria-expanded={!collapsed}
          className="
            flex
            w-full
            items-center
            justify-between
            text-left
          "
        >
          <span
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wider
            "
          >
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
          className="
            mt-3
            border-t
            border-(--color-border)
          "
        />

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
        <div className="space-y-12">

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
    </PageContainer>
  );
}