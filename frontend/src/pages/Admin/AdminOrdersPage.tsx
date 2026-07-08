import { useEffect, useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

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

  const formatStatus = (status: string) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700";

      case "PAYMENT_IN_PROGRESS":
        return "bg-orange-100 text-orange-700";

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

  if (loading && orders.length === 0) {
    return (
      <div className="p-8">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        All Orders
      </h1>

    <div className="mb-8 flex flex-col gap-4 md:flex-row">

      <input
        type="text"
        placeholder="Search by customer name, email, phone or order ID, ...."
        value={search}
        onChange={(e) =>
          setSearch((e.target as HTMLInputElement).value)
        }
        className="flex-1 rounded-lg border px-4 py-3"
      />

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">
          All Statuses
        </option>

        <option value="PENDING">
          Pending
        </option>

        <option value="PAYMENT_IN_PROGRESS">
          Payment In Progress
        </option>

        <option value="PAID">
          Paid
        </option>

        <option value="PREPARING">
          Preparing
        </option>

        <option value="OUT_FOR_DELIVERY">
          Out For Delivery
        </option>

        <option value="DELIVERED">
          Delivered
        </option>

      </select>

      <select
        value={deliveryTypeFilter}
        onChange={(e) =>
          setDeliveryTypeFilter(e.target.value)
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">
          All Delivery Types
        </option>

        <option value="DELIVERY">
          Delivery
        </option>

        <option value="PICKUP">
          Pickup
        </option>

      </select>

      <button
        type="button"
        onClick={() => {
          setSearch("");
          setStatusFilter("");
          setDeliveryTypeFilter("");
        }}
        className="rounded-lg border px-5 py-3 transition hover:bg-gray-100"
      >
        Clear Filters
      </button>

    </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
          No orders found.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              {/* HEADER */}

              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                {/* LEFT */}

                <div>
                  <h2 className="text-2xl font-semibold">
                    Order #{order.id}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {order.user_email}
                  </p>

                  <p className="mt-3 text-gray-900">
                    {
                      order.delivery_type_display
                    }
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                {/* RIGHT */}

                <div className="flex flex-col items-start gap-4 md:items-end">

                  <span
                    className={`rounded-lg px-4 py-1 text-sm font-medium ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                  <div className="flex items-center gap-4 pr-4">

                    <p className="text-3xl font-bold">
                      GH₵
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        toggleOrder(
                          order.id
                        )
                      }
                      className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                    >
                      {expandedOrders.includes(
                        order.id
                      ) ? (
                        <ChevronUp
                          size={22}
                        />
                      ) : (
                        <ChevronDown
                          size={22}
                        />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              {/* EXPANDED CONTENT */}

              {expandedOrders.includes(order.id) && (
                <div className="mt-6 border-t pt-6">

                  <div>
                    <h3 className="font-semibold">
                      Delivery Address
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {order.address_text ??
                        "Pickup Order"}
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold">
                      Items ({order.items.length})
                    </h3>

                    <div className="mt-4 space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border bg-gray-50 p-4"
                        >
                          <p className="font-medium">
                            {item.product_name}
                          </p>

                          <div className="mt-1 flex items-center justify-between text-sm text-gray-600">

                            <span>
                              {item.variant_name || "Standard"}
                            </span>

                            <span>
                              ×{item.quantity}
                            </span>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-6">

                    <h3 className="mb-4 font-semibold">
                      Order Status
                    </h3>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                      {order.status === "DELIVERED" ? (
                        <div className="rounded-lg border bg-green-50 px-4 py-3 font-medium text-green-700 opacity-50">
                          Delivered
                        </div>
                      ) : (
                        <>
                          <select
                            value={
                              selectedStatuses[order.id] ??
                              order.status
                            }
                            onChange={(e) =>
                              setSelectedStatuses((current) => ({
                                ...current,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="rounded-lg border px-4 py-3"
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="PAYMENT_IN_PROGRESS">
                              Payment In Progress
                            </option>

                            <option value="PAID">
                              Paid
                            </option>

                            <option value="PREPARING">
                              Preparing
                            </option>

                            <option value="OUT_FOR_DELIVERY">
                              Out for Delivery
                            </option>

                            <option value="DELIVERED">
                              Delivered
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(order.id)
                            }
                            disabled={
                              updatingOrders.includes(order.id)
                            }
                            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingOrders.includes(order.id)
                              ? "Updating..."
                              : "Update Status"}
                          </button>
                        </>
                      )}

                    </div>

                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}