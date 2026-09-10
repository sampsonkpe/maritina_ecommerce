import logging
import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.checkout.models import CheckoutTransaction
from apps.checkout.services import CheckoutService
from apps.orders.serializers import OrderSerializer

from ...models import Payment

from .paystack_utils import get_payment_method


logger = logging.getLogger(__name__)


class PaystackPaymentsMixin:

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
            result = self.paystack.post(
                "/transaction/initialize",
                payload,
            )

        except ValidationError:
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

            raise

        if not result.get("status"):
            logger.error(
                "Paystack initialisation failed for %s: %s",
                reference,
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
                    "Unable to fail checkout %s.",
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

        try:
            result = self.paystack.get(
                f"/transaction/verify/{reference}"
            )

        except ValidationError:
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

        if data.get("reference") != payment.reference:
            logger.warning(
                "Paystack reference mismatch for payment %s.",
                payment.reference,
            )

            return {
                "status": False,
                "message": "Payment reference mismatch.",
            }

        expected_amount = int(
            payment.amount * Decimal("100")
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

        payment_method = get_payment_method(data)

        if payment.payment_method != payment_method:
            payment.payment_method = payment_method

            payment.save(
                update_fields=[
                    "payment_method",
                    "updated_at",
                ]
            )

        order = self.mark_as_paid(
            reference,
            transaction_data=data,
        )

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
        """

        if payment.status != Payment.STATUS_INITIATED:
            return payment

        result = self.verify_payment(
            payment.reference
        )

        if result.get("status") is True:
            payment.refresh_from_db()
            return payment

        data = result.get("data", {})

        if data.get("status") in {
            "failed",
            "abandoned",
            "cancelled",
        }:
            self.mark_as_failed(
                payment.reference
            )

            payment.refresh_from_db()

        return payment

    @transaction.atomic
    def mark_as_failed(self, reference):
        """
        Mark a payment as failed and release the
        associated checkout's stock reservations.
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

        if payment.status == Payment.STATUS_SUCCESS:
            return payment

        checkout = payment.checkout

        if payment.status != Payment.STATUS_FAILED:
            payment.status = Payment.STATUS_FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        if checkout:
            try:
                CheckoutService.fail_checkout(
                    checkout.id
                )
            except ValueError:
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

        Idempotent because Paystack webhooks and browser
        verification may both arrive.
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

        if (
            payment.status == Payment.STATUS_SUCCESS
            and checkout.status
            == CheckoutTransaction.STATUS_FINALISED
        ):
            return payment.order

        update_fields = []

        if payment.status != Payment.STATUS_SUCCESS:
            payment.status = Payment.STATUS_SUCCESS
            update_fields.append("status")

        if transaction_data:
            payment_method = get_payment_method(
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

        if checkout.status != CheckoutTransaction.STATUS_PAID:
            checkout.status = CheckoutTransaction.STATUS_PAID

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

        order = CheckoutService.finalise_checkout(
            checkout.id
        )

        logger.info(
            "Payment %s confirmed. Checkout #%s "
            "finalised as Order #%s.",
            reference,
            checkout.id,
            order.id,
        )

        return order