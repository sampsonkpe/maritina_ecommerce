import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

import LoadingState from "../../components/common/LoadingState";
import PageContainer from "../../components/common/PageContainer";

import { useAuth } from "../../context/AuthContext";

import { formatDate } from "../../utils/date";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

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
      <PageContainer>
        <div className="mx-auto max-w-xl py-16 text-center">

          <h1 className="text-2xl font-semibold">
            Order confirmation unavailable
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "We couldn't find this order."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
            className="
              mt-8
              rounded-md
              bg-black
              px-6
              py-3
              text-white
            "
          >
            View Orders
          </button>

        </div>
      </PageContainer>
    );
  }

  const firstName =
    user?.full_name
      ?.trim()
      .split(/\s+/)[0]
    || order.guest_full_name
      ?.trim()
      .split(/\s+/)[0]
    || "Customer";

  const isDelivery =
    order.delivery_type === "DELIVERY";

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl py-16">

        {/* Header */}

        <div className="text-center">

          <h1 className="text-3xl font-semibold">
            Order placed successfully.
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you,{" "}
            <b>{firstName}</b>. Your order
            has been received.
          </p>

        </div>

        {/* Order Summary */}

        <div className="mt-8 rounded-lg border p-6">

          {/* Order Number */}

          <div className="flex items-center justify-between gap-6">
            <span className="text-gray-500">
              Order Number :
            </span>

            <span className="font-medium">
              #{order.id}
            </span>
          </div>

          {/* Order Type */}

          <div className="mt-5 flex items-center justify-between gap-6">

            <span className="text-gray-500">
              Order Type :
            </span>

            <span className="font-medium">
              {isDelivery
                ? "Delivery"
                : "Pickup"}
            </span>

          </div>

          {/* Payment Method */}

          <div className="mt-5 flex items-center justify-between gap-6">

            <span className="text-gray-500">
              Payment Method :
            </span>

            <span className="font-medium">
              {order.payment_method ||
                "Paystack"}
            </span>

          </div>

          {/* Total */}

          <div className="mt-5 flex items-center justify-between gap-6">

            <span className="text-gray-500">
              Total Amount :
            </span>

            <span className="text-lg font-semibold">
              GH₵
              {Number(
                order.total_amount
              ).toFixed(2)}
            </span>

          </div>

          {/* Date / Time */}

          <div className="mt-5 flex items-center justify-between gap-6">

            <span className="text-gray-500">
              Order Placed on :
            </span>

            <time
              dateTime={order.created_at}
              className="font-medium text-right"
            >
              {formatDate(
                order.created_at
              )}
            </time>

          </div>

        </div>

        {/* Message */}

        <p className="mt-6 text-center text-sm text-gray-500">
          We'll keep you updated as your
          order progresses.
        </p>

        {/* Actions */}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          <Link
            to="/products"
            className="
              rounded-md
              bg-black
              px-6
              py-3
              text-center
              text-white
            "
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="
              rounded-md
              border
              px-6
              py-3
              text-center
            "
          >
            View Orders
          </Link>

        </div>

      </div>
    </PageContainer>
  );
}