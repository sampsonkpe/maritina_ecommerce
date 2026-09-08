import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import type {
  Product,
  ProductVariant,
} from "../../types/product";

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

    try {
      await addToCart(
        selectedVariant.id,
        parsedQuantity
      );

      setSuccess("Added to cart.");
    } catch (error) {
      console.error(error);
      setError("Failed to add to cart.");
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
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-6
                "
              >
                <div>

                  <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {product.name}
                  </h2>
                </div>

                {selectedVariant && (
                  <FavouriteButton
                    variantId={
                      selectedVariant.id
                    }
                  />
                )}
              </div>

              {product.description && (
                <p
                  className="
                    mt-6
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
                              rounded-2xl
                              border
                              px-5
                              py-4
                              text-left
                              transition-colors
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
                                ? `GHS ${variant.price}`
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
              <div className="mt-8">
                <label
                  htmlFor="product-quantity"
                  className="
                    block
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                  "
                >
                  Quantity
                </label>

                <input
                  id="product-quantity"
                  aria-label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  className="
                    mt-3
                    h-12
                    w-24
                    rounded-xl
                    border
                    border-(--color-border)
                    bg-(--color-background)
                    px-4
                    text-base
                    outline-none
                    transition-colors
                    focus:border-(--color-text)
                  "
                />
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
                    items-center
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <p className="text-sm text-(--color-text-muted)">
                      Price
                    </p>

                    <p
                      className="
                        mt-1
                        text-3xl
                        font-semibold
                        tracking-tight
                      "
                    >
                      {selectedVariant
                        ? `GHS ${selectedVariant.price}`
                        : "—"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={
                      !selectedVariant ||
                      !selectedVariant.is_available
                    }
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-(--color-border)
                      bg-(--color-text)
                      px-7
                      py-3.5
                      text-sm
                      font-medium
                      text-(--color-background)
                      transition-opacity
                      hover:opacity-80
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Add to Cart

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
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
            <div className="mb-12">
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