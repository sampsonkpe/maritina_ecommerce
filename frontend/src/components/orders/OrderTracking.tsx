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

import { ORDER_STATUS } from "../../constants/order";

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

function getRefundMessage(
  refundStatus: string | null,
  isCancelled: boolean
) {
  switch (refundStatus) {
    case "PROCESSED":
      return {
        title: "Order Cancelled",
        message:
          "This order has been cancelled and your payment has been refunded.",
        showContact: false,
        isError: false,
      };

    case "PENDING":
    case "PROCESSING":
      return {
        title: "Cancellation Requested",
        message:
          "Your cancellation request has been received. Your refund is being processed, and the order will only be cancelled once the refund is confirmed.",
        showContact: false,
        isError: false,
      };

    case "NEEDS_ATTENTION":
      return {
        title: "Cancellation Requires Attention",
        message:
          "Your refund requires further attention. Your order has not yet been cancelled. Please contact us for assistance.",
        showContact: true,
        isError: true,
      };

    case "FAILED":
      return {
        title: "Refund Failed",
        message:
          "We were unable to process your refund, so your order has not been cancelled. Please contact us for assistance.",
        showContact: true,
        isError: true,
      };

    default:
      if (isCancelled) {
        return {
          title: "Order Cancelled",
          message: "This order has been cancelled.",
          showContact: false,
          isError: true,
        };
      }

      return null;
  }
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

  const refundMessage = getRefundMessage(
    order.cancellation_refund_status,
    isCancelled
  );

  const getStageClasses = (
    index: number,
    isSuccessful: boolean
  ) => {
    const isCurrent = index === currentIndex;
    const isPast = index < currentIndex;

    if (isSuccessful) {
      return `
        border-green-600
        bg-green-600
        text-white
        shadow-sm
      `;
    }

    if (isCurrent) {
      return `
        border-(--color-text)
        bg-(--color-text)
        text-(--color-background)
        shadow-sm
        dark:border-white
        dark:bg-white
        dark:text-black
      `;
    }

    if (isPast) {
      return `
        border-(--color-border)
        bg-(--color-surface-muted)
        text-(--color-text-muted)
        opacity-45
      `;
    }

    return `
      border-(--color-border)
      bg-(--color-surface)
      text-(--color-text-muted)
    `;
  };

  const getLabelClasses = (
    index: number,
    isSuccessful: boolean
  ) => {
    const isCurrent = index === currentIndex;
    const isPast = index < currentIndex;

    if (isSuccessful) {
      return "font-semibold text-green-700 dark:text-green-400";
    }

    if (isCurrent) {
      return "font-semibold text-(--color-text)";
    }

    if (isPast) {
      return "font-medium text-(--color-text-muted) opacity-55";
    }

    return "font-medium text-(--color-text-muted)";
  };

  const getTimestampClasses = (
    index: number,
    isSuccessful: boolean
  ) => {
    const isCurrent = index === currentIndex;
    const isPast = index < currentIndex;

    if (isCurrent || isSuccessful) {
      return "opacity-100";
    }

    if (isPast) {
      return "opacity-45";
    }

    return "opacity-75";
  };

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

        <p className="text-sm text-(--color-text-muted)">
          Here's the latest update on your order.
        </p>
      </div>

      {/* Cancellation / Refund Status */}
      {refundMessage && (
        <div
          className={`
            mt-8
            flex
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            px-5
            py-8
            text-center
            ${
              refundMessage.isError
                ? `
                  border-(--color-error)
                  bg-(--color-error-surface)
                  text-(--color-error)
                `
                : `
                  border-(--color-border)
                  bg-(--color-surface-muted)
                  text-(--color-text)
                `
            }
          `}
        >
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              ${
                refundMessage.isError
                  ? `
                    border-(--color-error)
                    bg-(--color-error-surface)
                    text-(--color-error)
                  `
                  : `
                    border-(--color-border)
                    bg-(--color-surface)
                    text-(--color-text-muted)
                  `
              }
            `}
          >
            <XCircle
              size={22}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <p
            className={`
              mt-4
              text-base
              font-semibold
              ${
                refundMessage.isError
                  ? "text-(--color-error)"
                  : "text-(--color-text)"
              }
            `}
          >
            {refundMessage.title}
          </p>

          <p
            className={`
              mt-1
              max-w-md
              text-sm
              ${
                refundMessage.isError
                  ? "text-(--color-error)"
                  : "text-(--color-text-muted)"
              }
            `}
          >
            {refundMessage.message}
          </p>

          {refundMessage.showContact && (
            <a
              href="mailto:sampsonkpedev@icloud.com"
              className="
                mt-3
                text-sm
                font-semibold
                underline
                underline-offset-4
                transition-opacity
                hover:opacity-75
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--color-error)
                focus-visible:ring-offset-2
              "
            >
              Please contact us
            </a>
          )}
        </div>
      )}

      {/* Tracking Timeline */}
      {!isCancelled && (
        <>
          {/* Desktop */}
          <div className="mt-8 hidden sm:block">
            <div className="grid grid-cols-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon;

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
                    {/* Horizontal Connector */}
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
                          ${getStageClasses(index, isSuccessful)}
                        `}
                      >
                        <Icon
                          size={20}
                          strokeWidth={
                            index === currentIndex || isSuccessful
                              ? 2
                              : 1.7
                          }
                          aria-hidden="true"
                        />
                      </div>

                      <p
                        className={`
                          mt-3
                          text-sm
                          ${getLabelClasses(index, isSuccessful)}
                        `}
                      >
                        {stage.label}
                      </p>

                      <p
                        className={`
                          mt-1
                          text-xs
                          text-(--color-text-muted)
                          ${getTimestampClasses(index, isSuccessful)}
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

          {/* Mobile */}
          <div className="mt-8 sm:hidden">
            <div className="relative">
              {stages.map((stage, index) => {
                const Icon = stage.icon;

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
                    className="relative flex min-h-20"
                  >
                    {/* Vertical Connector */}
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
                        ${getStageClasses(index, isSuccessful)}
                      `}
                    >
                      <Icon
                        size={20}
                        strokeWidth={
                          index === currentIndex || isSuccessful
                            ? 2
                            : 1.7
                        }
                        aria-hidden="true"
                      />
                    </div>

                    {/* Details */}
                    <div className="ml-4 min-w-0 pt-1">
                      <p
                        className={`
                          text-sm
                          ${getLabelClasses(index, isSuccessful)}
                        `}
                      >
                        {stage.label}
                      </p>

                      <p
                        className={`
                          mt-1
                          text-xs
                          text-(--color-text-muted)
                          ${getTimestampClasses(index, isSuccessful)}
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
        </>
      )}
    </section>
  );
}