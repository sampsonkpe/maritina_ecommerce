from django.db import IntegrityError

from .models import WishlistItem
from apps.products.models import Product


class WishlistService:

    @staticmethod
    def list_items(user):
        return (
            WishlistItem.objects
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
                WishlistItem.objects.get_or_create(
                    user=user,
                    product=product,
                )
            )
        except IntegrityError:
            item = WishlistItem.objects.get(
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
            WishlistItem.objects.filter(
                user=user,
                product_id=product_id,
            ).delete()
        )

        if not deleted:
            raise ValueError(
                "Product is not in your wishlist."
            )

        return True