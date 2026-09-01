from django.db import IntegrityError

from .models import FavouriteItem
from apps.products.models import ProductVariant


class FavouriteService:

    @staticmethod
    def list_items(user):
        return (
            FavouriteItem.objects
            .filter(user=user)
            .select_related(
                "variant",
                "variant__product",
                "variant__product__category",
            )
        )

    @staticmethod
    def add_item(
        *,
        user,
        variant_id,
    ):
        try:
            variant = (
                ProductVariant.objects
                .select_related("product")
                .get(id=variant_id)
            )
        except ProductVariant.DoesNotExist:
            raise ValueError(
                "Product variant not found."
            )

        try:
            item, created = (
                FavouriteItem.objects.get_or_create(
                    user=user,
                    variant=variant,
                )
            )
        except IntegrityError:
            item = FavouriteItem.objects.get(
                user=user,
                variant=variant,
            )
            created = False

        return item, created

    @staticmethod
    def remove_item(
        *,
        user,
        variant_id,
    ):
        deleted, _ = (
            FavouriteItem.objects.filter(
                user=user,
                variant_id=variant_id,
            ).delete()
        )

        if not deleted:
            raise ValueError(
                "Product variant is not in your Favourites."
            )

        return True