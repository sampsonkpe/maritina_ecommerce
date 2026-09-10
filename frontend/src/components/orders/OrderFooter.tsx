import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { formatDate } from "../../utils/date";

interface OrderFooterProps {
  createdAt: string;
  updatedAt: string;
  orderId?: number;
  showTrackOrder?: boolean;
}

export default function OrderFooter({
  createdAt,
  updatedAt,
  orderId,
  showTrackOrder = false,
}: OrderFooterProps) {
  return (
    <div className="mt-6 border-t border-(--color-border) pt-5">
      <div
        className="
          grid
          grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          items-center
          gap-3
          sm:gap-8
        "
      >
        {/* Order placed */}
        <div
          className="
            min-w-0
            text-left
            text-xs
            leading-5
            text-(--color-text-muted)
            sm:text-sm
          "
        >
          Order placed on {formatDate(createdAt)}
        </div>

        {/* Track Order */}
        <div className="flex shrink-0 justify-center">
          {showTrackOrder && orderId !== undefined && (
            <Link
              to={`/orders/${orderId}`}
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2
                whitespace-nowrap
                rounded-full
                border
                border-(--color-border)
                px-4
                py-2
                text-xs
                font-medium
                transition-colors
                hover:bg-(--color-surface-muted)
                sm:px-5
                sm:py-2.5
                sm:text-sm
              "
            >
              Track Order

              <ArrowRight
                size={15}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  sm:h-4
                  sm:w-4
                "
              />
            </Link>
          )}
        </div>

        {/* Status updated */}
        <div
          className="
            min-w-0
            text-right
            text-xs
            leading-5
            text-(--color-text-muted)
            sm:text-sm
          "
        >
          Status updated on {formatDate(updatedAt)}
        </div>
      </div>
    </div>
  );
}