import {
  DELIVERY_TYPE,
  ORDER_STATUS_OPTIONS,
} from "../../constants/order";

import Button from "../common/Button";
import Select from "../common/Select";

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
    <div className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      {/* Search */}
      <input
        aria-label="Search orders"
        type="text"
        placeholder="Search by customer name, email, phone or order ID..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="
          min-w-0
          rounded-2xl
          border
          border-(--color-border)
          bg-(--color-surface)
          px-4
          py-3
          text-sm
          outline-none
          transition-colors
          focus:border-(--color-text)
        "
      />

      {/* Status */}
      <Select
        aria-label="Filter by order status"
        value={statusFilter}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
      >
        <option value="">All Statuses</option>

        {ORDER_STATUS_OPTIONS.map((status) => (
          <option
            key={status.value}
            value={status.value}
          >
            {status.label}
          </option>
        ))}
      </Select>

      {/* Delivery Type */}
      <Select
        aria-label="Filter by delivery type"
        value={deliveryTypeFilter}
        onChange={(e) =>
          onDeliveryTypeChange(e.target.value)
        }
      >
        <option value="">All Delivery Types</option>

        <option value={DELIVERY_TYPE.DELIVERY}>
          Delivery
        </option>

        <option value={DELIVERY_TYPE.PICKUP}>
          Pickup
        </option>
      </Select>

      {/* Clear */}
      <Button
        type="button"
        variant="secondary"
        onClick={onClear}
        rounded="2xl"
      >
        Clear Filters
      </Button>
    </div>
  );
}