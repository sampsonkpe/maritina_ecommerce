import { useEffect, useState } from "react";

import FavouriteCard from "../../components/favourites/FavouriteCard";
import LoadingState from "../../components/common/LoadingState";

import { favouriteService } from "../../services/favouriteService";

import type { FavouriteItem } from "../../types/favourite";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const data = await favouriteService.getFavourites();

        setFavourites(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load your favourites.");
      } finally {
        setLoading(false);
      }
    };

    loadFavourites();
  }, []);

  const handleRemove = (variantId: number) => {
    setFavourites((current) =>
      current.filter(
        (item) => item.variant.id !== variantId
      )
    );
  };

  if (loading) {
    return <LoadingState message="Loading favourites..." />;
  }

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto flex min-h-[calc(60vh-4rem)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your KAHWƐ Favourites
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              Things worth coming back to.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Everyone has their favourites. Keep the products you love close by and
              ready for your next order.
            </p>
          </div>
        </div>
      </section>

      {/* Favourites */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-12">
            <div className="flex items-center justify-between gap-4">
              <h2 className="min-w-0 text-4xl font-semibold leading-none tracking-tight sm:text-5xl lg:text-6xl">
                Your favourites.
              </h2>

              <span className="shrink-0 whitespace-nowrap text-sm text-(--color-text-muted)">
                {favourites.length}{" "}
                {favourites.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>
          </div>

          {error ? (
            <div className="rounded-4xl border border-(--color-border) px-6 py-24 text-center">
              <h3 className="text-2xl font-semibold">
                Something went wrong.
              </h3>

              <p className="mt-3 text-(--color-text-muted)">
                {error}
              </p>
            </div>
          ) : favourites.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((item) => (
                <FavouriteCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-4xl border border-(--color-border) px-6 py-24 text-center">
              <h3 className="text-2xl font-semibold">
                Nothing saved yet.
              </h3>

              <p className="mt-3 text-(--color-text-muted)">
                Products you favourite will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}