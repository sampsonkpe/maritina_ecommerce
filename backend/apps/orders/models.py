from django.db import models
from django.conf import settings

from apps.common.constants import (
    STATUS_PENDING,
    STATUS_PREPARING,
    STATUS_OUT_FOR_DELIVERY,
    STATUS_DELIVERED,
    STATUS_CANCELLED,
    FULFILMENT_STATUS_CHOICES,
    PAYMENT_PENDING,
    PAYMENT_PAID,
    PAYMENT_FAILED,
    PAYMENT_REFUNDED,
    PAYMENT_STATUS_CHOICES,
    DELIVERY,
    PICKUP,
    DELIVERY_TYPE_CHOICES,
)

class Order(models.Model):
    # Compatibility aliases (to be removed after refactor)

    STATUS_PENDING = STATUS_PENDING
    STATUS_PREPARING = STATUS_PREPARING
    STATUS_OUT_FOR_DELIVERY = STATUS_OUT_FOR_DELIVERY
    STATUS_DELIVERED = STATUS_DELIVERED
    STATUS_CANCELLED = STATUS_CANCELLED

    PAYMENT_PENDING = PAYMENT_PENDING
    PAYMENT_PAID = PAYMENT_PAID
    PAYMENT_FAILED = PAYMENT_FAILED
    PAYMENT_REFUNDED = PAYMENT_REFUNDED

    DELIVERY = DELIVERY
    PICKUP = PICKUP
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    subtotal = models.IntegerField(default=0)

    delivery_fee = models.IntegerField(default=0)

    total_amount = models.IntegerField(default=0)

    status = models.CharField(
        max_length=30,
        choices=FULFILMENT_STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_PENDING,
    )

    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivery_type = models.CharField(
        max_length=20,
        choices=DELIVERY_TYPE_CHOICES,
        default=DELIVERY,
    )

    address = models.ForeignKey(
        "addresses.Address",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Order #{self.id}"
    

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_name = models.CharField(max_length=255)

    variant_name = models.CharField(max_length=255, null=True, blank=True)

    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)


    class Meta:
        verbose_name_plural = "Order Items"

    def __str__(self):
        return (
            f"{self.product_name} "
            f"({self.variant_name} "
            f"x {self.quantity})"
        )
    
class OrderStatusHistory(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history"
    )

    old_status = models.CharField(
        max_length=30
    )

    new_status = models.CharField(
        max_length=30
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        verbose_name = "Order Status History"
        verbose_name_plural = "Order Status Histories"

    def __str__(self):
        return (
            f"Order #{self.order.id}: "
            f"{self.old_status} → "
            f"{self.new_status}"
        )