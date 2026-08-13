import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import Button from "../../components/common/Button";

export default function PaymentCancelledPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-3xl font-semibold">
          Payment cancelled
        </h1>

       <p className="mt-3 text-(--color-text-muted)">
          Your payment was cancelled. Your order
          has not been confirmed, however your cart is
          still available.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
                type="button"
                onClick={() =>
                navigate("/checkout")
                }
            >
                Return to Checkout
            </Button>

            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                navigate("/cart")
                }
            >
                View Cart
            </Button>
            </div>
      </div>
    </PageContainer>
  );
}