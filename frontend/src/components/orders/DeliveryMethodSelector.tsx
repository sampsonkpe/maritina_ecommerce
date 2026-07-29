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
    <div className="rounded-md border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Delivery method</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            onDeliveryTypeChange(DELIVERY_TYPE.DELIVERY)
          }
          className={`rounded-md border p-4 text-left ${
            deliveryType === DELIVERY_TYPE.DELIVERY
              ? "border-black bg-gray-50"
              : ""
          }`}
        >
          <span className="block font-medium">Delivery</span>
          <span className="mt-1 block text-sm text-gray-600">
            Deliver to my address
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onDeliveryTypeChange(DELIVERY_TYPE.PICKUP)
          }
          className={`rounded-md border p-4 text-left ${
            deliveryType === DELIVERY_TYPE.PICKUP
              ? "border-black bg-gray-50"
              : ""
          }`}
        >
          <span className="block font-medium">Pickup</span>
          <span className="mt-1 block text-sm text-gray-600">
            I will pick up my order
          </span>
        </button>
      </div>
    </div>
  );
}