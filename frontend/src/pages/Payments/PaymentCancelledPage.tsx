import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";

export default function PaymentCancelledPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-3xl font-semibold">
          Payment cancelled
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment was cancelled. Your order
          has not been confirmed and your cart is
          still available.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              navigate("/checkout")
            }
            className="rounded-md bg-black px-6 py-3 text-white"
          >
            Return to Checkout
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            className="rounded-md border px-6 py-3"
          >
            View Cart
          </button>
        </div>
      </div>
    </PageContainer>
  );
}