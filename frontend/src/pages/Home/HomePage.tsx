import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import ReviewBand from "../../components/reviews/ReviewBand";
import ProductCard from "../../components/products/ProductCard";
import LoadingState from "../../components/common/LoadingState";

import { productService } from "../../services/productService";
import type { Product } from "../../types/product";

const FEATURED_PRODUCT_IDS = {
  fingerFoods: 4,
  localBeverages: 5,
  grills: 8,
  additional: 3,
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productService.getProducts();

        const featuredProductIds = Object.values(
          FEATURED_PRODUCT_IDS
        );

        const featuredProducts = featuredProductIds
          .map((id) =>
            productsData.find((product: Product) => product.id === id)
          )
          .filter(
            (product): product is Product =>
              product !== undefined
          );

        setProducts(featuredProducts);
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
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              KAHWƐ by Maritina Foods
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              A taste of
              <br />
              Ghana,
              <br />
              delivered.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Authentic Ghanaian snacks, drinks and grills made
              for every moment. Discover your favourites and
              have them delivered to you.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="rounded-full border border-(--color-border) bg-(--color-text) px-7 py-3.5 text-sm font-medium text-(--color-background) transition-opacity hover:opacity-80"
              >
                Shop Now
              </Link>

              <a
                href="#categories"
                className="rounded-full border border-(--color-border) px-7 py-3.5 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
              >
                Explore Categories
              </a>
            </div>
          </div>

          <div className="relative flex min-h-105 items-center justify-center lg:min-h-155">
            <div className="relative h-90 w-75 overflow-hidden rounded-4xl border border-(--color-border) sm:h-120 sm:w-95">
              <img
                src="/images/kahwe-hero.png"
                alt="Ghanaian snacks and local beverage"
                className="h-full w-full object-cover object-[70%_center]"
              />
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
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
            Explore KAHWƐ
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Something for every craving.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Finger Foods */}
          <Link
            to="/products?category=1"
            className="group relative flex min-h-105 flex-col justify-between overflow-hidden rounded-3xl border border-white/30"
          >
            <img
              src="/images/finger-foods.png"
              alt="Ghanaian finger foods"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:opacity-45" />

            <div className="relative z-10 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-white">
                01
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Finger Foods
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                Crispy, crunchy Ghanaian favourites made for every
                occasion.
              </p>
            </div>

            <span className="relative z-10 ml-8 mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </span>
          </Link>

          {/* Local Beverages */}
          <Link
            to="/products?category=2"
            className="group relative flex min-h-105 flex-col justify-between overflow-hidden rounded-3xl border border-white/30"
          >
            <img
              src="/images/local-beverages.png"
              alt="Ghanaian local beverages"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:opacity-45" />

            <div className="relative z-10 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-white">
                02
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Local Beverages
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                Refreshing Ghanaian drinks, from sobolo to asaana and
                more.
              </p>
            </div>

            <span className="relative z-10 ml-8 mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </span>
          </Link>

          {/* Grills */}
          <Link
            to="/products?category=3"
            className="group relative flex min-h-105 flex-col justify-between overflow-hidden rounded-3xl border border-white/30"
          >
            <img
              src="/images/grills.png"
              alt="Ghanaian grilled foods"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/35 transition-opacity duration-300 group-hover:opacity-45" />

            <div className="relative z-10 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-white">
                03
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Grills
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                Freshly prepared grills and Ghanaian favourites made to
                order.
              </p>
            </div>

            <span className="relative z-10 ml-8 mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="border-y border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
                From KAHWƐ
              </p>

              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Favourites worth trying.
              </h2>
            </div>
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
            <p className="py-12 text-center text-(--color-text-muted)">
              No products are available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* KAHWƐ Story */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid overflow-hidden rounded-4xl border border-(--color-border) lg:grid-cols-2">
          <div className="flex min-h-105 items-center justify-center bg-(--color-surface-muted) p-12 sm:min-h-125 lg:min-h-155">
            <div className="text-center">
              <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
                KAHWƐ
              </p>

              <p className="mt-3 text-xs uppercase tracking-[0.35em] text-(--color-text-muted)">
                By Maritina Foods
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              About KAHWƐ
            </p>

            <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Ghanaian taste, made with care.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              KAHWƐ brings together the flavours people know and love, from
              traditional Ghanaian snacks and refreshing local beverages to
              freshly prepared grills.
            </p>

            <p className="mt-5 max-w-xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Proudly brought to you by Maritina Foods, KAHWƐ makes it simple
              to discover your favourites, order with ease and enjoy them
              wherever you are.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              How It Works
            </p>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Good food, without the fuss.
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-(--color-text-muted)">
                01
              </p>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Choose
              </h3>

              <p className="mt-3 text-sm leading-6 text-(--color-text-muted)">
                Browse our snacks, drinks and grills and choose your favourites.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-(--color-text-muted)">
                02
              </p>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Order
              </h3>

              <p className="mt-3 text-sm leading-6 text-(--color-text-muted)">
                Add what you want to your cart and complete your order securely.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-(--color-text-muted)">
                03
              </p>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                We prepare
              </h3>

              <p className="mt-3 text-sm leading-6 text-(--color-text-muted)">
                We'll prepare your order with care and get it ready for you.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-(--color-text-muted)">
                04
              </p>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Enjoy
              </h3>

              <p className="mt-3 text-sm leading-6 text-(--color-text-muted)">
                Choose delivery or pickup and enjoy your KAHWƐ favourites.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium"
            >
              Explore the Menu

              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="rounded-4xl border border-(--color-border) bg-(--color-surface-muted) px-8 py-16 text-center sm:px-12 lg:px-16 lg:py-24">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
            Ready when you are
          </p>

          <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
            A taste of Ghana is just a few clicks away.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
            Discover your favourites, place your order and enjoy KAHWƐ
            wherever you are.
          </p>

          <div className="mt-10">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-text) px-7 py-3.5 text-sm font-medium text-(--color-background) transition-opacity hover:opacity-80"
            >
              Explore the Menu

              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      <ReviewBand />
    </>
  );
}