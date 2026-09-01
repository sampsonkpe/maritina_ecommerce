import { useEffect, useState } from "react";

import type { Review } from "../../types/review";

import { reviewService } from "../../services/reviewService";

import ReviewCard from "./ReviewCard";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";

interface ReviewListProps {
  productId: number;
  refreshKey?: number;
}

export default function ReviewList({
  productId,
  refreshKey = 0,
}: ReviewListProps) {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data =
          await reviewService.getProductReviews(
            productId
          );

        setReviews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId, refreshKey]);

  if (loading) {
    return (
      <LoadingState
        message="Loading reviews..."
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet."
      />
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
        />
      ))}
    </div>
  );
}