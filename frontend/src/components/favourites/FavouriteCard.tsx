import { useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { favouriteService } from "../../services/favouriteService";

import OptimizedImage from "../common/OptimizedImage";

import type { FavouriteItem } from "../../types/favourite";

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
    if (removing) {
      return;
    }

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
      await addToCart(item.variant.id, 1);

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
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-4xl
        border
        border-(--color-border)
        bg-(--color-background)
      "
    >
      {/* Product image */}
      <Link
        to={`/products/${item.variant.product_id}`}
        className="
          relative
          aspect-square
          shrink-0
          overflow-hidden
          bg-(--color-surface-muted)
        "
      >
        {item.variant.product_image ? (
          <OptimizedImage
            src={item.variant.product_image}
            alt={item.variant.product_name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-(--color-text-muted)">
              No image available
            </span>
          </div>
        )}
      </Link>

      {/* Remove from favourites */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        aria-label={`Remove ${item.variant.product_name} ${item.variant.name} from Favourites`}
        title="Remove from Favourites"
        className="
          absolute
          right-5
          top-5
          inline-flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-(--color-border)
          bg-(--color-background)
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
          aria-hidden="true"
        />
      </button>

      {/* Product information */}
      <div
        className="
          flex
          flex-1
          flex-col
          items-center
          p-6
          text-center
          sm:p-7
        "
      >
        <Link
          to={`/products/${item.variant.product_id}`}
          className="
            text-base
            font-semibold
            tracking-tight
            transition-opacity
            hover:opacity-60
            sm:text-lg
          "
        >
          {item.variant.product_name}
        </Link>

        <p className="mt-1 text-sm text-(--color-text-muted)">
          {item.variant.name}
        </p>

        <p className="mt-5 text-sm font-semibold">
          GHS {item.variant.price}
        </p>

        {/* Cart action */}
        <div className="mt-5 flex w-full justify-center">
          {item.variant.is_available ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || added}
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-(--color-border)
                px-6
                py-3
                text-sm
                font-medium
                transition-colors
                hover:bg-(--color-surface-muted)
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {added
                ? "Added to Cart"
                : adding
                  ? "Adding..."
                  : "Add to Cart"}

              {!adding && !added && (
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="
                inline-flex
                cursor-not-allowed
                items-center
                justify-center
                rounded-full
                border
                border-(--color-border)
                px-6
                py-3
                text-sm
                font-medium
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