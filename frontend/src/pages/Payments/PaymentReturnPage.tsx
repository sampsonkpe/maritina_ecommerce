import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { paymentService } from "../../services/paymentService";

import LoadingState from "../../components/common/LoadingState";
import PageContainer from "../../components/common/PageContainer";

import { useAuth } from "../../context/AuthContext";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setError(
          "No payment reference was provided."
        );

        return;
      }

      try {
        const response =
          await paymentService.verifyPayment(
            reference
          );

        if (response.data.status !== true) {
          setError(
            response.data.message ||
            "We couldn't confirm your payment."
          );

          return;
        }

        const order = response.order;

        if (!order) {
          setError(
            "Payment was confirmed, but the order could not be created."
          );

          return;
        }

        const firstName =
          user?.full_name
              ?.trim()
              .split(/\s+/)[0]
          || order.guest_full_name
              ?.trim()
              .split(/\s+/)[0]
          || "Customer";

        navigate("/order-success", {
          replace: true,
          state: {
            order,
            firstName,
          },
        });

      } catch (error) {
        console.error(
          "Payment verification failed:",
          error
        );

        setError(
          "We couldn't verify your payment. "
          + "If you were charged, please contact Support."
        );
      }
    };

    verify();
  }, [
    navigate,
    searchParams,
    user,
  ]);

  if (error) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-xl py-16 text-center">
          <h1 className="text-2xl font-semibold">
            Payment verification failed
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
            className="mt-8 rounded-md bg-black px-6 py-3 text-white"
          >
            View Orders
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <LoadingState
      message="Confirming your payment..."
    />
  );
}