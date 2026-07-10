import {
  DELIVERY_TYPE,
  ORDER_STATUS_OPTIONS,
} from "../../constants/order";

interface AdminOrderFiltersProps {
  search: string;
  statusFilter: string;
  deliveryTypeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDeliveryTypeChange: (value: string) => void;
  onClear: () => void;
}

export default function AdminOrderFilters({
  search,
  statusFilter,
  deliveryTypeFilter,
  onSearchChange,
  onStatusChange,
  onDeliveryTypeChange,
  onClear,
}: AdminOrderFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row">

      <input
        type="text"
        placeholder="Search by customer name, email, phone or order ID..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="flex-1 rounded-lg border px-4 py-3"
      />

      <select
        value={statusFilter}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">
          All Statuses
        </option>

        {ORDER_STATUS_OPTIONS.map((status) => (
          <option
            key={status.value}
            value={status.value}
          >
            {status.label}
          </option>
        ))}
      </select>

      <select
        value={deliveryTypeFilter}
        onChange={(e) =>
          onDeliveryTypeChange(e.target.value)
        }
        className="rounded-lg border px-4 py-3"
      >
        <option value="">
          All Delivery Types
        </option>

        <option value={DELIVERY_TYPE.DELIVERY}>
          Delivery
        </option>

        <option value={DELIVERY_TYPE.PICKUP}>
          Pickup
        </option>
      </select>

      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border px-5 py-3 transition hover:bg-gray-100"
      >
        Clear Filters
      </button>

    </div>
  );
}