from django.db import models
from django.conf import settings

from apps.products.models import (
    Product,
    ProductVariant,
)


class Review(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "variant",
                ],
                name="unique_review_per_variant",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.product.name} - "
            f"{self.variant.name}"
        )