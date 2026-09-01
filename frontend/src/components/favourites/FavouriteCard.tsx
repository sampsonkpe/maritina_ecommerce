import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import type { FavouriteItem } from "../../types/favourite";

import { favouriteService } from "../../services/favouriteService";
import { useCart } from "../../context/CartContext";

interface FavouriteCardProps {
  item: FavouriteItem;
  onRemove: (variantId: number) => void;
}

export default function FavouriteCard({
  item,
  onRemove,
}: FavouriteCardProps) {
  const { addToCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);

    try {
      await favouriteService.removeFromFavourites(
        item.variant.id
      );

      onRemove(item.variant.id);
    } catch (error) {
      console.error(error);
    } finally {
      setRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (
      adding ||
      added ||
      !item.variant.is_available
    ) {
      return;
    }

    setAdding(true);

    try {
      await addToCart(
        item.variant.id,
        1
      );

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className="
        flex
        gap-5
        rounded-md
        border
        border-(--color-border)
        p-5
      "
    >
      <Link
        to={`/products/${item.variant.product_id}`}
        className="
          flex
          h-32
          w-32
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-md
          border
          border-(--color-border)
        "
      >
        {item.variant.product_image ? (
          <img
            src={item.variant.product_image}
            alt={item.variant.product_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            No image
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/products/${item.variant.product_id}`}
              className="
                block
                font-semibold
                hover:opacity-60
              "
            >
              {item.variant.product_name}
            </Link>

            <p className="mt-2 text-sm text-(--color-text-muted)">
              {item.variant.name}
            </p>

            <p className="mt-2 font-semibold">
              GHS {item.variant.price}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${item.variant.product_name} ${item.variant.name} from Favourites`}
            title="Remove from Favourites"
            className="
              inline-flex
              h-10
              w-10
              shrink-0
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
              size={19}
              strokeWidth={1.8}
              fill="currentColor"
            />
          </button>
        </div>

        <div className="mt-auto pt-5">
          {item.variant.is_available ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || added}
              className="
                inline-flex
                rounded-md
                bg-(--color-text)
                px-5
                py-2.5
                text-sm
                text-(--color-background)
                transition-opacity
                hover:opacity-80
                disabled:cursor-default
                disabled:opacity-70
              "
            >
              {added
                ? "Added to Cart"
                : adding
                  ? "Adding..."
                  : "Add to Cart"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="
                inline-flex
                cursor-not-allowed
                rounded-md
                border
                border-(--color-border)
                px-5
                py-2.5
                text-sm
                text-(--color-text-muted)
              "
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </article>
  );
}