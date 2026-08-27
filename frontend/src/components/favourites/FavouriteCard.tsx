import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import type { FavouriteItem } from "../../types/favourite";
import { favouriteService } from "../../services/favouriteService";

interface FavouriteCardProps {
  item: FavouriteItem;
  onRemove: (productId: number) => void;
}

export default function FavouriteCard({
  item,
  onRemove,
}: FavouriteCardProps) {
  const handleRemove = async () => {
    try {
      await favouriteService.removeFromFavourites(
        item.product.id
      );

      onRemove(item.product.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-md border border-(--color-border) p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/products/${item.product.id}`}
            className="block font-semibold hover:opacity-60"
          >
            {item.product.name}
          </Link>

          <p className="mt-2 text-sm text-(--color-text-muted)">
            {item.product.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${item.product.name} from Favourites`}
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
          "
        >
          <Heart
            size={19}
            strokeWidth={1.8}
            fill="currentColor"
          />
        </button>
      </div>

      {item.product.variants.length > 0 && (
        <div className="mt-4 space-y-2">
          {item.product.variants.map((variant) => (
            <div
              key={variant.id}
              className="
                flex
                justify-between
                rounded-md
                border
                border-(--color-border)
                p-2
                text-sm
              "
            >
              <span>{variant.name}</span>

              <span>
                GHS {variant.price}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}