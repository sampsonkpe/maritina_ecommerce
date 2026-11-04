import logging
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from ...models import Payment, Refund
from .paystack_client import PaystackRequestUncertain


logger = logging.getLogger(__name__)


class PaystackRefundsMixin:

    @transaction.atomic
    def refund(
        self,
        payment,
        amount=None,
        is_cancellation_refund=False,
    ):
        # ---------------------------------------------
        # 1. Validate and reserve the refund locally
        # ---------------------------------------------

        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("order")
                .get(pk=payment.pk)
            )

            if (
                is_cancellation_refund
                and payment.order
                and payment.order.status == "CANCELLED"
            ):
                raise ValidationError(
                    "This order has already been cancelled."
                )

            if payment.status not in {
                Payment.STATUS_SUCCESS,
                Payment.STATUS_REFUND_PENDING,
                Payment.STATUS_REFUND_FAILED,
            }:
                raise ValidationError(
                    "Only successful payments can be refunded."
                )

            if amount is None:
                amount = payment.amount
            else:
                try:
                    amount = Decimal(str(amount))
                except (
                    InvalidOperation,
                    TypeError,
                    ValueError,
                ) as error:
                    raise ValidationError(
                        "Invalid refund amount."
                    ) from error

            amount = amount.quantize(Decimal("0.01"))

            if amount <= 0:
                raise ValidationError(
                    "Refund amount must be greater than zero."
                )

            processed_total = (
                payment.refunds
                .filter(status=Refund.STATUS_PROCESSED)
                .aggregate(
                    total=models.Sum("amount")
                )["total"]
                or Decimal("0")
            )

            pending_total = (
                payment.refunds
                .filter(
                    status__in=[
                        Refund.STATUS_PENDING,
                        Refund.STATUS_PROCESSING,
                        Refund.STATUS_NEEDS_ATTENTION,
                    ]
                )
                .aggregate(
                    total=models.Sum("amount")
                )["total"]
                or Decimal("0")
            )

            refundable_remaining = (
                payment.amount
                - processed_total
                - pending_total
            )

            if amount > refundable_remaining:
                raise ValidationError(
                    "Refund amount exceeds the remaining "
                    "refundable amount."
                )

            refund = Refund.objects.create(
                payment=payment,
                order=payment.order,
                transaction_reference=payment.reference,
                amount=amount,
                status=Refund.STATUS_NEEDS_ATTENTION,
                is_cancellation_refund=is_cancellation_refund,
            )

        # ---------------------------------------------
        # 2. Send the request to Paystack
        # ---------------------------------------------

        payload = {
            "transaction": payment.reference,
            "amount": int(amount * Decimal("100")),
        }

        try:
            result = self.paystack.post(
                "/refund",
                payload,
            )

        except PaystackRequestUncertain:
            logger.exception(
                "Uncertain Paystack refund outcome. "
                "Refund #%s, Payment=%s",
                refund.id,
                payment.reference,
            )

            # Keep NEEDS_ATTENTION. Do not retry automatically.
            self._sync_payment_refund_state(payment)
            raise

        except ValidationError:
            # The client uses ValidationError for definite
            # HTTP 4xx rejections.
            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )

                refund.status = Refund.STATUS_FAILED
                refund.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                self._sync_payment_refund_state(payment)

            raise

        # ---------------------------------------------
        # 3. Interpret Paystack's response
        # ---------------------------------------------

        if (
            not isinstance(result, dict)
            or result.get("status") is not True
        ):
            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )

                refund.status = Refund.STATUS_FAILED
                refund.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                self._sync_payment_refund_state(payment)

            raise ValidationError(
                result.get(
                    "message",
                    "Unable to initiate refund.",
                )
                if isinstance(result, dict)
                else "Invalid response from Paystack."
            )

        data = result.get("data")

        # Paystack accepted the request, but its response
        # does not contain enough information to confirm
        # the refund state.
        if not isinstance(data, dict):
            logger.error(
                "Paystack accepted refund #%s but returned "
                "an invalid response body.",
                refund.id,
            )

            self._sync_payment_refund_state(payment)
            return result

        provider_status = data.get("status") or "pending"

        valid_provider_statuses = {
            "pending",
            "processing",
            "needs-attention",
            "processed",
            "failed",
        }

        provider_amount = data.get("amount")

        amount_matches = True

        if provider_amount is not None:
            provider_amount = (
                Decimal(str(provider_amount))
                / Decimal("100")
            )

            amount_matches = provider_amount == amount

        if (
            provider_status not in valid_provider_statuses
            or not amount_matches
        ):
            logger.error(
                "Paystack accepted refund #%s but returned "
                "unexpected refund details. Status=%s Amount=%s",
                refund.id,
                provider_status,
                provider_amount,
            )

            self._sync_payment_refund_state(payment)
            return result

        # ---------------------------------------------
        # 4. Save the confirmed Paystack refund details
        # ---------------------------------------------

        with transaction.atomic():
            refund = Refund.objects.select_for_update().get(
                pk=refund.pk
            )

            refund.paystack_refund_id = data.get("id")
            refund.refund_reference = data.get("reference")
            refund.status = self._map_refund_status(
                provider_status
            )

            if (
                refund.status == Refund.STATUS_PROCESSED
                and refund.processed_at is None
            ):
                refund.processed_at = timezone.now()

            refund.save()

            self._sync_payment_refund_state(payment)

        return result

    @transaction.atomic
    def reconcile_refund(self, refund):
        refund = (
            Refund.objects
            .select_for_update()
            .select_related("payment")
            .get(pk=refund.pk)
        )

        if refund.status in {
            Refund.STATUS_PROCESSED,
            Refund.STATUS_FAILED,
        }:
            return refund

        if not refund.paystack_refund_id:
            logger.warning(
                "Refund #%s has no Paystack refund ID.",
                refund.id,
            )
            return refund

        try:
            result = self.paystack.get(
                f"/refund/{refund.paystack_refund_id}"
            )

        except ValidationError:
            logger.exception(
                "Failed to reconcile Paystack refund #%s.",
                refund.id,
            )
            return refund

        if result.get("status") is not True:
            logger.warning(
                "Paystack could not reconcile refund #%s: %s",
                refund.id,
                result.get("message"),
            )
            return refund

        data = result.get("data", {})

        refund.status = self._map_refund_status(
            data.get("status")
        )

        if data.get("reference"):
            refund.refund_reference = data["reference"]

        if data.get("amount") is not None:
            refund.amount = (
                Decimal(str(data["amount"]))
 / Decimal("100")
            )

        if (
            refund.status == Refund.STATUS_PROCESSED
            and refund.processed_at is None
        ):
            refund.processed_at = timezone.now()

        refund.save()

        self._sync_payment_refund_state(
            refund.payment
        )

        refund.refresh_from_db()

        return refund

    def reconcile_pending_refunds(self):
        refunds = (
            Refund.objects
            .select_related("payment")
            .filter(
                payment__provider="paystack",
                status__in=[
                    Refund.STATUS_PENDING,
                    Refund.STATUS_PROCESSING,
                    Refund.STATUS_NEEDS_ATTENTION,
                ],
            )
            .order_by("created_at")
        )

        reconciled = 0

        for refund in refunds:
            before_status = refund.status

            self.reconcile_refund(refund)

            refund.refresh_from_db()

            if refund.status != before_status:
                reconciled += 1

        return reconciled