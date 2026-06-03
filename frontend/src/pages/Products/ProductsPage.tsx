import { useEffect, useState } from "react";
import { productService } from "../../services/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading products...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Products
      </h1>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded border p-4"
          >
            <h2 className="font-semibold">
              {product.name}
            </h2>

            <p>
              GHS {product.price}
            </p>

            <p>
              Stock: {product.stock}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}