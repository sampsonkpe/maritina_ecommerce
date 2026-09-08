import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { productService } from "../../services/productService";
import ProductCard from "../../components/products/ProductCard";
import LoadingState from "../../components/common/LoadingState";

import type { Product } from "../../types/product";
import type { Category } from "../../types/category";

const CATEGORY_NUMBERS: Record<string, string> = {
  "Finger Foods": "01",
  "Local Beverages": "02",
  "Grills": "03",
};

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
        const [productsData, categoriesData] =
          await Promise.all([
            productService.getProducts(),
            productService.getCategories(),
          ]);

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

  const selectedCategoryName =
    categories.find(
      (category) => category.id === selectedCategory
    )?.name;

  const handleCategoryChange = (
    categoryId: number | null
  ) => {
    if (categoryId === null) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      category: String(categoryId),
    });
  };

  if (loading) {
    return (
      <LoadingState message="Loading products..." />
    );
  }

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto flex min-h-[calc(60vh-4rem)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              KAHWƐ Menu
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              {selectedCategoryName ??
                "Everything tastes better here."}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Discover authentic Ghanaian snacks, refreshing
              local beverages and freshly prepared grills,
              made for every craving.
            </p>
          </div>
        </div>
      </section>

      {/* Category navigation */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <div className="flex items-center justify-center gap-10 overflow-x-auto pb-1 max-sm:justify-start max-sm:gap-3">
            <button
              type="button"
              onClick={() =>
                handleCategoryChange(null)
              }
              className={`
                shrink-0
                rounded-full
                border
                px-5
                py-2.5
                text-sm
                font-medium
                transition-colors
                ${
                  selectedCategory === null
                    ? "border-(--color-text) bg-(--color-text) text-(--color-background)"
                    : "border-(--color-border) hover:bg-(--color-surface-muted)"
                }
              `}
            >
              All
            </button>

            {categories.map((category) => {
              const isActive =
                selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(category.id)
                  }
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? "border-(--color-text) bg-(--color-text) text-(--color-background)"
                        : "border-(--color-border) hover:bg-(--color-surface-muted)"
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-(--color-text-muted)">
                {selectedCategoryName
                  ? `Category ${String(
                      CATEGORY_NUMBERS[
                        selectedCategoryName
                      ] ??
                        selectedCategory
                    ).padStart(2, "0")}`
                  : "The Menu"}
              </p>

              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {selectedCategoryName ??
                  "Explore the menu."}
              </h2>
            </div>

            <span className="hidden text-sm text-(--color-text-muted) sm:block">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "item"
                : "items"}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-4xl border border-(--color-border) px-6 py-24 text-center">
              <h3 className="text-2xl font-semibold">
                Nothing here yet.
              </h3>

              <p className="mt-3 text-(--color-text-muted)">
                We don't have any products in this category
                at the moment.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(null)
                }
                className="group mt-7 inline-flex items-center gap-2 text-sm font-medium"
              >
                View everything

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}