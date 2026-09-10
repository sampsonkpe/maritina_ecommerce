import logging
from decimal import Decimal

from django.db import models, transaction
from django.utils import timezone

from ...models import Payment, Refund

from .paystack_utils import map_refund_status


logger = logging.getLogger(__name__)


class PaystackRefundStateMixin:

    @staticmethod
    def _map_refund_status(status):
        return map_refund_status(status, Refund)

    @transaction.atomic
    def _sync_payment_refund_state(self, payment):
        payment = (
            Payment.objects
            .select_for_update()
            .select_related("order")
            .get(pk=payment.pk)
        )

        processed_total = (
            payment.refunds
            .filter(
                status=Refund.STATUS_PROCESSED
            )
            .aggregate(
                total=models.Sum("amount")
            )["total"]
            or Decimal("0")
        )

        pending_exists = payment.refunds.filter(
            status__in=[
                Refund.STATUS_PENDING,
                Refund.STATUS_PROCESSING,
                Refund.STATUS_NEEDS_ATTENTION,
            ]
        ).exists()

        failed_exists = payment.refunds.filter(
            status=Refund.STATUS_FAILED
        ).exists()

        latest_refund = (
            payment.refunds
            .exclude(
                refund_reference__isnull=True
            )
            .exclude(
                refund_reference=""
            )
            .order_by("-created_at")
            .first()
        )

        payment.refunded_amount = processed_total

        payment.refund_reference = (
            latest_refund.refund_reference
            if latest_refund
            else None
        )

        update_fields = [
            "refunded_amount",
            "refund_reference",
            "updated_at",
        ]

        if processed_total >= payment.amount:
            payment.status = Payment.STATUS_REFUNDED

            if payment.refunded_at is None:
                payment.refunded_at = timezone.now()

            update_fields.extend([
                "status",
                "refunded_at",
            ])

        elif pending_exists:
            payment.status = Payment.STATUS_REFUND_PENDING
            update_fields.append("status")

        elif failed_exists:
            payment.status = Payment.STATUS_REFUND_FAILED
            update_fields.append("status")

        else:
            payment.status = Payment.STATUS_SUCCESS
            update_fields.append("status")

        payment.save(
            update_fields=update_fields
        )

        if processed_total >= payment.amount:
            cancellation_refund_exists = (
                payment.refunds
                .filter(
                    is_cancellation_refund=True,
                    status=Refund.STATUS_PROCESSED,
                )
                .exists()
            )

            if cancellation_refund_exists:
                self._complete_order_cancellation(
                    payment
                )

    @staticmethod
    def _complete_order_cancellation(payment):
        if not payment.order_id:
            return

        from apps.common.constants import (
            STATUS_CANCELLED,
            PAYMENT_REFUNDED,
        )
        from apps.orders.models import (
            Order,
            OrderStatusHistory,
        )

        order = (
            Order.objects
            .select_for_update()
            .get(pk=payment.order_id)
        )

        if order.payment_status != PAYMENT_REFUNDED:
            order.payment_status = PAYMENT_REFUNDED

        if order.status == STATUS_CANCELLED:
            order.save(
                update_fields=[
                    "payment_status",
                    "updated_at",
                ]
            )
            return

        old_status = order.status

        order.status = STATUS_CANCELLED

        order.save(
            update_fields=[
                "status",
                "payment_status",
                "updated_at",
            ]
        )

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=STATUS_CANCELLED,
            updated_by=None,
        )

        logger.info(
            "Order #%s cancelled after successful refund "
            "for payment %s.",
            order.id,
            payment.reference,
        )