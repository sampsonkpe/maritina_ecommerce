from django.db import IntegrityError

from .models import FavouriteItem
from apps.products.models import Product


class FavouriteService:

    @staticmethod
    def list_items(user):
        return (
            FavouriteItem.objects
            .filter(user=user)
            .select_related(
                "product",
                "product__category",
            )
            .prefetch_related(
                "product__variants",
            )
        )

    @staticmethod
    def add_item(
        *,
        user,
        product_id,
    ):
        try:
            product = Product.objects.get(
                id=product_id,
            )
        except Product.DoesNotExist:
            raise ValueError(
                "Product not found."
            )

        try:
            item, created = (
                FavouriteItem.objects.get_or_create(
                    user=user,
                    product=product,
                )
            )
        except IntegrityError:
            item = FavouriteItem.objects.get(
                user=user,
                product=product,
            )
            created = False

        return item, created

    @staticmethod
    def remove_item(
        *,
        user,
        product_id,
    ):
        deleted, _ = (
            FavouriteItem.objects.filter(
                user=user,
                product_id=product_id,
            ).delete()
        )

        if not deleted:
            raise ValueError(
                "Product is not in your Favourites."
            )

        return True
