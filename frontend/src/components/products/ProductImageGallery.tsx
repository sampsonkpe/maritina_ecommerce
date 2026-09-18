import { useMemo, useState } from "react";

import type { ProductImage } from "../../types/product";

import OptimizedImage from "../common/OptimizedImage";

interface ProductImageGalleryProps {
  images: ProductImage[];
  fallbackImage: string | null;
  productName: string;
}

export default function ProductImageGallery({
  images,
  fallbackImage,
  productName,
}: ProductImageGalleryProps) {
  const sortedImages = useMemo(() => {
    return [...images].sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.id - b.id
    );
  }, [images]);

  const primaryImage =
    sortedImages.find(
      (image) => image.is_primary
    ) ?? sortedImages[0];

  const [selectedImageId, setSelectedImageId] =
    useState<number | null>(null);

  const selectedImage =
    sortedImages.find(
      (image) => image.id === selectedImageId
    ) ?? primaryImage;

  /*
   * No gallery images.
   * Fall back to the legacy Product.image field.
   */
  if (sortedImages.length === 0) {
    if (fallbackImage) {
      return (
        <div
          className="
            aspect-square
            overflow-hidden
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface-muted)
          "
        >
          <OptimizedImage
            src={fallbackImage}
            alt={productName}
            priority
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>
      );
    }

    return (
      <div
        className="
          flex
          aspect-square
          items-center
          justify-center
          rounded-2xl
          border
          border-(--color-border)
          bg-(--color-surface-muted)
        "
      >
        <span className="text-sm text-(--color-text-muted)">
          No image available
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Main product image */}
      <div
        className="
          aspect-square
          overflow-hidden
          rounded-2xl
          border
          border-(--color-border)
          bg-(--color-surface-muted)
        "
      >
        {selectedImage && (
          <OptimizedImage
            src={selectedImage.image}
            alt={productName}
            priority
            className="
              block
              h-full
              w-full
              object-cover
            "
          />
        )}
      </div>

      {/* Thumbnail images */}
      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {sortedImages.map((image) => {
            const isSelected =
              selectedImage?.id === image.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImageId(image.id)
                }
                aria-label={`View ${productName} image ${
                  image.display_order + 1
                }`}
                aria-pressed={isSelected}
                className={`
                  h-20
                  w-20
                  shrink-0
                  overflow-hidden
                  rounded-(--radius-md)
                  border
                  bg-(--color-surface-muted)
                  transition-opacity
                  duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-(--color-accent)
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-(--color-background)
                  ${
                    isSelected
                      ? "border-(--color-text)"
                      : "border-(--color-border) opacity-80 hover:opacity-100"
                  }
                `}
              >
                <OptimizedImage
                  src={image.image}
                  alt=""
                  className="
                    block
                    h-full
                    w-full
                    object-cover
                  "
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}