import { useEffect, useState } from "react";
import {
  ArrowRight,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { paymentService } from "../../services/paymentService";

import LoadingState from "../../components/common/LoadingState";

import { useCart } from "../../context/CartContext";

export default function PaymentReturnPage() {
  const [searchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const { refreshCart } = useCart();

  const [error, setError] =
    useState("");

  useEffect(() => {
    const verify = async () => {
      const reference =
        searchParams.get("reference");

      if (!reference) {
        setError(
          "No payment reference was provided. Kindly contact Support if you were charged."
        );

        return;
      }

      try {
        const response =
          await paymentService.verifyPayment(
            reference
          );

        if (
          response.data.status !== true
        ) {
          setError(
            response.data.message ||
              "We couldn't confirm your payment. Kindly contact Support if you were charged."
          );

          return;
        }

        const order =
          response.order;

        if (!order) {
          setError(
            "Payment was confirmed, but the order could not be created."
          );

          return;
        }

        // Synchronise the frontend cart with
        // the cart that the backend has just cleared.
        await refreshCart();

        navigate(
          `/order-success/${order.id}`,
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Payment verification failed:",
          error
        );

        setError(
          "We couldn't verify your payment. If you were charged, please contact Support."
        );
      }
    };

    verify();
  }, [
    navigate,
    refreshCart,
    searchParams,
  ]);

  if (error) {
    return (
      <>
        {/* Page intro */}
        <section className="border-b border-(--color-border)">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
                Payment verification
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                We couldn't confirm your payment.
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
                {error}
              </p>

              {/* Action */}
              <div className="mx-auto mt-8 max-w-2xl">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/orders")
                  }
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-(--color-border) bg-(--color-text) px-6 py-3 text-sm font-medium text-(--color-background) transition-opacity hover:opacity-85"
                >
                  View Orders

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <LoadingState
      message="Confirming your payment..."
    />
  );
}