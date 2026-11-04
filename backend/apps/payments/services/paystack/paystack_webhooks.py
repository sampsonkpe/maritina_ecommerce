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
            pending_statuses = [
                Refund.STATUS_PENDING,
                Refund.STATUS_PROCESSING,
                Refund.STATUS_NEEDS_ATTENTION,
            ]

            # Check for an outstanding cancellation refund
            # that may not have matched the webhook identifiers.
            cancellation_refunds = list(
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    is_cancellation_refund=True,
                    status__in=pending_statuses,
                )
                .order_by("-created_at")[:2]
            )

            if len(cancellation_refunds) == 1:
                candidate = cancellation_refunds[0]

                if candidate.amount != amount:
                    logger.error(
                        "Paystack refund amount mismatch for "
                        "cancellation refund. Payment=%s "
                        "Local refund=%s Webhook amount=%s. "
                        "Webhook event was not applied.",
                        payment.reference,
                        candidate.amount,
                        amount,
                    )
                    return

                refund = candidate

                logger.info(
                    "Matched Paystack webhook to outstanding "
                    "cancellation refund using payment and "
                    "amount. Payment=%s Refund=%s",
                    payment.reference,
                    refund.id,
                )

            elif len(cancellation_refunds) > 1:
                logger.error(
                    "Ambiguous Paystack refund webhook: "
                    "multiple outstanding cancellation refunds "
                    "exist for payment %s. Event was not applied.",
                    payment.reference,
                )
                return

            else:
                # No outstanding local cancellation refund exists.
                # This may be a refund initiated outside our application.
                refund = Refund.objects.create(
                    payment=payment,
                    order=payment.order,
                    paystack_refund_id=data.get("id"),
                    refund_reference=data.get(
                        "refund_reference"
                    ),
                    transaction_reference=transaction_reference,
                    amount=amount,
                    status=status,
                    is_cancellation_refund=False,
                )

        # Update the matched or newly created refund.
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

        self._sync_payment_refund_state(payment)

        logger.info(
            "Processed Paystack refund webhook: "
            "payment=%s refund=%s status=%s amount=%s "
            "cancellation_refund=%s",
            payment.reference,
            refund.refund_reference
            or refund.paystack_refund_id
            or refund.id,
            refund.status,
            refund.amount,
            refund.is_cancellation_refund,
        )

    @staticmethod
    def _find_refund_for_webhook(payment, data):
        """
        Match a Paystack webhook to an existing local Refund.

        Matching priority:
        1. Paystack refund reference.
        2. Paystack refund ID.
        3. Unique transaction reference and amount match.

        The final fallback includes processed refunds to
        support webhook retries and prevent duplicate records.
        """

        refund_reference = data.get("refund_reference")

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

        paystack_amount = data.get("amount")

        if (
            not transaction_reference
            or paystack_amount is None
        ):
            return None

        amount = (
            Decimal(str(paystack_amount))
            / Decimal("100")
        )

        matching_refunds = list(
            Refund.objects
            .select_for_update()
            .filter(
                payment=payment,
                transaction_reference=transaction_reference,
                amount=amount,
            )
            .order_by("-created_at")[:2]
        )

        if len(matching_refunds) == 1:
            return matching_refunds[0]

        if len(matching_refunds) > 1:
            logger.warning(
                "Multiple local refunds match Paystack "
                "transaction %s and amount %s. "
                "Additional identifiers are required.",
                transaction_reference,
                amount,
            )

        return None