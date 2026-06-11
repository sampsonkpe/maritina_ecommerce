import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { productService } from "../../services/productService";

import type {
  Product,
  ProductVariant,
} from "../../types/product";

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productService.getProduct(
          id!
        );

        setProduct(data);

        if (data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="grid gap-10 md:grid-cols-2">

        <div>
          <div className="flex h-96 items-center justify-center rounded-lg border">
            Product Image
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>

          <p className="mt-4 text-gray-600">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="mb-3 font-semibold">
              Select Variant
            </h2>

            <div className="space-y-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() =>
                    setSelectedVariant(variant)
                  }
                  className={`block w-full rounded border p-3 text-left ${
                    selectedVariant?.id === variant.id
                      ? "border-black"
                      : ""
                  }`}
                >
                  {variant.name} — GHS {variant.price}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Number(e.target.value)
                )
              }
              className="mt-2 w-24 rounded border p-2"
            />
          </div>

          <div className="mt-8">
            <div className="text-2xl font-bold">
              GHS {selectedVariant?.price}
            </div>

            <button
              className="mt-4 rounded bg-black px-6 py-3 text-white"
            >
              Add To Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}