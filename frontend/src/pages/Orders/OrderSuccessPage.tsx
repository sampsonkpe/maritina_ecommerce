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

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

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
    order.user_email
      ? "Customer"
      : order.guest_full_name
          ?.trim()
          .split(/\s+/)[0] || "Customer";

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl py-16">

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

        <div className="mt-8 rounded-lg border p-6">

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Order Number :
            </span>

            <span className="font-medium">
              #{order.id}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500">
              Payment Status :
            </span>

            <span className="font-medium capitalize">
              {order.payment_status}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500">
              Fulfilment Status
            </span>

            <span className="font-medium capitalize">
              {order.status.replace(
                /_/g,
                " "
              )}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
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

        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          We'll keep you updated as your
          order progresses.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          <Link
            to="/orders"
            className="
              rounded-md
              bg-black
              px-6
              py-3
              text-center
              text-white
            "
          >
            View Orders
          </Link>

          <Link
            to="/products"
            className="
              rounded-md
              border
              px-6
              py-3
              text-center
            "
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </PageContainer>
  );
}