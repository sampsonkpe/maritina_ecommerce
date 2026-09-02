from django.db import models

from apps.checkout.models import CheckoutTransaction
from apps.orders.models import Order


class Payment(models.Model):

    STATUS_INITIATED = "INITIATED"
    STATUS_SUCCESS = "SUCCESS"
    STATUS_FAILED = "FAILED"
    STATUS_REFUND_PENDING = "REFUND_PENDING"
    STATUS_REFUNDED = "REFUNDED"
    STATUS_REFUND_FAILED = "REFUND_FAILED"

    STATUS_CHOICES = [
        (STATUS_INITIATED, "Initiated"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
        (STATUS_REFUND_PENDING, "Refund Pending"),
        (STATUS_REFUNDED, "Refunded"),
        (STATUS_REFUND_FAILED, "Refund Failed"),
    ]

    checkout = models.ForeignKey(
        CheckoutTransaction,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="payments",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    refund_reference = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        unique=True,
    )

    refunded_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    refunded_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_INITIATED,
    )

    provider = models.CharField(
        max_length=50,
        default="paystack",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Payment {self.reference}"


class Refund(models.Model):

    STATUS_PENDING = "PENDING"
    STATUS_PROCESSING = "PROCESSING"
    STATUS_NEEDS_ATTENTION = "NEEDS_ATTENTION"
    STATUS_PROCESSED = "PROCESSED"
    STATUS_FAILED = "FAILED"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_NEEDS_ATTENTION, "Needs Attention"),
        (STATUS_PROCESSED, "Processed"),
        (STATUS_FAILED, "Failed"),
    ]

    payment = models.ForeignKey(
        Payment,
        on_delete=models.PROTECT,
        related_name="refunds",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="refunds",
    )

    paystack_refund_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        unique=True,
    )

    refund_reference = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        unique=True,
    )

    transaction_reference = models.CharField(
        max_length=100,
        db_index=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    processed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return (
            f"Refund {self.refund_reference or self.id} "
            f"for Payment {self.payment.reference}"
        )