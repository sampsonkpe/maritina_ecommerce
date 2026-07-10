import { useEffect, useState } from "react";

import ProductCard from "../../components/products/ProductCard";

import { productService } from "../../services/productService";

import type { Product } from "../../types/product";
import type { Category } from "../../types/category";


import LoadingState from "../../components/common/LoadingState";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData =
          await productService.getProducts();

        const categoriesData =
          await productService.getCategories();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === null
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  if (loading) {
    return (
      <LoadingState
        message="Loading orders..."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Products
      </h1>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className="rounded-lg border px-4 py-2"
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setSelectedCategory(category.id)
            }
            className="rounded-lg border px-4 py-2"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}