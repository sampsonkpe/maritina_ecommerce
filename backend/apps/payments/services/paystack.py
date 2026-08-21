import uuid
import logging

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
                    update_fields=["status"]
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
                update_fields=["status"]
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

    def verify_payment(self, reference):
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

        if (
            result.get("status") is True
            and result.get("data", {}).get("status")
            == "success"
        ):
            order = self.mark_as_paid(reference)

            return {
                **result,
                "order": (
                    OrderSerializer(order).data
                    if order
                    else None
                ),
            }

        return {
            **result,
            "status": False,
            "message": (
                result.get("message")
                or "Payment has not been completed."
            ),
        }

    def webhook(self, payload):
        if payload.get("event") != "charge.success":
            return

        reference = (
            payload
            .get("data", {})
            .get("reference")
        )

        if reference:
            self.mark_as_paid(reference)

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