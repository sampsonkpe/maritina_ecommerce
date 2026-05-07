from django.db import models
from apps.orders.models import Order


class Payment(models.Model):

    STATUS_INITIATED = "INITIATED"
    STATUS_SUCCESS = "SUCCESS"
    STATUS_FAILED = "FAILED"

    STATUS_CHOICES = [
        (STATUS_INITIATED, "Initiated"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")

    reference = models.CharField(max_length=100, unique=True)
    amount = models.IntegerField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_INITIATED)

    provider = models.CharField(max_length=50, default="paystack")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.reference}"