from django.db import models
from django.conf import settings
from apps.products.models import ProductVariant


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    session_id = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.user:
            return f"Cart({self.user})"
        return f"Cart(Session: {self.session_id})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name_plural = "Cart Items"

    def __str__(self):
        return f"{self.variant} x {self.quantity}"

    @property
    def total_price(self):
        return self.variant.price * self.quantity