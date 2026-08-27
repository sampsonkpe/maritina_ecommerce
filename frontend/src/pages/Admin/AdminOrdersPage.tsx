import { useEffect, useState } from "react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import PageContainer from "../../components/common/PageContainer";
import Alert from "../../components/common/Alert";

import OrderHeader from "../../components/orders/OrderHeader";
import AdminOrderFilters from "../../components/orders/AdminOrderFilters";
import AdminOrderDetails from "../../components/orders/AdminOrderDetails";

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [expandedOrders, setExpandedOrders] =
    useState<number[]>([]);

  const [selectedStatuses, setSelectedStatuses] =
  useState<Record<number, Order["status"]>>({});

  const [updatingOrders, setUpdatingOrders] =
    useState<number[]>([]);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [
    deliveryTypeFilter,
    setDeliveryTypeFilter,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState(search);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setDebouncedSearch(search);
      }, 500);

      return () => clearTimeout(timeout);
    }, [search]);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await orderService.getAdminOrders({
            status: statusFilter,
            deliveryType: deliveryTypeFilter,
            search: debouncedSearch,
          });

        if (cancelled) {
          return;
        }

        setOrders(data);

        const initialStatuses: Record<number, Order["status"]> = {};

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

  const toggleOrder = (id: number) => {
    setExpandedOrders((current) =>
      current.includes(id)
        ? current.filter(
            (orderId) =>
              orderId !== id
          )
        : [...current, id]
    );
  };

  const handleUpdateStatus = async (
    orderId: number
  ) => {
    setError("");

    try {
      const newStatus =
        selectedStatuses[orderId];

      const currentOrder = orders.find(
        (order) => order.id === orderId
      );

      if (!currentOrder || !newStatus) {
        return;
      }

      if (currentOrder.status === newStatus) {
        return;
      }

      setUpdatingOrders((current) => [
        ...current,
        orderId,
      ]);

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
    } catch (error) {
      console.error(error);
      setError("Failed to update order status.");
    } finally {
      setUpdatingOrders((current) =>
        current.filter(
          (id) => id !== orderId
        )
      );
    }
  };


  if (loading) {
    return (
      <LoadingState
        message="Loading orders..."
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader title="All Orders" />
      {error && <Alert message={error} />}

      <AdminOrderFilters
          search={search}
          statusFilter={statusFilter}
          deliveryTypeFilter={deliveryTypeFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          onDeliveryTypeChange={setDeliveryTypeFilter}
          onClear={() => {
            setSearch("");
            setStatusFilter("");
            setDeliveryTypeFilter("");
          }}
        />

        {orders.length === 0 ? (
          <EmptyState title="No orders found." />
        ) : (
        <div className="space-y-5">
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
                showCustomer
                expanded={expandedOrders.includes(order.id)}
                onToggle={() =>
                  toggleOrder(order.id)
                }
              />

              {expandedOrders.includes(order.id) && (
                <AdminOrderDetails
                  order={order}
                  selectedStatus={
                    selectedStatuses[order.id] ??
                    order.status
                  }
                  updating={updatingOrders.includes(
                    order.id
                  )}
                  onStatusChange={(status) =>
                    setSelectedStatuses((current) => ({
                      ...current,
                      [order.id]: status as Order["status"],
                    }))
                  }
                  onUpdate={() =>
                    handleUpdateStatus(order.id)
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}