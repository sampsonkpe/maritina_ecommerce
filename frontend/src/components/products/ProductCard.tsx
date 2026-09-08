import { Link } from "react-router-dom";

import OptimizedImage from "../common/OptimizedImage";

import type { Product } from "../../types/product";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const primaryVariant = product.variants[0];

  const primaryImage =
    product.images?.find((image) => image.is_primary)?.image ??
    product.images?.[0]?.image ??
    product.image;

  return (
    <article className="group overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-background)">
      <Link
        to={`/products/${product.id}`}
        className="block"
      >
        <div className="aspect-square overflow-hidden bg-(--color-surface-muted)">
          {primaryImage ? (
            <OptimizedImage
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-(--color-text-muted)">
                No image available
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {product.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-(--color-text-muted)">
                {product.description}
              </p>
            </div>

            {primaryVariant && (
              <span className="shrink-0 text-sm font-medium">
                GHS {primaryVariant.price}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}