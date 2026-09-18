import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import {
  HugeiconsIcon,
} from "@hugeicons/react";
import {
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

import type {
  Product,
  ProductVariant,
} from "../../types/product";
import { formatCurrency } from "../../utils/currency";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";

import { useCart } from "../../context/CartContext";
import { productService } from "../../services/productService";

import FavouriteButton from "../../components/favourites/FavouriteButton";
import ReviewList from "../../components/reviews/ReviewList";
import ReviewForm from "../../components/reviews/ReviewForm";
import ProductImageGallery from "../../components/products/ProductImageGallery";

export default function ProductDetailPage() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [quantity, setQuantity] = useState("1");

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] =
    useState(false);

  const [reviewRefreshKey, setReviewRefreshKey] =
    useState(0);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      setSelectedVariant(null);

      try {
        const data =
          await productService.getProduct(id!);

        setProduct(data);

        const availableVariant =
          data.variants.find(
            (variant: ProductVariant) =>
              variant.is_available
          );

        setSelectedVariant(
          availableVariant ??
            data.variants[0] ??
            null
        );
      } catch (error) {
        console.error(error);

        setProduct(null);
        setError(
          "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (addingToCart) {
      return;
    }

    if (!selectedVariant) {
      setError(
        "Please select a product variant."
      );
      return;
    }

    if (!selectedVariant.is_available) {
      setError(
        "This variant is currently unavailable."
      );
      return;
    }

    setError("");
    setSuccess("");

    const parsedQuantity = Number(quantity);

    if (
      !quantity.trim() ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(
        selectedVariant.id,
        parsedQuantity
      );

      setSuccess("Added to cart.");
    } catch (error) {
      console.error(error);
      setError("Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantChange = (
    variant: ProductVariant
  ) => {
    if (!variant.is_available) {
      return;
    }

    setSelectedVariant(variant);
    setError("");
    setSuccess("");
  };

  const handleQuantityChange = (
    value: string
  ) => {
    setQuantity(value);
    setError("");
    setSuccess("");
  };

  const decreaseQuantity = () => {
    const currentQuantity = Number(quantity);

    if (
      !Number.isInteger(currentQuantity) ||
      currentQuantity <= 1
    ) {
      setQuantity("1");
      return;
    }

    setQuantity(
      String(currentQuantity - 1)
    );
    setError("");
    setSuccess("");
  };

  const increaseQuantity = () => {
    const currentQuantity = Number(quantity);

    if (
      !Number.isInteger(currentQuantity) ||
      currentQuantity < 1
    ) {
      setQuantity("2");
      return;
    }

    setQuantity(
      String(currentQuantity + 1)
    );
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <LoadingState message="Loading product..." />
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <EmptyState title="Product not found." />
      </div>
    );
  }

  const parsedQuantity = Number(quantity);
  const canDecrease =
    Number.isInteger(parsedQuantity) &&
    parsedQuantity > 1;

  return (
    <>
      {/* Product */}
      <section className="border-b border-(--color-border)">
        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            py-12
            sm:px-8
            lg:px-8
            lg:py-20
          "
        >
          {(success || error) && (
            <div className="mb-8">
              {success && (
                <Alert
                  message={success}
                  variant="success"
                />
              )}

              {error && (
                <Alert message={error} />
              )}
            </div>
          )}

          {/* Product heading */}
          <div
            className="
              mb-8
              flex
              items-start
              justify-between
              gap-6
              lg:mb-10
            "
          >
            <div>
              <h1
                className="
                  max-w-3xl
                  text-4xl
                  font-semibold
                  leading-[1.05]
                  tracking-tight
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                {product.name}
              </h1>
            </div>

            {selectedVariant && (
              <FavouriteButton
                variantId={selectedVariant.id}
              />
            )}
          </div>

          {/* Product content */}
          <div
            className="
              grid
              gap-12
              lg:grid-cols-2
              lg:gap-16
            "
          >
            {/* Product gallery */}
            <div>
              <ProductImageGallery
                images={product.images}
                fallbackImage={product.image}
                productName={product.name}
              />
            </div>

            {/* Product information */}
            <div className="flex flex-col justify-center">
              {product.description && (
                <p
                  className="
                    max-w-xl
                    text-base
                    leading-7
                    text-(--color-text-muted)
                    sm:text-lg
                  "
                >
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants.length > 0 && (
                <div className="mt-10">
                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <h2
                      className="
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                      "
                    >
                      Select Variant
                    </h2>

                    {selectedVariant && (
                      <span
                        className="
                          text-sm
                          text-(--color-text-muted)
                        "
                      >
                        {selectedVariant.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {product.variants.map(
                      (variant) => {
                        const isSelected =
                          selectedVariant?.id ===
                          variant.id;

                        const isAvailable =
                          variant.is_available;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() =>
                              handleVariantChange(
                                variant
                              )
                            }
                            disabled={!isAvailable}
                            aria-pressed={
                              isSelected
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-4
                              rounded-(--radius-full)
                              border
                              px-5
                              py-4
                              text-left
                              transition-colors
                              duration-200
                              focus-visible:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-(--color-accent)
                              focus-visible:ring-offset-2
                              focus-visible:ring-offset-(--color-background)
                              ${
                                isSelected
                                  ? "border-(--color-text) bg-(--color-text) text-(--color-background)"
                                  : isAvailable
                                    ? "border-(--color-border) hover:bg-(--color-surface-muted)"
                                    : "cursor-not-allowed border-(--color-border) opacity-40"
                              }
                            `}
                          >
                            <span className="font-medium">
                              {variant.name}
                            </span>

                            <span className="shrink-0 text-sm">
                              {isAvailable
                                ? formatCurrency(
                                    variant.price
                                  )
                                : "Unavailable"}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-8 flex flex-col items-center">
                <label
                  htmlFor="product-quantity"
                  className="
                    block
                    text-center
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                  "
                >
                  Quantity
                </label>

                <div
                  className="
                    mt-3
                    inline-flex
                    h-12
                    items-center
                    overflow-hidden
                    rounded-(--radius-full)
                    border
                    border-(--color-border)
                    bg-(--color-background)
                  "
                >
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={!canDecrease}
                    aria-label="Decrease quantity"
                    className="
                      inline-flex
                      h-full
                      w-12
                      items-center
                      justify-center
                      text-(--color-text)
                      transition-opacity
                      duration-200
                      hover:opacity-60
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-(--color-accent)
                    "
                  >
                    <HugeiconsIcon
                      icon={MinusSignIcon}
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>

                  <input
                    id="product-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      handleQuantityChange(event.target.value)
                    }
                    aria-label="Quantity"
                    className="
                      h-full
                      w-12
                      appearance-none
                      border-0
                      bg-transparent
                      p-0
                      text-center
                      text-base
                      outline-none
                      [&::-webkit-inner-spin-button]:appearance-none
                      [&::-webkit-outer-spin-button]:appearance-none
                    "
                  />

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                    className="
                      inline-flex
                      h-full
                      w-12
                      items-center
                      justify-center
                      text-(--color-text)
                      transition-opacity
                      duration-200
                      hover:opacity-60
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-(--color-accent)
                    "
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              {/* Price and cart */}
              <div
                className="
                  mt-10
                  border-t
                  border-(--color-border)
                  pt-8
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-end
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-(--color-text-muted)
                      "
                    >
                      Price
                    </p>

                    <p
                      className="
                        mt-1
                        text-3xl
                        font-semibold
                        leading-none
                        tracking-tight
                      "
                    >
                      {selectedVariant
                        ? formatCurrency(
                            selectedVariant.price
                          )
                        : "—"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      addingToCart ||
                      !selectedVariant ||
                      !selectedVariant.is_available
                    }
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      rounded-(--radius-full)
                      border
                      border-(--color-border)
                      px-6
                      py-3
                      text-sm
                      font-medium
                      transition-colors
                      duration-200
                      hover:bg-(--color-surface-muted)
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-(--color-accent)
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-(--color-background)
                    "
                  >
                    {addingToCart
                      ? "Adding..."
                      : "Add to Cart"}

                    {!addingToCart && (
                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    )}
                  </button>
                </div>

                {!selectedVariant && (
                  <p
                    className="
                      mt-4
                      text-sm
                      text-(--color-text-muted)
                    "
                  >
                    No variants are currently
                    available.
                  </p>
                )}

                {selectedVariant &&
                  !selectedVariant.is_available && (
                    <p
                      className="
                        mt-4
                        text-sm
                        text-(--color-text-muted)
                    "
                  >
                    This variant is currently
                    unavailable.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-b border-(--color-border)">
        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            py-20
            sm:px-8
            lg:px-8
            lg:py-24
          "
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <p
                className="
                  mb-4
                  text-sm
                  font-medium
                  uppercase
                  tracking-[0.3em]
                  text-(--color-text-muted)
                "
              >
                Customer Reviews
              </p>

              <h2
                className="
                  text-4xl
                  font-semibold
                  tracking-tight
                  sm:text-5xl
                "
              >
                What people are saying.
              </h2>

              <p
                className="
                  mt-5
                  text-base
                  leading-7
                  text-(--color-text-muted)
                  sm:text-lg
                "
              >
                See what other KAHWƐ customers
                think about this product.
              </p>
            </div>

            <ReviewList
              productId={product.id}
              refreshKey={reviewRefreshKey}
            />

            <ReviewForm
              productId={product.id}
              variants={product.variants}
              onSuccess={() =>
                setReviewRefreshKey(
                  (value) => value + 1
                )
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}