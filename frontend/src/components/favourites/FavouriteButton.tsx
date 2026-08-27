import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { favouriteService } from "../../services/favouriteService";

interface FavouriteButtonProps {
  productId: number;
}

export default function FavouriteButton({
  productId,
}: FavouriteButtonProps) {
  const { authenticated } = useAuth();

  const [favourited, setFavourited] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    const checkFavourite = async () => {
      if (!authenticated) {
        setChecking(false);
        return;
      }

      try {
        const items =
          await favouriteService.getFavourites();

        setFavourited(
          items.some(
            (item) =>
              item.product.id === productId
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    };

    checkFavourite();
  }, [authenticated, productId]);

  const handleToggle = async () => {
    if (!authenticated || loading) {
      return;
    }

    setLoading(true);

    try {
      if (favourited) {
        await favouriteService.removeFromFavourites(
          productId
        );

        setFavourited(false);
      } else {
        await favouriteService.addToFavourites(
          productId
        );

        setFavourited(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || checking}
      aria-label={
        favourited
          ? "Remove from Favourites"
          : "Add to Favourites"
      }
      title={
        favourited
          ? "Remove from Favourites"
          : "Add to Favourites"
      }
      className="
        inline-flex
        h-11
        w-11
        items-center
        justify-center
        rounded-md
        border
        border-(--color-border)
        text-(--color-text)
        transition-opacity
        hover:opacity-60
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      <Heart
        size={20}
        strokeWidth={1.8}
        fill={
          favourited
            ? "currentColor"
            : "none"
        }
      />
    </button>
  );
}