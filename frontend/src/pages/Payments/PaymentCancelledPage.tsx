import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancelledPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Payment cancelled
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Your payment was cancelled.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Your order has not been confirmed, however your cart is still available.
            </p>

            {/* Actions */}
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-(--color-border) bg-(--color-text) px-6 py-3 text-sm font-medium text-(--color-background) transition-opacity hover:opacity-85"
              >
                Return to Checkout

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}