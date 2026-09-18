import {
  useState,
  type FormEvent,
} from "react";

import { Star } from "lucide-react";
import axios from "axios";

import type { ProductVariant } from "../../types/product";

import { reviewService } from "../../services/reviewService";

import Alert from "../common/Alert";
import Textarea from "../common/Textarea";
import Select from "../common/Select";

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
        setError(
          "Unable to submit your review."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mt-12
        w-full
        rounded-(--radius-lg)
        border
        border-(--color-border)
        p-6
        sm:p-8
      "
    >
      {/* Header */}
      <div>
        <p
          className="
            text-center
            text-sm
            font-medium
            uppercase
            tracking-[0.2em]
            text-(--color-text-muted)
          "
        >
          Share your experience
        </p>

        <h3
          className="
            mt-2
            text-center
            text-2xl
            font-semibold
            tracking-tight
          "
        >
          Write a Review
        </h3>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className="mt-6">
          {error && (
            <Alert message={error} />
          )}

          {success && (
            <Alert
              message={success}
              variant="success"
            />
          )}
        </div>
      )}

      {/* Variant + Rating */}
      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-8
          md:grid-cols-2
          md:gap-30
        "
      >
        {/* Variant */}
        {variants.length > 1 && (
          <div>
            <Select
              label="Variant"
              id="review-variant"
              value={variantId}
              onChange={(event) =>
                setVariantId(
                  event.target.value
                    ? Number(event.target.value)
                    : ""
                )
              }
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
            </Select>
          </div>
        )}

        {/* Rating */}
        <div
          className="
            mx-auto
            flex
            w-fit
            flex-col
            items-start
            md:mx-0
          "
        >
          <p
            className="
              mb-3
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-(--color-text-muted)
            "
          >
            Rating
          </p>

          <div
            className="flex gap-1"
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
                      value === 1 ? "" : "s"
                    }`}
                    aria-pressed={
                      rating === value
                    }
                    className="
                      p-0.5
                      text-(--color-text)
                      transition-opacity
                      duration-200
                      hover:opacity-60
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-(--color-accent)
                      focus-visible:ring-offset-1
                      focus-visible:ring-offset-(--color-background)
                    "
                  >
                    <Star
                      size={22}
                      strokeWidth={1.3}
                      fill={
                        value <= rating
                          ? "currentColor"
                          : "none"
                      }
                      aria-hidden="true"
                    />
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="mt-8">
        <Textarea
          label="Your Review"
          id="review-comment"
          value={comment}
          onChange={(event) =>
            setComment(event.target.value)
          }
          rows={5}
          placeholder="Tell us what you think..."
        />
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            items-center
            justify-center
            rounded-(--radius-full)
            border
            border-(--color-border)
            px-6
            py-3
            text-sm
            font-medium
            transition-colors
            hover:bg-(--color-surface-muted)
            disabled:cursor-not-allowed
            disabled:opacity-50
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-(--color-accent)
            focus-visible:ring-offset-2
            focus-visible:ring-offset-(--color-background)
          "
        >
          {loading
            ? "Submitting..."
            : "Submit Review"}
        </button>
      </div>
    </form>
  );
}