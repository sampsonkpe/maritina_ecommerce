import logging
from decimal import Decimal

from django.db import models, transaction
from django.utils import timezone

from apps.common.constants import (
    PAYMENT_REFUNDED,
    STATUS_CANCELLED,
)

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

        # Update the associated order after a full refund.

        if (
            processed_total >= payment.amount
            and payment.order_id
        ):

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

            # Only cancellation refunds can trigger
            # cancellation of the order.

            cancellation_refund = (
                payment.refunds
                .filter(
                    is_cancellation_refund=True,
                    status=Refund.STATUS_PROCESSED,
                )
                .order_by("-processed_at", "-created_at")
                .first()
            )

            order_update_fields = [
                "payment_status",
                "updated_at",
            ]

            if (
                cancellation_refund
                and order.status != STATUS_CANCELLED
            ):

                old_status = order.status

                order.status = STATUS_CANCELLED

                OrderStatusHistory.objects.create(
                    order=order,
                    old_status=old_status,
                    new_status=STATUS_CANCELLED,
                    updated_by=cancellation_refund.initiated_by,
                )

                order_update_fields.append("status")

            order.save(
                update_fields=order_update_fields
            )

        logger.info(
            "Synced refund state for payment %s. "
            "Processed=%s Status=%s",
            payment.reference,
            processed_total,
            payment.status,
        )