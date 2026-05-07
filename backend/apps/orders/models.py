from django.db import models
from django.conf import settings


class Order(models.Model):

    STATUS_PENDING = "PENDING"
    STATUS_PAID = "PAID"
    STATUS_PREPARING = "PREPARING"
    STATUS_OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    STATUS_DELIVERED = "DELIVERED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
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

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_amount = models.IntegerField()

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_PENDING)
    delivery_type = models.CharField(max_length=30, choices=DELIVERY_CHOICES, default=DELIVERY)

    address = models.ForeignKey("addresses.Address", on_delete=models.SET_NULL, null=True, blank=True)
    delivery_fee = models.IntegerField(default=0)  # calculated based on address

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")

    product_name = models.CharField(max_length=255)
    product_price = models.IntegerField()
    quantity = models.IntegerField()
    subtotal = models.IntegerField()

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
    
class Meta:
    indexes = [
        models.Index(fields=["user", "status"]),
        models.Index(fields=["created_at"]),
    ]