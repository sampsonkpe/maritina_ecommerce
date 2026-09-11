import {
  ClipboardList,
  ChefHat,
  Package,
  ShoppingBag,
  Truck,
  PackageCheck,
  XCircle,
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

  const isCompleted =
    currentIndex === stages.length - 1;

  return (
    <section
      className="
        rounded-3xl
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
          text-center
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:text-left
        "
      >
        <h2 className="text-lg font-semibold">
          Order Tracking
        </h2>

        <p
          className="
            text-sm
            text-(--color-text-muted)
          "
        >
          {isCancelled
            ? "This order was cancelled."
            : "Here's the latest update on your order."}
        </p>
      </div>

      {/* Cancelled */}
      {isCancelled && (
        <div
          className="
            mt-8
            flex
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-8
            text-center
            dark:border-red-900/40
            dark:bg-red-950/20
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-red-300
              bg-red-100
              text-red-600
              dark:border-red-800
              dark:bg-red-950/40
              dark:text-red-400
            "
          >
            <XCircle
              size={22}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <p
            className="
              mt-4
              text-base
              font-semibold
              text-red-700
              dark:text-red-400
            "
          >
            Order Cancelled
          </p>

          <p
            className="
              mt-1
              max-w-md
              text-sm
              text-red-600/80
              dark:text-red-400/70
            "
          >
            This order will not be fulfilled.
          </p>
        </div>
      )}

      {/* Desktop tracking */}
      {!isCancelled && (
        <div className="mt-8 hidden sm:block">
          <div className="grid grid-cols-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              const isCurrent =
                index === currentIndex;

              const isPast =
                index < currentIndex;

              const isLast =
                index === stages.length - 1;

              const isSuccessful =
                isLast && isCompleted;

              const timestamp =
                getHistoryTimestamp(
                  order.status_history,
                  stage.status
                );

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
                          index < currentIndex
                            ? "bg-(--color-text-muted)"
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
                        transition-all
                        duration-300

                        ${
                          isSuccessful
                            ? `
                              border-green-600
                              bg-green-600
                              text-white
                              shadow-sm
                            `
                            : isCurrent
                            ? `
                              border-(--color-text)
                              bg-(--color-text)
                              text-(--color-background)
                              shadow-sm
                              dark:border-white
                              dark:bg-white
                              dark:text-black
                            `
                            : isPast
                            ? `
                              border-(--color-text-muted)
                              bg-(--color-background)
                              text-(--color-text)
                            `
                            : `
                              border-(--color-border)
                              bg-(--color-background)
                              text-(--color-text-muted)
                              opacity-40
                            `
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        strokeWidth={
                          isCurrent || isSuccessful
                            ? 2
                            : 1.7
                        }
                      />
                    </div>

                    {/* Label */}
                    <p
                      className={`
                        mt-3
                        text-sm
                        ${
                          isSuccessful
                            ? "font-semibold text-green-700 dark:text-green-400"
                            : isCurrent
                            ? "font-semibold text-(--color-text)"
                            : isPast
                            ? "font-medium text-(--color-text)"
                            : "font-medium text-(--color-text-muted) opacity-55"
                        }
                      `}
                    >
                      {stage.label}
                    </p>

                    {/* Timestamp */}
                    <p
                      className={`
                        mt-1
                        text-xs
                        text-(--color-text-muted)
                        ${
                          isCurrent ||
                          isSuccessful
                            ? "opacity-100"
                            : isPast
                            ? "opacity-75"
                            : "opacity-40"
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
      )}

      {/* Mobile tracking */}
      {!isCancelled && (
        <div className="mt-8 sm:hidden">
          <div className="relative">
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              const isCurrent =
                index === currentIndex;

              const isPast =
                index < currentIndex;

              const isLast =
                index === stages.length - 1;

              const isSuccessful =
                isLast && isCompleted;

              const timestamp =
                getHistoryTimestamp(
                  order.status_history,
                  stage.status
                );

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
                      className={`
                        absolute
                        left-6
                        top-12
                        bottom-0
                        w-px
                        ${
                          index < currentIndex
                            ? "bg-(--color-text-muted)"
                            : "bg-(--color-border)"
                        }
                      `}
                    />
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
                      transition-all
                      duration-300

                      ${
                        isSuccessful
                          ? `
                            border-green-600
                            bg-green-600
                            text-white
                            shadow-sm
                          `
                          : isCurrent
                          ? `
                            border-(--color-text)
                            bg-(--color-text)
                            text-(--color-background)
                            shadow-sm
                            dark:border-white
                            dark:bg-white
                            dark:text-black
                          `
                          : isPast
                          ? `
                            border-(--color-text-muted)
                            bg-(--color-background)
                            text-(--color-text)
                          `
                          : `
                            border-(--color-border)
                            bg-(--color-background)
                            text-(--color-text-muted)
                            opacity-40
                          `
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      strokeWidth={
                        isCurrent || isSuccessful
                          ? 2
                          : 1.7
                      }
                    />
                  </div>

                  {/* Details */}
                  <div className="ml-4 pt-1">
                    <p
                      className={`
                        text-sm
                        ${
                          isSuccessful
                            ? "font-semibold text-green-700 dark:text-green-400"
                            : isCurrent
                            ? "font-semibold text-(--color-text)"
                            : isPast
                            ? "font-medium text-(--color-text)"
                            : "font-medium text-(--color-text-muted) opacity-55"
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
                          isCurrent ||
                          isSuccessful
                            ? "opacity-100"
                            : isPast
                            ? "opacity-75"
                            : "opacity-40"
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
      )}
    </section>
  );
}