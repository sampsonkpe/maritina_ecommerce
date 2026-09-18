import { Star } from "lucide-react";

import type { Review } from "../../types/review";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({
  review,
}: ReviewCardProps) {
  return (
    <article
      className="
        border-b
        border-(--color-border)
        py-6
        first:pt-0
        last:border-b-0
      "
    >
      <div
        className="
          flex
          items-center
          gap-1
          text-(--color-text)
        "
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <Star
              key={index}
              size={16}
              strokeWidth={1.6}
              fill={
                index < review.rating
                  ? "currentColor"
                  : "none"
              }
              aria-hidden="true"
            />
          )
        )}
      </div>

      <p
        className="
          mt-4
          text-base
          leading-7
        "
      >
        {review.comment}
      </p>

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-(--color-text-muted)
        "
      >
        {review.customer_first_name}
        {" · "}
        {review.variant_name}
        {" · "}
        {new Date(
          review.created_at
        ).toLocaleDateString()}
      </p>
    </article>
  );
}