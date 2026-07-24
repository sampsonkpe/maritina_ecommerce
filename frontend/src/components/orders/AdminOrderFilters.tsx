import {
  DELIVERY_TYPE,
  ORDER_STATUS_OPTIONS,
} from "../../constants/order";

import Button from "../common/Button";

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
        aria-label="Search orders"
        type="text"
        placeholder="Search by customer name, email, phone or order ID..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="flex-1 rounded-md border px-4 py-3"
      />

      <select
        aria-label="Filter by order status"
        value={statusFilter}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
        className="rounded-md border px-4 py-3"
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
        aria-label="Filter by delivery type"
        value={deliveryTypeFilter}
        onChange={(e) =>
          onDeliveryTypeChange(e.target.value)
        }
        className="rounded-md border px-4 py-3"
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

      <Button
        type="button"
        variant="secondary"
        onClick={onClear}
      >
        Clear Filters
      </Button>

    </div>
  );
}