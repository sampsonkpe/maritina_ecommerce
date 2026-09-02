import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import PageContainer from "../../components/common/PageContainer";
import LoadingState from "../../components/common/LoadingState";
import Alert from "../../components/common/Alert";

import OrderItemsList from "../../components/orders/OrderItemsList";
import OrderSummary from "../../components/orders/OrderSummary";
import OrderTracking from "../../components/orders/OrderTracking";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{
    orderId: string;
  }>();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      try {
        const data =
          await orderService.getOrder(
            Number(orderId)
          );

        setOrder(data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <LoadingState
        message="Loading order..."
      />
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <Alert
          message={
            error || "Order not found."
          }
        />

        <Link
          to="/orders"
          className="
            mt-6
            inline-block
            text-sm
            font-medium
            underline
            underline-offset-4
          "
        >
          Back to Orders
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          to="/orders"
          className="
            mb-8
            inline-flex
            items-center
            text-sm
            text-(--color-muted)
            transition-colors
            hover:text-(--color-text)
          "
        >
            Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm
                  text-(--color-muted)
                "
              >
                {order.delivery_type_display}
              </p>

              <h1
                className="
                  mt-1
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-(--color-text)
                "
              >
                Order #{order.id}
              </h1>
            </div>

          </div>
        </div>

        {/* Tracking */}
        <div className="mt-8">
            <OrderTracking order={order} />
        </div>

        {/* Items */}
        <section className="mt-10">
          <h2
            className="
              mb-4
              text-lg
              font-medium
              text-(--color-text)
            "
          >
            Items
          </h2>

          <div
            className="
              rounded-md
              border
              border-(--color-border)
              bg-(--color-surface)
              p-5
            "
          >
            <OrderItemsList
              items={order.items}
            />
          </div>
        </section>

        {/* Summary */}
        <section className="mt-8">
          <OrderSummary
            subtotal={order.subtotal}
            deliveryFee={order.delivery_fee}
            total={order.total_amount}
            refundedAmount={order.refunded_amount}
            refundStatus={order.refund_status}
          />
        </section>

        {/* Delivery / pickup information */}
          <section
            className="
              mt-8
              rounded-md
              border
              border-(--color-border)
              bg-(--color-surface)
              p-5
            "
          >
            <h2
              className="
                text-lg
                font-medium
                text-(--color-text)
              "
            >
              {order.delivery_type === "DELIVERY"
                ? "Delivery"
                : "Pickup"}
            </h2>

            {order.delivery_type === "DELIVERY" && (
              <>
                <p
                  className="
                    mt-3
                    text-sm
                    text-(--color-text-muted)
                  "
                >
                  {order.status === "PENDING"
                    ? "Your order is being processed."
                    : order.status === "CONFIRMED"
                      ? "Your order has been confirmed and will be prepared shortly."
                      : order.status === "PREPARING"
                        ? "Your order is being prepared."
                        : order.status === "OUT_FOR_DELIVERY"
                          ? "Your order is on its way to you."
                          : order.status === "DELIVERED"
                            ? "Your order has been delivered to:"
                            : order.status === "CANCELLED"
                              ? "Your order has been cancelled."
                              : "Your order is being processed."}
                </p>

                {order.address_text && (
                  <div>
                    <p
                      className="
                        mt-2
                        text-sm
                        font-semibold
                        text-(--color-text-muted)
                      "
                    >
                      {order.address_text}
                    </p>
                  </div>
                )}
              </>
            )}

            {order.delivery_type === "PICKUP" && (
              <p
                className="
                  mt-3
                  text-sm
                  text-(--color-text-muted)
                "
              >
                {order.status === "READY_FOR_PICKUP"
                  ? "Your order is ready for pickup."
                  : order.status === "PICKED_UP"
                    ? "Your order has been picked up."
                    : order.status === "CANCELLED"
                      ? "Your order has been cancelled."
                      : 'Your order will be ready for collection once it reaches "Ready for Pickup".'}
              </p>
            )}
          </section>
      </div>
    </PageContainer>
  );
}