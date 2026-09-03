import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import ReviewBand from "../../components/reviews/ReviewBand";
import ProductCard from "../../components/products/ProductCard";
import LoadingState from "../../components/common/LoadingState";

import { productService } from "../../services/productService";
import type { Product } from "../../types/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productService.getProducts();
        setProducts(productsData.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              KAHWƐ by Maritina Foods
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              A taste of
              <br />
              Ghana,
              <br />
              delivered.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
              Authentic Ghanaian snacks, drinks and grills made for every
              moment. Discover your favourites and have them delivered to you.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-text)] px-7 py-3.5 text-sm font-medium text-[var(--color-background)] transition-opacity hover:opacity-80"
              >
                Shop Now
              </Link>

              <a
                href="#categories"
                className="rounded-full border border-[var(--color-border)] px-7 py-3.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                Explore Categories
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[620px]">
            <div className="relative flex h-[360px] w-[300px] items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] sm:h-[480px] sm:w-[380px]">
              <div className="text-center">
                <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
                  KAHWƐ
                </p>

                <p className="mt-3 text-xs uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
                  Taste Ghana
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Explore KAHWƐ
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Something for every craving.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Link
            to="/products?category=1"
            className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 transition-transform duration-300 hover:-translate-y-1"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                01
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                Finger Foods
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                Crispy, crunchy Ghanaian favourites made for every occasion.
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>

          <Link
            to="/products?category=2"
            className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 transition-transform duration-300 hover:-translate-y-1"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                02
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                Local Beverages
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                Refreshing Ghanaian drinks, from sobolo to asaana and more.
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>

          <Link
            to="/products?category=3"
            className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-8 transition-transform duration-300 hover:-translate-y-1"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                03
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                Grills
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                Freshly prepared grills and Ghanaian favourites made to order.
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                From KAHWƐ
              </p>

              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Favourites worth trying.
              </h2>
            </div>

            <Link
              to="/products"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium"
            >
              View All Products
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {loadingProducts ? (
            <LoadingState message="Loading products..." />
          ) : products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-[var(--color-text-muted)]">
              No products are available at the moment.
            </p>
          )}
        </div>
      </section>

      <ReviewBand />
    </>
  );
}