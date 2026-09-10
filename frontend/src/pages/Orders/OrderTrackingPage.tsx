import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import PageContainer from "../../components/common/PageContainer";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import Alert from "../../components/common/Alert";
import SectionTitle from "../../components/common/SectionTitle";
import Button from "../../components/common/Button";

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
    let cancelled = false;

    const loadOrder = async () => {
      if (!orderId) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      const parsedOrderId = Number(orderId);

      if (!Number.isInteger(parsedOrderId)) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          await orderService.getOrder(
            parsedOrderId
          );

        if (cancelled) {
          return;
        }

        setOrder(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setError(
          "Failed to load order."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
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
        <div className="mx-auto max-w-3xl">
          <Alert
            message={
              error || "Order not found."
            }
          />

          <Button
            to="/orders"
            variant="secondary"
            rounded="full"
            className="mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Back to Orders
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Button
          to="/orders"
          variant="secondary"
          rounded="full"
          className="mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          Back to Orders
        </Button>

        {/* Page Header */}
        <PageHeader
          title={`Order #${order.id}`}
        />

        {/* Tracking */}
        <section>
          <OrderTracking order={order} />
        </section>

        {/* Items */}
        <section className="mt-10">
          <SectionTitle>
            Items
          </SectionTitle>

          <div
            className="
              mt-4
              rounded-3xl
              border
              border-(--color-border)
              bg-(--color-surface)
              p-5
              sm:p-6
            "
          >
            <OrderItemsList
              items={order.items}
            />
          </div>
        </section>

        {/* Summary */}
        <section className="mt-8">
          <SectionTitle>
            Order Summary
          </SectionTitle>

          <div className="mt-4">
            <OrderSummary
              subtotal={order.subtotal}
              deliveryFee={order.delivery_fee}
              total={order.total_amount}
              refundedAmount={
                order.refunded_amount
              }
              refundStatus={
                order.refund_status
              }
            />
          </div>
        </section>

        {/* Fulfilment */}
        <section className="mt-8">
          <SectionTitle>
            {order.delivery_type === "DELIVERY"
              ? "Delivery Status"
              : "Pickup Status"}
          </SectionTitle>

          <div
            className="
              mt-4
              rounded-3xl
              border
              border-(--color-border)
              bg-(--color-surface)
              p-5
              sm:p-6
            "
          >
            {order.delivery_type === "DELIVERY" ? (
              <>
                {order.address_text && (
                  <p
                    className="
                      text-sm
                      text-(--color-text-muted)
                    "
                  >
                    {order.status === "DELIVERED"
                      ? "Delivered to: "
                      : "Delivery to: "}

                    <span className="font-medium text-(--color-text)">
                      {order.address_text}
                    </span>
                  </p>
                )}

                {!order.address_text && (
                  <p
                    className="
                      mt-3
                      text-sm
                      text-(--color-text-muted)
                    "
                  >
                    Delivery address unavailable.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-(--color-text-muted)">
                Your order will be ready for
                collection once it reaches
                <span className="font-medium text-(--color-text)"> Ready for Pickup
                  </span>
                .
              </p>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}