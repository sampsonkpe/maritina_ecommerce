import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { cartService } from "../../services/cartService";
import { productService } from "../../services/productService";

import type {
  Product,
  ProductVariant,
} from "../../types/product";

import LoadingState from "../../components/common/LoadingState";
import PageContainer from "../../components/common/PageContainer";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setError("");
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

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setError("");
    setSuccess("");

    try {
      await cartService.addToCart(
        selectedVariant.id,
        quantity
      );

      setSuccess("Added to cart.");
    } catch (error) {
      console.error(error);
      setError("Failed to add to cart.");
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading orders..."
      />
    );
  }

  if (!product) {
    return (
      <EmptyState
          title="Product not found."
      />
    );
  }

  return (
    <PageContainer>
      {success && <Alert message={success} />}
      {error && <Alert message={error} />}
      
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
                  className={`block w-full rounded-lg border p-3 text-left ${
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
                  Math.max(1, Number(e.target.value))
                )
              }
              className="mt-2 w-24 rounded-lg border p-2"
            />
          </div>

          <div className="mt-8">
            <div className="text-2xl font-bold">
              GHS {selectedVariant?.price}
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Add To Cart
            </button>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}