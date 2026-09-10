import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from ...models import Payment, Refund


logger = logging.getLogger(__name__)


class PaystackWebhooksMixin:

    def webhook(self, payload):
        event = payload.get("event")
        data = payload.get("data", {})

        if event == "charge.success":
            reference = data.get("reference")

            if reference:
                self.mark_as_paid(
                    reference,
                    transaction_data=data,
                )

            return

        if event == "charge.failed":
            reference = data.get("reference")

            if reference:
                self.mark_as_failed(reference)

            return

        if event in {
            "refund.pending",
            "refund.processing",
            "refund.needs-attention",
            "refund.failed",
            "refund.processed",
        }:
            self.handle_refund_webhook(
                event,
                data,
            )

    @transaction.atomic
    def handle_refund_webhook(self, event, data):
        transaction_reference = data.get(
            "transaction_reference"
        )

        if not transaction_reference:
            logger.warning(
                "Paystack refund webhook missing "
                "transaction_reference."
            )
            return

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("order")
                .get(
                    reference=transaction_reference,
                    provider="paystack",
                )
            )

        except Payment.DoesNotExist:
            logger.warning(
                "No local Paystack payment found for "
                "refund transaction %s.",
                transaction_reference,
            )
            return

        paystack_amount = data.get("amount")

        if paystack_amount is None:
            logger.warning(
                "Paystack refund webhook missing amount "
                "for transaction %s.",
                transaction_reference,
            )
            return

        amount = (
            Decimal(str(paystack_amount))
            / Decimal("100")
        )

        status = self._map_refund_status(
            data.get("status")
        )

        refund = self._find_refund_for_webhook(
            payment,
            data,
        )

        if refund is None:
            refund = Refund.objects.create(
                payment=payment,
                order=payment.order,
                paystack_refund_id=data.get("id"),
                refund_reference=data.get(
                    "refund_reference"
                ),
                transaction_reference=(
                    transaction_reference
                ),
                amount=amount,
                status=status,
            )

        else:
            if data.get("id"):
                refund.paystack_refund_id = data["id"]

            if data.get("refund_reference"):
                refund.refund_reference = (
                    data["refund_reference"]
                )

            refund.amount = amount
            refund.status = status

        if (
            status == Refund.STATUS_PROCESSED
            and refund.processed_at is None
        ):
            refund.processed_at = timezone.now()

        refund.save()

        self._sync_payment_refund_state(
            payment
        )

        logger.info(
            "Processed Paystack refund webhook: "
            "payment=%s refund=%s status=%s amount=%s",
            payment.reference,
            refund.refund_reference
            or refund.paystack_refund_id
            or refund.id,
            refund.status,
            refund.amount,
        )

    @staticmethod
    def _find_refund_for_webhook(payment, data):
        refund_reference = data.get(
            "refund_reference"
        )

        if refund_reference:
            refund = (
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    refund_reference=refund_reference,
                )
                .first()
            )

            if refund:
                return refund

        paystack_refund_id = data.get("id")

        if paystack_refund_id:
            refund = (
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    paystack_refund_id=paystack_refund_id,
                )
                .first()
            )

            if refund:
                return refund

        transaction_reference = data.get(
            "transaction_reference"
        )

        amount = data.get("amount")

        if (
            transaction_reference
            and amount is not None
        ):
            amount_major = (
                Decimal(str(amount))
                / Decimal("100")
            )

            return (
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    transaction_reference=transaction_reference,
                    amount=amount_major,
                    status__in=[
                        Refund.STATUS_PENDING,
                        Refund.STATUS_PROCESSING,
                        Refund.STATUS_NEEDS_ATTENTION,
                    ],
                )
                .order_by("-created_at")
                .first()
            )

        return None