from django.conf import settings
from django.db import models


class AuditLog(models.Model):

    ACTION_REFUND_INITIATED = "REFUND_INITIATED"
    ACTION_ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED"
    ACTION_ORDER_CANCELLED = "ORDER_CANCELLED"
    ACTION_ORDER_REVERSED = "ORDER_REVERSED"

    ACTION_CHOICES = [
        (
            ACTION_REFUND_INITIATED,
            "Refund initiated",
        ),
        (
            ACTION_ORDER_STATUS_CHANGED,
            "Order status changed",
        ),
        (
            ACTION_ORDER_CANCELLED,
            "Order cancelled",
        ),
        (
            ACTION_ORDER_REVERSED,
            "Order reversed",
        ),
    ]

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
    )

    object_type = models.CharField(
        max_length=50,
    )

    object_id = models.PositiveIntegerField()

    details = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["action", "created_at"],
            ),
            models.Index(
                fields=["object_type", "object_id"],
            ),
            models.Index(
                fields=["admin", "created_at"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.action} "
            f"{self.object_type}#{self.object_id}"
        )