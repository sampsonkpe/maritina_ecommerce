import { Link, useLocation } from "react-router-dom";

import type { Order } from "../../types/order";

interface OrderSuccessState {
  order: Order;
  firstName: string;
}

export default function OrderSuccessPage() {
  const location = useLocation();

  const state =
    location.state as
      | OrderSuccessState
      | null;

  if (!state?.order) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">
          Order confirmation unavailable
        </h1>

        <p className="mt-3 text-gray-600">
          We couldn't find the order details
          for this confirmation.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-block rounded-md bg-black px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const { order, firstName } = state;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="text-center">

        <h1 className="mt-6 text-3xl font-semibold">
          Order placed successfully.
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you, <b>{firstName}</b>. Your order
          has been received.
        </p>

        <div className="mt-8 rounded-lg border p-6 text-left">

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Order
            </span>

            <span className="font-medium">
              #{order.id}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500">
              Total
            </span>

            <span className="text-lg font-semibold">
              GH₵
              {Number(
                order.total_amount
              ).toFixed(2)}
            </span>
          </div>

        </div>

        <p className="mt-6 text-sm text-gray-500">
          We'll keep you updated as your
          order progresses.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          <Link
            to="/orders"
            className="rounded-md bg-black px-6 py-3 text-center text-white"
          >
            View Orders
          </Link>

          <Link
            to="/products"
            className="rounded-md border px-6 py-3 text-center"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    </div>
  );
}