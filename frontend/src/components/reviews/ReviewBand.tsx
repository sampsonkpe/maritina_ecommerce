import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { reviewService } from "../../services/reviewService";

import type { Review } from "../../types/review";

export default function ReviewBand() {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data =
          await reviewService.getAllReviews();

        setReviews(data);
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  /*
   * Duplicate the reviews so the second set can
   * immediately follow the first when the animation
   * reaches the end.
   */
  const scrollingReviews = [
    ...reviews,
    ...reviews,
  ];

  return (
    <section
      aria-label="Customer reviews"
      className="
        w-full
        overflow-hidden
        border-y
        border-(--color-border)
        py-5
      "
    >
      <div className="review-band-track">
        {scrollingReviews.map(
          (review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="
                flex
                shrink-0
                items-center
                gap-3
                px-8
              "
            >
              <div className="flex items-center gap-0.5">
                {Array.from({
                  length: 5,
                }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    size={15}
                    strokeWidth={1.8}
                    fill={
                      starIndex <
                      review.rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              <span className="text-sm">
                "{review.comment}"
              </span>

              <span
                className="
                  text-sm
                  text-(--color-text-muted)
                "
              >
                {review.customer_first_name}
                {" · "}
                {review.product_name}
                {" · "}
                {review.variant_name}
              </span>

              <span
                aria-hidden="true"
                className="mx-4"
              >
                |
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}