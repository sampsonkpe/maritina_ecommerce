import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { orderService } from "../../services/orderService";
import type { Order } from "../../types/order";

import {
  ORDER_STATUS,
  type OrderStatus,
} from "../../constants/order";

import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import PageContainer from "../../components/common/PageContainer";
import Alert from "../../components/common/Alert";

import OrderHeader from "../../components/orders/OrderHeader";
import AdminOrderFilters from "../../components/orders/AdminOrderFilters";
import AdminOrderDetails from "../../components/orders/AdminOrderDetails";
import OrderFooter from "../../components/orders/OrderFooter";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<number, Order["status"]>
  >({});

  const [updatingOrders, setUpdatingOrders] = useState<number[]>([]);
  const [cancellingOrders, setCancellingOrders] = useState<number[]>([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /*
   * Debounce search input so we don't request the API
   * on every keystroke.
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  /*
   * Load orders whenever the filters/search change.
   */
  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const data = await orderService.getAdminOrders({
          status: statusFilter,
          deliveryType: deliveryTypeFilter,
          search: debouncedSearch,
        });

        if (cancelled) {
          return;
        }

        setOrders(data);

        const initialStatuses: Record<
          number,
          Order["status"]
        > = {};

        data.forEach((order) => {
          initialStatuses[order.id] = order.status;
        });

        setSelectedStatuses(initialStatuses);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setError(
          "Failed to load orders. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [
    statusFilter,
    deliveryTypeFilter,
    debouncedSearch,
  ]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section]
    );
  };

  const handleUpdateStatus = async (orderId: number) => {
    setError("");
    setMessage("");

    const currentOrder = orders.find(
      (order) => order.id === orderId
    );

    if (!currentOrder) {
      return;
    }

    const newStatus = selectedStatuses[orderId];

    if (!newStatus || currentOrder.status === newStatus) {
      return;
    }

    setUpdatingOrders((current) =>
      current.includes(orderId)
        ? current
        : [...current, orderId]
    );

    try {
      await orderService.updateOrderStatus(
        orderId,
        newStatus
      );

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSelectedStatuses((current) => ({
        ...current,
        [orderId]: newStatus,
      }));

      setMessage(
        `Order #${orderId} status updated.`
      );
    } catch (error) {
      console.error(error);

      /*
       * The backend rejected the transition.
       * Restore the dropdown to the actual order status.
       */
      setSelectedStatuses((current) => ({
        ...current,
        [orderId]: currentOrder.status,
      }));

      setError(
        "Failed to update order status."
      );
    } finally {
      setUpdatingOrders((current) =>
        current.filter((id) => id !== orderId)
      );
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const currentOrder = orders.find(
      (order) => order.id === orderId
    );

    if (!currentOrder) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${orderId}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    setCancellingOrders((current) =>
      current.includes(orderId)
        ? current
        : [...current, orderId]
    );

    try {
      const result =
        await orderService.cancelAdminOrder(
          orderId
        );

      /*
       * Unpaid orders are cancelled immediately.
       *
       * Paid orders are different:
       * cancellation starts the refund workflow, but
       * the order remains in its current status until
       * Paystack confirms the refund as processed.
       */
      if (
        result.status ===
        ORDER_STATUS.CANCELLED
      ) {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status:
                    ORDER_STATUS.CANCELLED,
                  payment_status:
                    result.payment_status as Order[
                      "payment_status"
                    ],
                }
              : order
          )
        );

        setSelectedStatuses((current) => ({
          ...current,
          [orderId]:
            ORDER_STATUS.CANCELLED,
        }));

        setMessage(
          `Order #${orderId} cancelled successfully.`
        );
      } else {
        setMessage(
          `Refund initiated for Order #${orderId}. ` +
          `The order will be cancelled once ` +
          `the refund is successfully processed.`
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        "Failed to cancel order."
      );
    } finally {
      setCancellingOrders((current) =>
        current.filter((id) => id !== orderId)
      );
    }
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
        const expanded = expandedOrders.includes(
          order.id
        );

        const cancelling =
          cancellingOrders.includes(order.id);

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
              showCustomer
              expanded={expanded}
              onToggle={() =>
                toggleOrder(order.id)
              }
            />

            {expanded && (
              <AdminOrderDetails
                order={order}
                selectedStatus={
                  selectedStatuses[order.id] ??
                  order.status
                }
                updating={updatingOrders.includes(
                  order.id
                )}
                cancelling={cancelling}
                onCancel={() =>
                  handleCancelOrder(order.id)
                }
                onStatusChange={(status) =>
                  setSelectedStatuses((current) => ({
                    ...current,
                    [order.id]:
                      status as Order["status"],
                  }))
                }
                onUpdate={() =>
                  handleUpdateStatus(order.id)
                }
              />
            )}

            <OrderFooter
              orderId={order.id}
              createdAt={order.created_at}
              updatedAt={order.updated_at}
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
              tracking-[0.2em]
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
            mt-4
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

  if (loading) {
    return (
      <LoadingState message="Loading orders..." />
    );
  }

  return (
    <PageContainer>
      <PageHeader title="All Orders" />

      {error && (
        <div className="mb-4">
          <Alert message={error} />
        </div>
      )}

      {message && (
        <div
          className="
            mb-8
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface)
            px-4
            py-3
            text-sm
          "
          role="status"
        >
          {message}
        </div>
      )}

      <AdminOrderFilters
        search={search}
        statusFilter={statusFilter}
        deliveryTypeFilter={deliveryTypeFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDeliveryTypeChange={
          setDeliveryTypeFilter
        }
        onClear={() => {
          setSearch("");
          setStatusFilter("");
          setDeliveryTypeFilter("");
        }}
      />

      {orders.length === 0 ? (
        <EmptyState title="No orders found." />
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