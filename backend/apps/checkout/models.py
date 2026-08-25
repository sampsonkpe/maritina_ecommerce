from django.conf import settings
from django.db import models


class CheckoutTransaction(models.Model):

    STATUS_PENDING = "PENDING"
    STATUS_PAID = "PAID"
    STATUS_FINALISED = "FINALISED"
    STATUS_FAILED = "FAILED"
    STATUS_CANCELLED = "CANCELLED"
    STATUS_EXPIRED = "EXPIRED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_FINALISED, "Finalised"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXPIRED, "Expired"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checkout_transactions",
    )

    session_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )

    delivery_type = models.CharField(
        max_length=20,
    )

    delivery_address = models.TextField(
        blank=True,
    )

    address_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )

    subtotal = models.IntegerField(
        default=0,
    )

    delivery_fee = models.IntegerField(
        default=0,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    guest_full_name = models.CharField(
        max_length=255,
        blank=True,
    )

    guest_email = models.EmailField(
        blank=True,
    )

    guest_phone = models.CharField(
        max_length=20,
        blank=True,
    )

    expires_at = models.DateTimeField(
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["status", "expires_at"]
            ),
            models.Index(
                fields=["user", "status"]
            ),
            models.Index(
                fields=["session_id", "status"]
            ),
            models.Index(
                fields=["created_at"]
            ),
        ]

    def __str__(self):
        return f"Checkout #{self.id}"

    @property
    def is_pending(self):
        return self.status == self.STATUS_PENDING

    @property
    def is_paid(self):
        return self.status == self.STATUS_PAID

    @property
    def is_finalised(self):
        return self.status == self.STATUS_FINALISED


class CheckoutTransactionItem(models.Model):

    checkout = models.ForeignKey(
        CheckoutTransaction,
        on_delete=models.CASCADE,
        related_name="items",
    )

    variant_id = models.PositiveBigIntegerField()

    product_name = models.CharField(
        max_length=255,
    )

    variant_name = models.CharField(
        max_length=255,
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    class Meta:
        verbose_name = "Checkout Transaction Item"
        verbose_name_plural = "Checkout Transaction Items"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "checkout",
                    "variant_id",
                ],
                name="unique_checkout_variant",
            ),
        ]

    def __str__(self):
        return (
            f"Checkout #{self.checkout_id} - "
            f"{self.product_name} "
            f"({self.variant_name})"
        )

class StockReservation(models.Model):

    checkout = models.ForeignKey(
        CheckoutTransaction,
        on_delete=models.CASCADE,
        related_name="stock_reservations",
    )

    variant_id = models.PositiveBigIntegerField()

    quantity = models.PositiveIntegerField()

    expires_at = models.DateTimeField(
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "checkout",
                    "variant_id",
                ],
                name="unique_stock_reservation",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "variant_id",
                    "expires_at",
                ]
            ),
            models.Index(
                fields=[
                    "checkout",
                    "expires_at",
                ]
            ),
        ]

    def __str__(self):
        return (
            f"Reservation #{self.id} - "
            f"Checkout #{self.checkout_id}"
        )