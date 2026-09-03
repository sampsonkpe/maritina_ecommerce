import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../services/productService";
import ProductCard from "../../components/products/ProductCard";
import LoadingState from "../../components/common/LoadingState";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryParam = searchParams.get("category");
  const selectedCategory = categoryParam
    ? Number(categoryParam)
    : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await productService.getProducts();
        const categoriesData = await productService.getCategories();

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
          (product) => product.category === selectedCategory
        );

  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId === null) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      category: String(categoryId),
    });
  };

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Products
      </h1>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleCategoryChange(null)}
          className="rounded-md border px-4 py-2"
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryChange(category.id)}
            className="rounded-md border px-4 py-2"
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