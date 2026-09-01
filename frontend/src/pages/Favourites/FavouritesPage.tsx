import { useEffect, useState } from "react";

import FavouriteCard from "../../components/favourites/FavouriteCard";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import PageContainer from "../../components/common/PageContainer";

import { favouriteService } from "../../services/favouriteService";

import type { FavouriteItem } from "../../types/favourite";

export default function FavouritesPage() {
  const [favourites, setFavourites] =
    useState<FavouriteItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadFavourites = async () => {
      setError("");

      try {
        const data =
          await favouriteService.getFavourites();

        setFavourites(data);
      } catch (error) {
        console.error(error);
        setError(
          "Failed to load your Favourites."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavourites();
  }, []);

  const handleRemove = (variantId: number) => {
    setFavourites((current) =>
      current.filter(
        (item) =>
          item.variant.id !== variantId
      )
    );
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading Favourites..."
      />
    );
  }

  return (
    <PageContainer maxWidth="6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Favourites
        </h1>

        <p className="mt-2 text-(--color-text-muted)">
          Products you have saved for later.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert message={error} />
        </div>
      )}

      {favourites.length === 0 ? (
        <EmptyState
          title="You have no Favourites yet."
        />
      ) : (
        <div
          className="
            grid
            gap-6
            md:grid-cols-2
          "
        >
          {favourites.map((item) => (
            <FavouriteCard
              key={item.id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}