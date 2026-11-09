import logging
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone

from ...models import Payment, Refund


logger = logging.getLogger(__name__)


class PaystackWebhooksMixin:

    REFUND_EVENT_STATUSES = {
        "refund.pending": Refund.STATUS_PENDING,
        "refund.processing": Refund.STATUS_PROCESSING,
        "refund.needs-attention": Refund.STATUS_NEEDS_ATTENTION,
        "refund.failed": Refund.STATUS_FAILED,
        "refund.processed": Refund.STATUS_PROCESSED,
    }

    def webhook(self, payload):
        event = payload.get("event")
        data = payload.get("data", {})

        if not isinstance(data, dict):
            logger.warning("Invalid Paystack webhook data.")
            return

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

        if event in self.REFUND_EVENT_STATUSES:
            self.handle_refund_webhook(event, data)

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

        try:
            raw_amount = Decimal(str(data.get("amount")))

            if not raw_amount.is_finite() or raw_amount <= 0:
                raise InvalidOperation

            amount = (
                raw_amount / Decimal("100")
            ).quantize(Decimal("0.01"))

        except (
            InvalidOperation,
            TypeError,
            ValueError,
        ):
            logger.error(
                "Invalid refund amount in Paystack webhook. "
                "Payment=%s Amount=%s",
                payment.reference,
                data.get("amount"),
            )
            return

        status = self.REFUND_EVENT_STATUSES[event]

        payload_status = data.get("status")

        if payload_status and payload_status != status.lower().replace(
            "_", "-"
        ):
            logger.warning(
                "Paystack refund event/status mismatch. "
                "Event=%s Payload status=%s",
                event,
                payload_status,
            )

        refund_reference = (
            data.get("refund_reference")
            or data.get("reference")
        )

        paystack_refund_id = data.get("id")

        refund, ambiguous = self._find_refund_for_webhook(
            payment=payment,
            transaction_reference=transaction_reference,
            amount=amount,
            incoming_status=status,
            refund_reference=refund_reference,
            paystack_refund_id=paystack_refund_id,
        )

        if ambiguous:
            logger.error(
                "Ambiguous Paystack refund webhook. "
                "Payment=%s Amount=%s. Event not applied.",
                payment.reference,
                amount,
            )
            return

        if refund is None:
            pending_cancellations = list(
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    is_cancellation_refund=True,
                    status__in=[
                        Refund.STATUS_PENDING,
                        Refund.STATUS_PROCESSING,
                        Refund.STATUS_NEEDS_ATTENTION,
                    ],
                )[:2]
            )

            if pending_cancellations:
                logger.error(
                    "Could not safely match webhook to an "
                    "outstanding cancellation refund. "
                    "Payment=%s Amount=%s",
                    payment.reference,
                    amount,
                )
                return

            refund = Refund.objects.create(
                payment=payment,
                order=payment.order,
                paystack_refund_id=paystack_refund_id,
                refund_reference=refund_reference,
                transaction_reference=transaction_reference,
                amount=amount,
                status=status,
                is_cancellation_refund=False,
                processed_at=(
                    timezone.now()
                    if status == Refund.STATUS_PROCESSED
                    else None
                ),
            )

        else:
            if refund.amount != amount:
                logger.error(
                    "Paystack refund amount mismatch. "
                    "Payment=%s Refund=%s Local=%s Webhook=%s. "
                    "Event not applied.",
                    payment.reference,
                    refund.id,
                    refund.amount,
                    amount,
                )
                return

            if (
                refund_reference
                and refund.refund_reference
                and refund.refund_reference != refund_reference
            ):
                logger.error(
                    "Paystack refund reference mismatch. "
                    "Refund=%s Local=%s Webhook=%s",
                    refund.id,
                    refund.refund_reference,
                    refund_reference,
                )
                return

            if (
                paystack_refund_id
                and refund.paystack_refund_id
                and refund.paystack_refund_id != paystack_refund_id
            ):
                logger.error(
                    "Paystack refund ID mismatch. Refund=%s",
                    refund.id,
                )
                return

            if paystack_refund_id:
                refund.paystack_refund_id = paystack_refund_id

            if refund_reference:
                refund.refund_reference = refund_reference

            if self._can_update_refund_status(
                refund.status,
                status,
            ):
                refund.status = status

                if (
                    status == Refund.STATUS_PROCESSED
                    and refund.processed_at is None
                ):
                    refund.processed_at = timezone.now()

            else:
                logger.info(
                    "Ignoring stale Paystack refund event. "
                    "Refund=%s Current=%s Incoming=%s",
                    refund.id,
                    refund.status,
                    status,
                )

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
    def _can_update_refund_status(current_status, incoming_status):
        if current_status in {
            Refund.STATUS_PROCESSED,
            Refund.STATUS_FAILED,
        }:
            return current_status == incoming_status

        if (
            incoming_status == Refund.STATUS_PENDING
            and current_status != Refund.STATUS_PENDING
        ):
            return False

        return True

    @staticmethod
    def _find_refund_for_webhook(
        payment,
        transaction_reference,
        amount,
        incoming_status,
        refund_reference=None,
        paystack_refund_id=None,
    ):
        """
        Match a Paystack webhook to an existing local refund.

        Matching priority:
        1. Refund reference.
        2. Paystack refund ID.
        3. Unique transaction reference and amount.
        """

        if refund_reference:
            refund = (
                Refund.objects
                .select_for_update()
                .filter(refund_reference=refund_reference)
                .first()
            )

            if refund:
                if refund.payment_id != payment.id:
                    logger.error(
                        "Refund reference belongs to a "
                        "different payment: %s",
                        refund_reference,
                    )
                    return None, True

                return refund, False

        if paystack_refund_id:
            refund = (
                Refund.objects
                .select_for_update()
                .filter(paystack_refund_id=paystack_refund_id)
                .first()
            )

            if refund:
                if refund.payment_id != payment.id:
                    logger.error(
                        "Paystack refund ID belongs to a "
                        "different payment: %s",
                        paystack_refund_id,
                    )
                    return None, True

                return refund, False

        matching_query = (
            Refund.objects
            .select_for_update()
            .filter(
                payment=payment,
                transaction_reference=transaction_reference,
                amount=amount,
            )
        )

        if incoming_status not in {
            Refund.STATUS_PROCESSED,
            Refund.STATUS_FAILED,
        }:
            matching_query = matching_query.exclude(
                status__in=[
                    Refund.STATUS_PROCESSED,
                    Refund.STATUS_FAILED,
                ]
            )

        matching_refunds = list(
            matching_query.order_by("-created_at")[:2]
        )

        if len(matching_refunds) == 1:
            return matching_refunds[0], False

        if len(matching_refunds) > 1:
            logger.warning(
                "Multiple local refunds match Paystack "
                "transaction %s and amount %s.",
                transaction_reference,
                amount,
            )
            return None, True

        return None, False