import uuid
import logging

from django.utils import timezone
import requests

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction

from requests.exceptions import RequestException

from .base import BasePaymentService
from ..models import Payment

from apps.checkout.models import CheckoutTransaction
from apps.checkout.services import CheckoutService
from apps.orders.serializers import OrderSerializer


logger = logging.getLogger(__name__)


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
            "amount": int(checkout.total_amount) * 100,
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

            response.raise_for_status()

            result = response.json()

            if not result.get("status"):
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

        except RequestException as error:
            logger.exception(
                "Failed to initialise Paystack payment."
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
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

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

        expected_amount = payment.amount * 100
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

        order = self.mark_as_paid(reference)

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

    def reconcile_pending_payments(self):
        """
        Reconcile all locally initiated Paystack payments.

        Returns the number of payments reconciled.
        """

        payments = (
            Payment.objects
            .select_related("checkout")
            .filter(
                provider="paystack",
                status=Payment.STATUS_INITIATED,
            )
            .order_by("created_at")
        )

        reconciled = 0

        for payment in payments:

            before_status = payment.status

            self.reconcile_payment(payment)

            payment.refresh_from_db()

            if payment.status != before_status:
                reconciled += 1

        return reconciled

    def webhook(self, payload):
        event = payload.get("event")

        data = payload.get("data", {})
        reference = data.get("reference")

        if not reference:
            return

        # -------------------------------------------------
        # Successful payment
        # -------------------------------------------------

        if event == "charge.success":
            self.mark_as_paid(reference)
            return

        # -------------------------------------------------
        # Failed payment
        # -------------------------------------------------

        if event == "charge.failed":
            self.mark_as_failed(reference)

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
    def mark_as_paid(self, reference):
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

        if payment.status != Payment.STATUS_SUCCESS:

            payment.status = Payment.STATUS_SUCCESS

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
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

    @transaction.atomic
    def refund(self, payment, amount=None):
        """
        Initiate a Paystack refund for a successful payment.

        `amount` is in the application's currency unit.
        Paystack receives the amount in kobo/pesewas.
        """

        payment = (
            Payment.objects
            .select_for_update()
            .get(pk=payment.pk)
        )

        if payment.status == Payment.STATUS_REFUNDED:
            raise ValidationError(
                "This payment has already been refunded."
            )

        if payment.status == Payment.STATUS_REFUND_PENDING:
            raise ValidationError(
                "A refund is already pending for this payment."
            )

        if payment.status != Payment.STATUS_SUCCESS:
            raise ValidationError(
                "Only successful payments can be refunded."
            )

        if amount is None:
            amount = payment.amount

        if amount <= 0:
            raise ValidationError(
                "Refund amount must be greater than zero."
            )

        if amount > payment.amount:
            raise ValidationError(
                "Refund amount cannot exceed the payment amount."
            )

        if payment.refunded_amount + amount > payment.amount:
            raise ValidationError(
                "Total refunded amount cannot exceed "
                "the payment amount."
            )

        payment.status = Payment.STATUS_REFUND_PENDING

        payment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
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
            "amount": int(amount) * 100,
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

            payment.status = (
                Payment.STATUS_REFUND_FAILED
            )

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        if result.get("status") is not True:

            payment.status = (
                Payment.STATUS_REFUND_FAILED
            )

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            raise ValidationError(
                result.get(
                    "message",
                    "Unable to initiate refund.",
                )
            )

        data = result.get("data", {})

        refund_reference = (
            data.get("refund_reference")
            or data.get("reference")
        )

        payment.refund_reference = refund_reference
        payment.refunded_amount += amount

        if payment.refunded_amount >= payment.amount:
            payment.status = Payment.STATUS_REFUNDED

        else:
            payment.status = Payment.STATUS_REFUND_PENDING

        payment.refunded_at = timezone.now()

        payment.save(
            update_fields=[
                "refund_reference",
                "refunded_amount",
                "refunded_at",
                "status",
                "updated_at",
            ]
        )

        return result