import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import OptimizedImage from "../common/OptimizedImage";

import type { Product } from "../../types/product";
import { formatCurrency } from "../../utils/currency";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const primaryImage =
    product.images?.find(
      (image) => image.is_primary
    )?.image ??
    product.images?.[0]?.image ??
    product.image;

  const lowestPrice =
    product.variants?.length > 0
      ? Math.min(
          ...product.variants.map((variant) =>
            Number(variant.price)
          )
        )
      : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-(--color-border) bg-(--color-background)">
      {/* Image */}
      <div className="aspect-square shrink-0 overflow-hidden bg-(--color-surface-muted)">
        {primaryImage ? (
          <OptimizedImage
            src={primaryImage}
            alt={product.name}
            className="
              block
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-(--color-text-muted)">
              No image available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="
          flex
          flex-1
          flex-col
          items-center
          p-6
          text-center
          sm:p-7
        "
      >
        {/* Product name */}
        <h2
          className="
            h-12
            line-clamp-2
            text-base
            font-semibold
            leading-6
            tracking-tight
            sm:h-14
            sm:text-lg
            sm:leading-7
          "
        >
          {product.name}
        </h2>

        {/* Description */}
        <div className="mt-1 h-12">
          {product.description && (
            <p
              className="
                line-clamp-2
                max-w-xs
                text-sm
                leading-6
                text-(--color-text-muted)
              "
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 h-5">
          <p className="text-sm font-semibold">
            {lowestPrice !== null
              ? `From ${formatCurrency(lowestPrice)}`
              : "From GH₵ —"}
          </p>
        </div>

        {/* CTA */}
        <Link
          to={`/products/${product.id}`}
          className="
            mt-5
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
            hover:bg-(--color-surface-muted)
          "
        >
          View Product

          <ArrowRight
            size={18}
            aria-hidden="true"
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </article>
  );
}