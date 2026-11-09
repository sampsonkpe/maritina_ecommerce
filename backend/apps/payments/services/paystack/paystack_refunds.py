import logging
import uuid
from decimal import Decimal, InvalidOperation
from urllib.parse import quote

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone

from ...models import Payment, Refund
from .paystack_client import PaystackRequestUncertain


logger = logging.getLogger(__name__)


class PaystackRefundsMixin:

    def refund(
        self,
        payment,
        amount=None,
        is_cancellation_refund=False,
        initiated_by=None,
    ):
        # 1. Validate and reserve the refund locally
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

            try:
                amount = Decimal(
                    str(payment.amount if amount is None else amount)
                )

                if not amount.is_finite():
                    raise InvalidOperation

                amount = amount.quantize(Decimal("0.01"))

            except (
                InvalidOperation,
                TypeError,
                ValueError,
            ) as error:
                raise ValidationError(
                    "Invalid refund amount."
                ) from error

            if amount <= 0:
                raise ValidationError(
                    "Refund amount must be greater than zero."
                )

            processed_total = (
                payment.refunds
                .filter(status=Refund.STATUS_PROCESSED)
                .aggregate(total=models.Sum("amount"))["total"]
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
                .aggregate(total=models.Sum("amount"))["total"]
                or Decimal("0")
            )

            refundable_remaining = (
                payment.amount - processed_total - pending_total
            )

            if amount > refundable_remaining:
                raise ValidationError(
                    "Refund amount exceeds the remaining "
                    "refundable amount."
                )

            refund_reference = f"rf_{uuid.uuid4().hex}"

            refund = Refund.objects.create(
                payment=payment,
                order=payment.order,
                initiated_by=initiated_by,
                transaction_reference=payment.reference,
                refund_reference=refund_reference,
                amount=amount,
                status=Refund.STATUS_PENDING,
                is_cancellation_refund=is_cancellation_refund,
            )

        # 2. Send the request to Paystack
        payload = {
            "transaction": payment.reference,
            "amount": int(amount * Decimal("100")),
            "reference": refund_reference,
        }

        try:
            result = self.paystack.post("/refund", payload)

        except PaystackRequestUncertain:
            logger.exception(
                "Uncertain Paystack refund outcome. "
                "Refund #%s, Payment=%s",
                refund.id,
                payment.reference,
            )

            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )
                refund.status = Refund.STATUS_NEEDS_ATTENTION
                refund.save(update_fields=["status", "updated_at"])

            self._sync_payment_refund_state(payment)
            raise

        except ValidationError:
            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )
                refund.status = Refund.STATUS_FAILED
                refund.save(update_fields=["status", "updated_at"])

            self._sync_payment_refund_state(payment)
            raise

        # 3. Interpret Paystack's response
        if (
            not isinstance(result, dict)
            or result.get("status") is not True
        ):
            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )
                refund.status = Refund.STATUS_FAILED
                refund.save(update_fields=["status", "updated_at"])

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

        if not isinstance(data, dict):
            logger.error(
                "Paystack accepted refund #%s but returned "
                "an invalid response body.",
                refund.id,
            )

            with transaction.atomic():
                refund = Refund.objects.select_for_update().get(
                    pk=refund.pk
                )
                refund.status = Refund.STATUS_NEEDS_ATTENTION
                refund.save(update_fields=["status", "updated_at"])

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
            try:
                provider_amount = (
                    Decimal(str(provider_amount))
                    / Decimal("100")
                )
                amount_matches = (
                    provider_amount.is_finite()
                    and provider_amount == amount
                )
            except (
                InvalidOperation,
                TypeError,
                ValueError,
            ):
                amount_matches = False

        with transaction.atomic():
            refund = Refund.objects.select_for_update().get(
                pk=refund.pk
            )

            refund.paystack_refund_id = data.get("id")
            refund.refund_reference = (
                data.get("reference") or refund_reference
            )

            if (
                provider_status not in valid_provider_statuses
                or not amount_matches
            ):
                logger.error(
                    "Unexpected Paystack refund details. "
                    "Refund #%s, Status=%s, Amount=%s",
                    refund.id,
                    provider_status,
                    provider_amount,
                )

                refund.status = Refund.STATUS_NEEDS_ATTENTION

            else:
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

    def reconcile_refund(self, refund):
        # 1. Read the local refund without holding a lock
        try:
            refund_snapshot = (
                Refund.objects
                .select_related("payment")
                .get(pk=refund.pk)
            )
        except Refund.DoesNotExist:
            logger.warning(
                "Refund #%s no longer exists.",
                refund.pk,
            )
            return None

        if refund_snapshot.status in {
            Refund.STATUS_PROCESSED,
            Refund.STATUS_FAILED,
        }:
            return refund_snapshot

        # 2. Retrieve the refund from Paystack.
        # Prefer the Paystack ID; fall back to our reference.
        try:
            if refund_snapshot.paystack_refund_id:
                result = self.paystack.get(
                    f"/refund/{refund_snapshot.paystack_refund_id}"
                )

            elif refund_snapshot.refund_reference:
                reference = quote(
                    refund_snapshot.refund_reference,
                    safe="",
                )

                result = self.paystack.get(
                    f"/refund?reference={reference}"
                )

            else:
                logger.warning(
                    "Refund #%s has neither a Paystack ID "
                    "nor a refund reference. Cannot reconcile.",
                    refund_snapshot.id,
                )
                return refund_snapshot

        except ValidationError:
            logger.exception(
                "Failed to retrieve Paystack refund #%s.",
                refund_snapshot.id,
            )
            return refund_snapshot

        if not isinstance(result, dict) or result.get("status") is not True:
            logger.warning(
                "Paystack could not reconcile refund #%s.",
                refund_snapshot.id,
            )
            return refund_snapshot

        data = result.get("data")

        # GET /refund?reference=... returns a list.
        if isinstance(data, list):
            matching = [
                item
                for item in data
                if isinstance(item, dict)
                and item.get("reference")
                == refund_snapshot.refund_reference
            ]

            if len(matching) != 1:
                logger.warning(
                    "Expected one Paystack refund matching "
                    "reference %s; found %s.",
                    refund_snapshot.refund_reference,
                    len(matching),
                )
                return refund_snapshot

            data = matching[0]

        if not isinstance(data, dict):
            logger.warning(
                "Invalid Paystack refund data for local refund #%s.",
                refund_snapshot.id,
            )
            return refund_snapshot

        # 3. Validate the provider response
        provider_status = data.get("status")

        valid_provider_statuses = {
            "pending",
            "processing",
            "needs-attention",
            "processed",
            "failed",
        }

        if provider_status not in valid_provider_statuses:
            logger.warning(
                "Unknown Paystack refund status for refund #%s: %s",
                refund_snapshot.id,
                provider_status,
            )
            return refund_snapshot

        provider_reference = data.get("reference")

        if (
            provider_reference
            and refund_snapshot.refund_reference
            and provider_reference != refund_snapshot.refund_reference
        ):
            logger.error(
                "Paystack refund reference mismatch. "
                "Local=%s Provider=%s",
                refund_snapshot.refund_reference,
                provider_reference,
            )
            return refund_snapshot

        provider_id = data.get("id")

        if (
            provider_id
            and refund_snapshot.paystack_refund_id
            and provider_id != refund_snapshot.paystack_refund_id
        ):
            logger.error(
                "Paystack refund ID mismatch for local refund #%s.",
                refund_snapshot.id,
            )
            return refund_snapshot

        try:
            provider_amount = (
                Decimal(str(data.get("amount")))
                / Decimal("100")
            )

            if (
                not provider_amount.is_finite()
                or provider_amount != refund_snapshot.amount
            ):
                logger.error(
                    "Paystack refund amount mismatch. "
                    "Refund=%s Local=%s Provider=%s",
                    refund_snapshot.id,
                    refund_snapshot.amount,
                    provider_amount,
                )
                return refund_snapshot

        except (
            InvalidOperation,
            TypeError,
            ValueError,
        ):
            logger.error(
                "Invalid Paystack refund amount for refund #%s.",
                refund_snapshot.id,
            )
            return refund_snapshot

        new_status = self._map_refund_status(provider_status)

        # 4. Persist the result under a short database transaction
        with transaction.atomic():
            try:
                refund = (
                    Refund.objects
                    .select_for_update()
                    .select_related("payment")
                    .get(pk=refund_snapshot.pk)
                )
            except Refund.DoesNotExist:
                return None

            # Another process may have completed the refund
            # while the Paystack request was running.
            if refund.status in {
                Refund.STATUS_PROCESSED,
                Refund.STATUS_FAILED,
            }:
                return refund

            if (
                provider_reference
                and refund.refund_reference
                and provider_reference != refund.refund_reference
            ):
                logger.error(
                    "Refund reference changed during reconciliation. "
                    "Refund=%s",
                    refund.id,
                )
                return refund

            if (
                provider_amount != refund.amount
            ):
                logger.error(
                    "Refund amount changed during reconciliation. "
                    "Refund=%s",
                    refund.id,
                )
                return refund

            refund.paystack_refund_id = (
                provider_id or refund.paystack_refund_id
            )

            if provider_reference:
                refund.refund_reference = provider_reference

            # Do not downgrade an already advanced local status.
            if not (
                new_status == Refund.STATUS_PENDING
                and refund.status != Refund.STATUS_PENDING
            ):
                refund.status = new_status

                if (
                    new_status == Refund.STATUS_PROCESSED
                    and refund.processed_at is None
                ):
                    refund.processed_at = timezone.now()

            refund.save()

            payment_id = refund.payment_id

        # 5. Synchronise payment/order state outside the refund lock
        payment = Payment.objects.get(pk=payment_id)

        self._sync_payment_refund_state(payment)

        return Refund.objects.get(pk=refund_snapshot.pk)

    def reconcile_pending_refunds(self):
        refunds = (
            Refund.objects
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

        for refund in refunds.iterator():
            before_status = refund.status

            self.reconcile_refund(refund)

            refund.refresh_from_db()

            if refund.status != before_status:
                reconciled += 1

        return reconciled