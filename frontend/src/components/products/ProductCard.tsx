import type { Product } from "../../types/product";
import { Link } from "react-router-dom";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">
        <Link to={`/products/${product.id}`}>
          {product.name}
        </Link>
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        {product.description}
      </p>

      <div className="mt-4 space-y-2">
        {product.variants.map((variant) => (
          <div
            key={variant.id}
            className="flex justify-between rounded border p-2"
          >
            <span>{variant.name}</span>

            <span>
              GHS {variant.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}