import {
  ClipboardList,
  ChefHat,
  Package,
  ShoppingBag,
  Truck,
  PackageCheck,
} from "lucide-react";

import type {
  Order,
  OrderStatusHistory,
} from "../../types/order";

import {
  ORDER_STATUS,
} from "../../constants/order";

interface OrderTrackingProps {
  order: Order;
}

interface TrackingStage {
  status: string;
  label: string;
  icon: typeof ClipboardList;
}

const PICKUP_STAGES: TrackingStage[] = [
  {
    status: ORDER_STATUS.CONFIRMED,
    label: "Confirmed",
    icon: ClipboardList,
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: "Preparing",
    icon: ChefHat,
  },
  {
    status: ORDER_STATUS.READY_FOR_PICKUP,
    label: "Ready for Pickup",
    icon: Package,
  },
  {
    status: ORDER_STATUS.PICKED_UP,
    label: "Picked Up",
    icon: ShoppingBag,
  },
];

const DELIVERY_STAGES: TrackingStage[] = [
  {
    status: ORDER_STATUS.CONFIRMED,
    label: "Confirmed",
    icon: ClipboardList,
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: "Preparing",
    icon: ChefHat,
  },
  {
    status: ORDER_STATUS.OUT_FOR_DELIVERY,
    label: "Out for Delivery",
    icon: Truck,
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: "Delivered",
    icon: PackageCheck,
  },
];

function formatStatusDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function getHistoryTimestamp(
  history: OrderStatusHistory[],
  status: string
): string | null {
  const entry = history.find(
    (item) => item.new_status === status
  );

  return entry?.created_at ?? null;
}

export default function OrderTracking({
  order,
}: OrderTrackingProps) {
  const stages =
    order.delivery_type === "PICKUP"
      ? PICKUP_STAGES
      : DELIVERY_STAGES;

  const currentIndex = stages.findIndex(
    (stage) => stage.status === order.status
  );

  const isCancelled =
    order.status === ORDER_STATUS.CANCELLED;

  const statusUpdatedAt = order.updated_at;

  if (isCancelled) {
    return (
      <section
        className="
          rounded-lg
          border
          border-(--color-border)
          bg-(--color-surface)
          p-5
          sm:p-6
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-(--color-border)
              bg-(--color-background)
              text-(--color-text-muted)
            "
          >
            <ClipboardList
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Order Tracking
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-(--color-text-muted)
              "
            >
              This order was cancelled.
            </p>

            <p
              className="
                mt-3
                text-sm
                text-(--color-text-muted)
              "
            >
              Status updated on{" "}
              {formatStatusDate(statusUpdatedAt)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        rounded-lg
        border
        border-(--color-border)
        bg-(--color-surface)
        p-5
        sm:p-6
      "
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          gap-1
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <h2 className="text-lg font-semibold">
            Order Tracking
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-(--color-text-muted)
            "
          >
            Here's the latest update on your order.
          </p>
        </div>

        <p
          className="
            text-sm
            text-(--color-text-muted)
          "
        >
          Status updated on{" "}
          {formatStatusDate(statusUpdatedAt)}
        </p>
      </div>

      {/* Desktop tracking */}
      <div className="mt-8 hidden sm:block">
        <div className="grid grid-cols-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;

            const isCurrent =
              index === currentIndex;

            const isPast =
              index < currentIndex;

            const timestamp =
              getHistoryTimestamp(
                order.status_history,
                stage.status
              );

            const isLast =
              index === stages.length - 1;

            return (
              <div
                key={stage.status}
                className="relative"
              >
                {/* Horizontal connector */}
                {!isLast && (
                  <div
                    className={`
                      pointer-events-none
                      absolute
                      top-6
                      left-[calc(50%+24px)]
                      right-[calc(-50%+24px)]
                      z-0
                      h-px
                      ${
                        isPast
                          ? "bg-(--color-text)"
                          : "bg-(--color-border)"
                      }
                    `}
                  />
                )}

                {/* Stage */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    flex-col
                    items-center
                    text-center
                  "
                >
                  {/* Icon */}
                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      bg-(--color-background)
                      transition-all
                      duration-300

                      ${
                        isCurrent
                          ? `
                            border-(--color-text)
                            bg-(--color-text)
                            text-white
                            shadow-sm
                          `
                          : isPast
                          ? `
                            border-(--color-border)
                            text-(--color-text-muted)
                            opacity-55
                          `
                          : `
                            border-(--color-border)
                            text-(--color-text-muted)
                            opacity-35
                          `
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isCurrent ? 2 : 1.6}
                    />
                  </div>

                  {/* Details */}
                  <p
                    className={`
                      mt-3
                      text-sm
                      ${
                        isCurrent
                          ? "font-semibold text-(--color-text)"
                          : "font-medium text-(--color-text-muted)"
                      }
                      ${
                        !isCurrent
                          ? "opacity-65"
                          : ""
                      }
                    `}
                  >
                    {stage.label}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      text-(--color-text-muted)
                      ${
                        isCurrent
                          ? "opacity-100"
                          : "opacity-45"
                      }
                    `}
                  >
                    {timestamp
                      ? formatStatusDate(timestamp)
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile tracking */}
      <div className="mt-8 sm:hidden">
        <div className="relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;

            const isCurrent =
              index === currentIndex;

            const isPast =
              index < currentIndex;

            const timestamp =
              getHistoryTimestamp(
                order.status_history,
                stage.status
              );

            const isLast =
              index === stages.length - 1;

            return (
              <div
                key={stage.status}
                className="
                  relative
                  flex
                  min-h-20
                "
              >
                {/* Vertical connector */}
                {!isLast && (
                  <div
                    className="
                      absolute
                      left-6
                      top-12
                      bottom-0
                      w-px
                    "
                  >
                    <div
                      className={`
                        h-full
                        w-px
                        ${
                          isPast
                            ? "bg-(--color-text)"
                            : "bg-(--color-border)"
                        }
                      `}
                    />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                    relative
                    z-10
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    bg-(--color-background)
                    transition-all
                    duration-300

                    ${
                      isCurrent
                        ? `
                          border-(--color-text)
                          bg-(--color-text)
                          text-white
                          shadow-sm
                        `
                        : isPast
                        ? `
                          border-(--color-border)
                          text-(--color-text-muted)
                          opacity-55
                        `
                        : `
                          border-(--color-border)
                          text-(--color-text-muted)
                          opacity-35
                        `
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={
                      isCurrent ? 2 : 1.6
                    }
                  />
                </div>

                {/* Details */}
                <div className="ml-4 pt-1">
                  <p
                    className={`
                      text-sm
                      ${
                        isCurrent
                          ? "font-semibold text-(--color-text)"
                          : "font-medium text-(--color-text-muted)"
                      }
                      ${
                        !isCurrent
                          ? "opacity-65"
                          : ""
                      }
                    `}
                  >
                    {stage.label}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      text-(--color-text-muted)
                      ${
                        isCurrent
                          ? "opacity-100"
                          : "opacity-45"
                      }
                    `}
                  >
                    {timestamp
                      ? formatStatusDate(timestamp)
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}