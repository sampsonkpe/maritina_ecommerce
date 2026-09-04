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
        <div className="overflow-hidden rounded-md border">
          <OptimizedImage
            src={fallbackImage}
            alt={productName}
            priority
            className="
              h-96
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
          h-96
          items-center
          justify-center
          rounded-md
          border
        "
      >
        Product Image
      </div>
    );
  }

  return (
    <div>
      {/* Main product image */}
      <div className="overflow-hidden rounded-md border">
        {selectedImage && (
          <OptimizedImage
            src={selectedImage.image}
            alt={productName}
            priority
            className="
              h-96
              w-full
              object-cover
            "
          />
        )}
      </div>

      {/* Thumbnail images */}
      {sortedImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {sortedImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() =>
                setSelectedImageId(image.id)
              }
              aria-label={`View ${productName} image ${
                image.display_order + 1
              }`}
              aria-pressed={
                selectedImage?.id === image.id
              }
              className={`
                h-20
                w-20
                shrink-0
                overflow-hidden
                rounded-md
                border
                ${
                  selectedImage?.id === image.id
                    ? "border-black"
                    : "border-gray-300"
                }
              `}
            >
              <OptimizedImage
                src={image.image}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}