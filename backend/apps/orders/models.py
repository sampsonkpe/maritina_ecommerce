from django.db import models
from django.conf import settings


class Order(models.Model):

    STATUS_PENDING = "PENDING"
    STATUS_PAYMENT_IN_PROGRESS = "PAYMENT_IN_PROGRESS"
    STATUS_PAID = "PAID"
    STATUS_PREPARING = "PREPARING"
    STATUS_OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    STATUS_DELIVERED = "DELIVERED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAYMENT_IN_PROGRESS, "Payment In Progress"),
        (STATUS_PAID, "Paid"),
        (STATUS_PREPARING, "Preparing"),
        (STATUS_OUT_FOR_DELIVERY, "Out for Delivery"),
        (STATUS_DELIVERED, "Delivered"),
    ]

    DELIVERY = "DELIVERY"
    PICKUP = "PICKUP"

    DELIVERY_CHOICES = [
        (DELIVERY, "Delivery"),
        (PICKUP, "Pickup"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    subtotal = models.IntegerField(default=0)

    delivery_fee = models.IntegerField(default=0)

    total_amount = models.IntegerField(default=0)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )

    delivery_type = models.CharField(
        max_length=20,
        choices=DELIVERY_CHOICES,
        default=DELIVERY
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