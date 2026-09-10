import {
  DELIVERY_TYPE,
  type DeliveryType,
} from "../../constants/order";

interface DeliveryMethodSelectorProps {
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (type: DeliveryType) => void;
}

export default function DeliveryMethodSelector({
  deliveryType,
  onDeliveryTypeChange,
}: DeliveryMethodSelectorProps) {
  return (
    <section className="rounded-2xl border border-(--color-border) p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Delivery method
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={
            deliveryType === DELIVERY_TYPE.DELIVERY
          }
          onClick={() =>
            onDeliveryTypeChange(
              DELIVERY_TYPE.DELIVERY
            )
          }
          className={`
            rounded-xl
            border
            p-4
            text-left
            transition-colors
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-(--color-text)
            focus-visible:ring-offset-2
            ${
              deliveryType ===
              DELIVERY_TYPE.DELIVERY
                ? "border-(--color-text) bg-(--color-surface-muted)"
                : "border-(--color-border) hover:bg-(--color-surface-muted)"
            }
          `}
        >
          <span className="block text-base font-semibold tracking-tight">
            Delivery
          </span>

          <span className="mt-1 block text-sm text-(--color-text-muted)">
            Deliver to my address
          </span>
        </button>

        <button
          type="button"
          aria-pressed={
            deliveryType === DELIVERY_TYPE.PICKUP
          }
          onClick={() =>
            onDeliveryTypeChange(
              DELIVERY_TYPE.PICKUP
            )
          }
          className={`
            rounded-xl
            border
            p-4
            text-left
            transition-colors
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-(--color-text)
            focus-visible:ring-offset-2
            ${
              deliveryType ===
              DELIVERY_TYPE.PICKUP
                ? "border-(--color-text) bg-(--color-surface-muted)"
                : "border-(--color-border) hover:bg-(--color-surface-muted)"
            }
          `}
        >
          <span className="block text-base font-semibold tracking-tight">
            Pickup
          </span>

          <span className="mt-1 block text-sm text-(--color-text-muted)">
            I will pick up my order
          </span>
        </button>
      </div>
    </section>
  );
}