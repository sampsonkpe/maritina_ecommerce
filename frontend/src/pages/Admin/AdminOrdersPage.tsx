import { useEffect, useState, useCallback } from "react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import PageContainer from "../../components/common/PageContainer";

import OrderHeader from "../../components/orders/OrderHeader";
import AdminOrderFilters from "../../components/orders/AdminOrderFilters";
import AdminOrderDetails from "../../components/orders/AdminOrderDetails";

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [initialLoad, setInitialLoad] =
    useState(true);

  const [expandedOrders, setExpandedOrders] =
    useState<number[]>([]);

  const [selectedStatuses, setSelectedStatuses] =
  useState<Record<number, string>>({});

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

  const loadOrders = useCallback(async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }

      const data =
        await orderService.getAdminOrders({
          status: statusFilter,
          deliveryType:
            deliveryTypeFilter,
          search: debouncedSearch,
        });

      setOrders(data);

      const initialStatuses:
        Record<number, string> = {};

      data.forEach((order: Order) => {
        initialStatuses[order.id] =
          order.status;
      });

      setSelectedStatuses(
        initialStatuses
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [
    statusFilter,
    deliveryTypeFilter,
    debouncedSearch,
  ]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    try {

  const newStatus =
    selectedStatuses[orderId];

  const currentOrder = orders.find(
    (order) => order.id === orderId
  );

  if (
    !currentOrder ||
    currentOrder.status === newStatus
  ) {
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
      alert("Failed to update status.");
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
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              {/* HEADER */}

              <OrderHeader
                order={order}
                showCustomer
                expanded={expandedOrders.includes(order.id)}
                onToggle={() => toggleOrder(order.id)}
              />

              {/* EXPANDED CONTENT */}

              {expandedOrders.includes(order.id) && (
                <AdminOrderDetails
                  order={order}
                  selectedStatus={
                    selectedStatuses[order.id] ??
                    order.status
                  }
                  updating={updatingOrders.includes(order.id)}
                  onStatusChange={(status) =>
                    setSelectedStatuses((current) => ({
                      ...current,
                      [order.id]: status,
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