import uuid
import logging
from decimal import Decimal, InvalidOperation

from django.utils import timezone
import requests

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction

from requests.exceptions import RequestException

from .base import BasePaymentService
from ..models import Payment, Refund

from apps.checkout.models import CheckoutTransaction
from apps.checkout.services import CheckoutService
from apps.orders.serializers import OrderSerializer


logger = logging.getLogger(__name__)


def _get_payment_method(data):
    channel = data.get("channel")

    if channel == "card":
        return "Card"

    if channel == "bank":
        return "Bank"

    if channel == "bank_transfer":
        return "Bank Transfer"

    if channel == "mobile_money":
        authorization = data.get("authorization") or {}

        provider = (
            authorization.get("bank")
            or authorization.get("brand")
            or ""
        )

        provider_lower = provider.lower()

        if "mtn" in provider_lower:
            return "MTN MoMo"

        if (
            "airtel" in provider_lower
            or "tigo" in provider_lower
        ):
            return "Airtel Money"

        if (
            "telecel" in provider_lower
            or "vodafone" in provider_lower
        ):
            return "Telecel Cash"

        return "Mobile Money"

    if channel == "ussd":
        return "USSD"

    if channel == "qr":
        return "QR"

    return (
        channel.replace("_", " ").title()
        if channel
        else "Paystack"
    )


class PaystackPaymentService(BasePaymentService):

    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, checkout, email):
        """
        Initialise a Paystack payment for a checkout transaction.

        An Order does not exist yet.
        The CheckoutTransaction is the source of truth.
        """

        if checkout.status != CheckoutTransaction.STATUS_PENDING:
            raise ValidationError(
                "This checkout is no longer available for payment."
            )

        reference = (
            f"CHECKOUT-{checkout.id}-"
            f"{uuid.uuid4().hex[:8]}"
        )

        payment = Payment.objects.create(
            checkout=checkout,
            order=None,
            reference=reference,
            amount=checkout.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="paystack",
        )

        url = f"{self.BASE_URL}/transaction/initialize"

        headers = {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "amount": int(
                Decimal(str(checkout.total_amount)) * 100
            ),
            "reference": reference,
            "callback_url": (
                f"{settings.FRONTEND_URL}"
                "/payment-return"
            ),
            "metadata": {
                "checkout_id": checkout.id,
                "cancel_action": (
                    f"{settings.FRONTEND_URL}"
                    "/payment-cancelled"
                ),
            },
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=15,
            )

        except RequestException as error:
            logger.exception(
                "Failed to connect to Paystack while "
                "initialising payment %s.",
                reference,
            )

            payment.status = Payment.STATUS_FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            try:
                CheckoutService.fail_checkout(
                    checkout.id
                )
            except ValueError:
                logger.exception(
                    "Unable to fail checkout %s after "
                    "Paystack connection failure.",
                    checkout.id,
                )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        try:
            result = response.json()

        except ValueError:
            logger.error(
                "Paystack returned an invalid JSON response "
                "for payment %s. HTTP %s. Response: %s",
                reference,
                response.status_code,
                response.text[:500],
            )

            payment.status = Payment.STATUS_FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            try:
                CheckoutService.fail_checkout(
                    checkout.id
                )
            except ValueError:
                logger.exception(
                    "Unable to fail checkout %s after "
                    "invalid Paystack response.",
                    checkout.id,
                )

            raise ValidationError(
                "Paystack returned an invalid response. "
                "Please try again."
            )

        if response.status_code >= 400 or not result.get("status"):

            logger.error(
                "Paystack initialisation failed for %s. "
                "HTTP %s. Response: %s",
                reference,
                response.status_code,
                result,
            )

            payment.status = Payment.STATUS_FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            try:
                CheckoutService.fail_checkout(
                    checkout.id
                )
            except ValueError:
                logger.exception(
                    "Unable to fail checkout %s after "
                    "Paystack initialisation failure.",
                    checkout.id,
                )

            raise ValidationError(
                result.get(
                    "message",
                    "Unable to initialise payment.",
                )
            )

        return result

    def verify_payment(self, reference):
        try:
            payment = (
                Payment.objects
                .select_related("checkout")
                .get(reference=reference)
            )

        except Payment.DoesNotExist:
            return {
                "status": False,
                "message": "Invalid payment reference.",
            }

        url = (
            f"{self.BASE_URL}/transaction/verify/"
            f"{reference}"
        )

        headers = {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
        }

        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=15,
            )

            response.raise_for_status()

            result = response.json()

        except RequestException:
            logger.exception(
                "Failed to verify Paystack payment."
            )

            return {
                "status": False,
                "message": "Payment verification failed.",
            }

        data = result.get("data", {})

        if (
            result.get("status") is not True
            or data.get("status") != "success"
        ):
            return {
                **result,
                "status": False,
                "message": (
                    result.get("message")
                    or "Payment has not been completed."
                ),
            }

        # ---------------------------------------------
        # Verify transaction reference
        # ---------------------------------------------

        if data.get("reference") != payment.reference:
            logger.warning(
                "Paystack reference mismatch for payment %s.",
                payment.reference,
            )

            return {
                "status": False,
                "message": "Payment reference mismatch.",
            }

        # ---------------------------------------------
        # Verify payment amount
        # ---------------------------------------------

        expected_amount = int(
            payment.amount * 100
        )

        paid_amount = data.get("amount")

        if paid_amount != expected_amount:
            logger.warning(
                "Payment amount mismatch for %s. "
                "Expected %s, received %s.",
                payment.reference,
                expected_amount,
                paid_amount,
            )

            return {
                "status": False,
                "message": "Payment amount mismatch.",
            }

        # ---------------------------------------------
        # Finalise payment
        # ---------------------------------------------

        payment_method = _get_payment_method(data)

        if payment.payment_method != payment_method:
            payment.payment_method = payment_method

            payment.save(
                update_fields=[
                    "payment_method",
                    "updated_at",
                ]
            )

        order = self.mark_as_paid(reference, transaction_data=data)

        return {
            **result,
            "order": (
                OrderSerializer(order).data
                if order
                else None
            ),
        }

    def reconcile_payment(self, payment):
        """
        Reconcile an initiated local payment against Paystack.

        Returns the resulting local payment state.
        """

        if payment.status != Payment.STATUS_INITIATED:
            return payment

        result = self.verify_payment(payment.reference)

        if result.get("status") is True:
            payment.refresh_from_db()
            return payment

        data = result.get("data", {})

        if data.get("status") in {
            "failed",
            "abandoned",
            "cancelled",
        }:
            self.mark_as_failed(payment.reference)

            payment.refresh_from_db()
            return payment

        return payment

    def reconcile_refund(self, refund):
        """
        Reconcile a local refund against Paystack.
        """

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

        url = (
            f"{self.BASE_URL}/refund/"
            f"{refund.paystack_refund_id}"
        )

        headers = {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
        }

        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=15,
            )

            response.raise_for_status()

            result = response.json()

        except RequestException:
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
            refund.refund_reference = (
                data["reference"]
            )

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
        """
        Reconcile all locally pending Paystack refunds.

        Returns the number of refunds whose local status changed.
        """

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

    def webhook(self, payload):
        event = payload.get("event")

        data = payload.get("data", {})

        # -------------------------------------------------
        # Successful payment
        # -------------------------------------------------

        if event == "charge.success":
            reference = data.get("reference")

            if reference:
                self.mark_as_paid(
                    reference,
                    transaction_data=data,
                )

            return

        # -------------------------------------------------
        # Failed payment
        # -------------------------------------------------

        if event == "charge.failed":
            reference = data.get("reference")

            if reference:
                self.mark_as_failed(reference)

            return

        # -------------------------------------------------
        # Refund events
        # -------------------------------------------------

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
        """
        Process a Paystack refund webhook.

        This handles refunds initiated both through the
        application and directly through the Paystack
        Dashboard.
        """

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

    @transaction.atomic
    def mark_as_failed(self, reference):
        """
        Mark a payment as failed and release the associated
        checkout's stock reservations.

        This is idempotent and will never affect a payment
        that has already succeeded.
        """

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("checkout", "order")
                .get(reference=reference)
            )

        except Payment.DoesNotExist:
            logger.warning(
                "Payment reference %s not found.",
                reference,
            )
            return None

        # -------------------------------------------------
        # Already successful
        # -------------------------------------------------

        if payment.status == Payment.STATUS_SUCCESS:
            return payment

        checkout = payment.checkout

        # -------------------------------------------------
        # Mark payment failed
        # -------------------------------------------------

        if payment.status != Payment.STATUS_FAILED:

            payment.status = Payment.STATUS_FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        # -------------------------------------------------
        # Release failed checkout
        # -------------------------------------------------

        if checkout:
            try:
                CheckoutService.fail_checkout(
                    checkout.id
                )
            except ValueError:
                # Checkout may already have progressed to
                # another valid terminal state.
                logger.info(
                    "Checkout #%s could not be marked failed "
                    "for payment %s.",
                    checkout.id,
                    reference,
                )

        return payment

    @transaction.atomic
    def mark_as_paid(
        self,
        reference,
        transaction_data=None,
    ):
        """
        Confirm payment and finalise the checkout.

        This is intentionally idempotent because:
        - Paystack may send the webhook more than once.
        - The browser may verify the payment.
        - Both can happen close together.
        """

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("checkout", "order")
                .get(reference=reference)
            )

        except Payment.DoesNotExist:
            logger.warning(
                "Payment reference %s not found.",
                reference,
            )
            return None

        checkout = payment.checkout

        if (
            checkout.status != CheckoutTransaction.STATUS_FINALISED
            and checkout.expires_at <= timezone.now()
        ):
            logger.error(
                "Successful Paystack payment %s received for "
                "expired checkout #%s.",
                reference,
                checkout.id,
            )

            return None

        # -------------------------------------------------
        # Already finalised
        # -------------------------------------------------

        if (
            payment.status == Payment.STATUS_SUCCESS
            and checkout.status
            == CheckoutTransaction.STATUS_FINALISED
        ):
            return payment.order

        # -------------------------------------------------
        # Mark payment successful
        # -------------------------------------------------

        update_fields = []

        if payment.status != Payment.STATUS_SUCCESS:
            payment.status = Payment.STATUS_SUCCESS
            update_fields.append("status")

        if transaction_data:
            payment_method = _get_payment_method(
                transaction_data
            )

            if payment.payment_method != payment_method:
                payment.payment_method = payment_method
                update_fields.append("payment_method")

        if update_fields:
            update_fields.append("updated_at")

            payment.save(
                update_fields=update_fields
            )

        # -------------------------------------------------
        # Mark checkout as paid
        # -------------------------------------------------

        if checkout.status != CheckoutTransaction.STATUS_PAID:

            checkout.status = (
                CheckoutTransaction.STATUS_PAID
            )

            checkout.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            Payment.objects.filter(
                checkout=checkout,
                status=Payment.STATUS_INITIATED,
            ).update(
                status=Payment.STATUS_FAILED,
            )

        # -------------------------------------------------
        # Convert checkout into Order
        # -------------------------------------------------

        order = CheckoutService.finalise_checkout(
            checkout.id
        )

        logger.info(
            "Payment %s confirmed. "
            "Checkout #%s finalised as Order #%s.",
            reference,
            checkout.id,
            order.id,
        )

        return order

    @staticmethod
    def _map_refund_status(status):
        return {
            "pending": Refund.STATUS_PENDING,
            "processing": Refund.STATUS_PROCESSING,
            "needs-attention": Refund.STATUS_NEEDS_ATTENTION,
            "processed": Refund.STATUS_PROCESSED,
            "failed": Refund.STATUS_FAILED,
        }.get(
            status,
            Refund.STATUS_PENDING,
        )

    @staticmethod
    def _sync_payment_refund_state(payment):
        """
        Synchronise the aggregate refund fields on Payment
        from the individual Refund records.
        """

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
            .exclude(refund_reference__isnull=True)
            .exclude(refund_reference="")
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
            payment.refunded_at = (
                payment.refunded_at
                or timezone.now()
            )

            update_fields.extend([
                "status",
                "refunded_at",
            ])

        elif pending_exists:
            payment.status = Payment.STATUS_REFUND_PENDING

            update_fields.append("status")

        elif payment.refunded_amount > 0:
            # We have successfully processed at least one
            # partial refund and there are currently no
            # pending refunds.
            payment.status = Payment.STATUS_SUCCESS

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

    @staticmethod
    def _find_refund_for_webhook(
        payment,
        data,
    ):
        """
        Find an existing local Refund represented by a
        Paystack webhook.

        Paystack may initially omit refund_reference, so
        matching must progressively use the identifiers
        available in the webhook.
        """

        refund_reference = data.get(
            "refund_reference"
        )

        if refund_reference:
            refund = (
                Refund.objects
                .select_for_update()
                .filter(
                    refund_reference=refund_reference
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
                    paystack_refund_id=paystack_refund_id
                )
                .first()
            )

            if refund:
                return refund

        transaction_reference = data.get(
            "transaction_reference"
        )

        amount = data.get("amount")

        if transaction_reference and amount is not None:
            amount_major = (
                Decimal(str(amount))
                / Decimal("100")
            )

            refund = (
                Refund.objects
                .select_for_update()
                .filter(
                    payment=payment,
                    transaction_reference=(
                        transaction_reference
                    ),
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

            if refund:
                return refund

        return None

    @transaction.atomic
    def refund(self, payment, amount=None):
        """
        Initiate a Paystack refund.

        `amount` is expressed in the application's
        currency unit (GHS).

        Paystack receives the amount in pesewas.
        """

        payment = (
            Payment.objects
            .select_for_update()
            .select_related("order")
            .get(pk=payment.pk)
        )

        if payment.status not in {
            Payment.STATUS_SUCCESS,
            Payment.STATUS_REFUND_PENDING,
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
            ):
                raise ValidationError(
                    "Invalid refund amount."
                )

        amount = amount.quantize(
            Decimal("0.01")
        )

        if amount <= 0:
            raise ValidationError(
                "Refund amount must be greater than zero."
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

        url = f"{self.BASE_URL}/refund"

        headers = {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
            "Content-Type": "application/json",
        }

        payload = {
            "transaction": payment.reference,
            "amount": int(
                amount * Decimal("100")
            ),
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=15,
            )

            response.raise_for_status()

            result = response.json()

        except RequestException as error:
            logger.exception(
                "Failed to initiate Paystack refund for %s.",
                payment.reference,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        if result.get("status") is not True:
            raise ValidationError(
                result.get(
                    "message",
                    "Unable to initiate refund.",
                )
            )

        data = result.get("data", {})

        provider_status = (
            data.get("status")
            or "pending"
        )

        refund_status = (
            self._map_refund_status(
                provider_status
            )
        )

        provider_amount = data.get("amount")

        if provider_amount is not None:
            provider_amount = (
                Decimal(str(provider_amount))
                / Decimal("100")
            )

            if provider_amount != amount:
                logger.warning(
                    "Paystack refund amount mismatch "
                    "for payment %s. Requested=%s "
                    "Provider=%s",
                    payment.reference,
                    amount,
                    provider_amount,
                )

                raise ValidationError(
                    "Paystack returned an unexpected "
                    "refund amount."
                )

        refund = Refund.objects.create(
            payment=payment,
            order=payment.order,
            paystack_refund_id=data.get("id"),
            refund_reference=data.get(
                "refund_reference"
            ),
            transaction_reference=payment.reference,
            amount=amount,
            status=refund_status,
        )

        if (
            refund.status == Refund.STATUS_PROCESSED
        ):
            refund.processed_at = timezone.now()

            refund.save(
                update_fields=[
                    "processed_at",
                    "updated_at",
                ]
            )

        self._sync_payment_refund_state(
            payment
        )

        return result