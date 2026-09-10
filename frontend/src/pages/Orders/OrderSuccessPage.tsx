import { useEffect, useState } from "react";
import {
  ArrowRight,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import { useAuth } from "../../context/AuthContext";

import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

import LoadingState from "../../components/common/LoadingState";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { user, authenticated } =
    useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError(
          "No order was specified."
        );

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
        console.error(
          "Failed to load order:",
          error
        );

        setError(
          "We couldn't find this order."
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
        message="Loading your order..."
      />
    );
  }

  if (error || !order) {
    return (
      <>
        {/* Page intro */}
        <section className="border-b border-(--color-border)">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
                Your Order Confirmation
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Something went wrong.
              </h1>

              <p className="mt-3 text-base leading-7 text-(--color-text-muted) sm:text-lg">
                {error ||
                  "We couldn't find this order."}
              </p>
            </div>
          </div>
        </section>

        {/* Error action */}
        <section>
          <div
            className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">
            <div className="text-center">
              <button
                type="button"
                onClick={() =>
                  navigate("/orders")
                }
                className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)">
                View Orders

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"/>
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const firstName =
    user?.full_name
      ?.trim()
      .split(/\s+/)[0] ||
    order.guest_full_name
      ?.trim()
      .split(/\s+/)[0] ||
    "Customer";

  const isDelivery =
    order.delivery_type === "DELIVERY";

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">

            {/* Success indicator */}
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your Order Confirmation
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Order placed successfully!
            </h1>

            <p
              className=" mx-auto mt-3 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Thank you,{" "}
              <span className="font-medium text-(--color-text)">
                {firstName}
              </span>
              . Your order has been received.
            </p>
          </div>
        </div>
      </section>

      {/* Order confirmation */}
      <section>
        <div
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl">

            {/* Order details */}
            <div
              className="rounded-3xl border border-(--color-border) p-6 sm:p-8">
              <div className="mb-2">
                <p className="text-sm text-center font-medium uppercase tracking-[0.2em] text-(--color-text-muted)">
                  Order Details
                </p>

                <p className="mt-2 text-2xl text-center font-semibold tracking-tight">
                  Order #{order.id}
                </p>
              </div>

              <div className="divide-y divide-(--color-border)">

                {/* Order type */}
                <div
                  className="flex items-center justify-between gap-6 py-4">
                  <span className="text-sm text-(--color-text-muted)">
                    Order Type
                  </span>

                  <span className="text-sm font-medium">
                    {isDelivery
                      ? "Delivery"
                      : "Pickup"}
                  </span>
                </div>

                {/* Payment */}
                <div
                  className="flex items-center justify-between gap-6 py-4">
                  <span className="text-sm text-(--color-text-muted)">
                    Payment Method
                  </span>

                  <span className="text-sm font-medium">
                    {order.payment_method ||
                      "Paystack"}
                  </span>
                </div>

                {/* Total */}
                <div
                  className="
                    flex items-center justify-between gap-6 py-4">
                  <span className="text-sm text-(--color-text-muted)">
                    Total Amount
                  </span>

                  <span className="text-lg font-semibold">
                    {formatCurrency(
                      order.total_amount
                    )}
                  </span>
                </div>

                {/* Date */}
                <div
                  className="flex items-start justify-between gap-6 py-4">
                  <span className="text-sm text-(--color-text-muted)">
                    Order Placed
                  </span>

                  <time
                    dateTime={
                      order.created_at
                    }
                    className="text-right text-sm font-medium">
                    {formatDate(
                      order.created_at
                    )}
                  </time>
                </div>

              </div>
            </div>

            {/* Delivery information */}
            {isDelivery &&
              order.address_text && (
                <div
                  className="mt-4 rounded-3xl border border-(--color-border) p-6 sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-text-muted)">
                    Delivery Address
                  </p>

                  <p className="mt-3 text-base leading-7">
                    {order.address_text}
                  </p>
                </div>
              )}

            {/* Actions */}
            <div
              className={`mt-8 grid gap-3
                ${
                  authenticated
                    ? "sm:grid-cols-2"
                    : ""
                }
              `}
            >
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-(--color-border) bg-(--color-text) px-6 py-3 text-sm font-medium text-(--color-background) transition-opacity hover:opacity-85">
                Continue Shopping

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"/>
              </Link>

              {authenticated && (
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)">
                  View Orders
                </Link>
              )}
            </div>

            {/* Message */}
            <p className="mt-8 text-center text-sm leading-6 text-(--color-text-muted)">
              We'll keep you updated as your order progresses.
            </p>

          </div>
        </div>
      </section>
    </>
  );
}