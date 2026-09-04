import { useMemo, useState } from "react";

import type { ProductImage } from "../../types/product";

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
    useState<number | null>(
      primaryImage?.id ?? null
    );

  const selectedImage =
    sortedImages.find(
      (image) => image.id === selectedImageId
    ) ?? primaryImage;

  if (sortedImages.length === 0) {
    if (fallbackImage) {
      return (
        <div className="overflow-hidden rounded-md border">
          <img
            src={fallbackImage}
            alt={productName}
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
      <div className="flex h-96 items-center justify-center rounded-md border">
        Product Image
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <img
          src={selectedImage?.image}
          alt={productName}
          className="
            h-96
            w-full
            object-cover
          "
        />
      </div>

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
              <img
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