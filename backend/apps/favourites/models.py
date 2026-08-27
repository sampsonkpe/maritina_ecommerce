from django.db import models
from django.conf import settings

from apps.products.models import Product


class FavouriteItem(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favourite_items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="favourite_items",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_favourite_item",
            ),
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.product.name}"
        )
