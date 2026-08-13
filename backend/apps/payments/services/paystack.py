import uuid
import requests
import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from requests.exceptions import RequestException

from ..models import Payment

from apps.common.constants import (
    PAYMENT_PAID,
    STATUS_CONFIRMED,
)

logger = logging.getLogger(__name__)


class PaystackPaymentService:

    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, order, email):

        if order.payment_status == PAYMENT_PAID:
            raise ValidationError(
                "Order is already paid."
            )

        reference = (
            f"ORDER-{order.id}-"
            f"{uuid.uuid4().hex[:8]}"
        )

        payment = Payment.objects.create(
            order=order,
            reference=reference,
            amount=order.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="paystack",
        )

        url = (
            f"{self.BASE_URL}/transaction/initialize"
        )

        headers = {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "amount": int(
                float(order.total_amount) * 100
            ),
            "reference": reference,
            "callback_url": (
                f"{settings.FRONTEND_URL}"
                "/payment-return"
            ),
            "metadata": {
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
                        "Unable to initialise payment."
                    )
                )

            return result

        except RequestException as e:

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
            ) from e

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
                "message": (
                    "Payment verification failed."
                ),
            }

        if (
            result.get("status") is True
            and result.get("data", {}).get("status")
            == "success"
        ):
            self.mark_as_paid(reference)

        return result

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

        try:

            payment = (
                Payment.objects
                .select_for_update()
                .select_related("order")
                .get(reference=reference)
            )

        except Payment.DoesNotExist:

            logger.warning(
                "Payment reference %s not found.",
                reference,
            )

            return

        order = payment.order

        # Idempotency:
        # Paystack may send the webhook more than once,
        # and the browser may also verify the payment.
        if (
            payment.status == Payment.STATUS_SUCCESS
            and order.payment_status == PAYMENT_PAID
        ):
            return

        payment.status = Payment.STATUS_SUCCESS

        payment.save(
            update_fields=["status"]
        )

        order.payment_status = PAYMENT_PAID
        order.payment_reference = reference
        order.paid_at = timezone.now()

        # Payment confirmation is what allows
        # the order to enter fulfilment.
        order.status = STATUS_CONFIRMED

        order.save(
            update_fields=[
                "payment_status",
                "payment_reference",
                "paid_at",
                "status",
                "updated_at",
            ]
        )

        logger.info(
            "Payment %s confirmed. "
            "Order %s is now confirmed.",
            reference,
            order.id,
        )