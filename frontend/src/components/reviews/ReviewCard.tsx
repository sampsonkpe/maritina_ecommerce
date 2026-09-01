import { Star } from "lucide-react";

import type { Review } from "../../types/review";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({
  review,
}: ReviewCardProps) {
  return (
    <div
      className="
        border-b
        border-(--color-border)
        py-6
      "
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <Star
              key={index}
              size={16}
              strokeWidth={1.8}
              fill={
                index < review.rating
                  ? "currentColor"
                  : "none"
              }
            />
          )
        )}
      </div>

      <p className="mt-3">
        {review.comment}
      </p>

      <p className="mt-3 text-sm text-(--color-text-muted)">
        {review.customer_first_name} ·{" "}
        {review.variant_name} ·{" "}
        {new Date(
          review.created_at
        ).toLocaleDateString()}
      </p>
    </div>
  );
}