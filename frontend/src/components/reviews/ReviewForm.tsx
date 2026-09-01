import {
  useState,
  type FormEvent,
} from "react";

import { Star } from "lucide-react";
import axios from "axios";

import type { ProductVariant } from "../../types/product";

import { reviewService } from "../../services/reviewService";

import Alert from "../common/Alert";

interface ReviewFormProps {
  productId: number;
  variants: ProductVariant[];
  onSuccess: () => void;
}

export default function ReviewForm({
  productId,
  variants,
  onSuccess,
}: ReviewFormProps) {
  const [variantId, setVariantId] =
    useState<number | "">(
      variants.length === 1
        ? variants[0].id
        : ""
    );

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!variantId) {
      setError(
        "Please select a product variant."
      );
      return;
    }

    if (rating < 1) {
      setError(
        "Please select a rating."
      );
      return;
    }

    if (!comment.trim()) {
      setError(
        "Please write a review."
      );
      return;
    }

    setLoading(true);

    try {
      await reviewService.createReview({
        product: productId,
        variant: Number(variantId),
        rating,
        comment: comment.trim(),
      });

      setComment("");
      setRating(0);

      setSuccess(
        "Thank you for your review."
      );

      onSuccess();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            error.response?.data?.detail ||
            "Unable to submit your review."
        );
      } else {
        setError("Unable to submit your review.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mt-8
        rounded-md
        border
        border-(--color-border)
        p-6
      "
    >
      <h3 className="text-lg font-semibold">
        Write a Review
      </h3>

      {error && (
        <div className="mt-4">
          <Alert message={error} />
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Alert
            message={success}
            variant="success"
          />
        </div>
      )}

      {variants.length > 1 && (
        <div className="mt-6">
          <label
            htmlFor="review-variant"
            className="block text-sm font-semibold"
          >
            Variant
          </label>

          <select
            id="review-variant"
            value={variantId}
            onChange={(event) =>
              setVariantId(
                event.target.value
                  ? Number(event.target.value)
                  : ""
              )
            }
            className="
              mt-2
              w-full
              rounded-md
              border
              border-(--color-border)
              bg-(--color-background)
              p-3
            "
          >
            <option value="">
              Select a variant
            </option>

            {variants.map((variant) => (
              <option
                key={variant.id}
                value={variant.id}
              >
                {variant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-semibold">
          Rating
        </p>

        <div
          className="mt-2 flex gap-1"
          role="radiogroup"
          aria-label="Rating"
        >
          {Array.from({ length: 5 }).map(
            (_, index) => {
              const value = index + 1;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRating(value)
                  }
                  aria-label={`${value} star${
                    value === 1
                      ? ""
                      : "s"
                  }`}
                  aria-pressed={
                    rating === value
                  }
                  className="
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  <Star
                    size={22}
                    strokeWidth={1.8}
                    fill={
                      value <= rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="review-comment"
          className="block text-sm font-semibold"
        >
          Your review
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          rows={4}
          placeholder="Tell us what you think..."
          className="
            mt-2
            w-full
            resize-none
            rounded-md
            border
            border-(--color-border)
            bg-(--color-background)
            p-3
            outline-none
          "
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-6
          rounded-md
          bg-(--color-text)
          px-6
          py-3
          text-sm
          text-(--color-background)
          transition-opacity
          hover:opacity-80
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </form>
  );
}