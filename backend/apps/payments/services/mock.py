import uuid

from django.core.exceptions import ValidationError
from django.db import transaction

from .base import BasePaymentService
from ..models import Payment

from apps.checkout.models import CheckoutTransaction
from apps.checkout.services import CheckoutService
from apps.orders.serializers import OrderSerializer


class MockPaymentService(BasePaymentService):

    def initialize_payment(self, checkout, email):

        if checkout.status != CheckoutTransaction.STATUS_PENDING:
            raise ValidationError(
                "This checkout is no longer available for payment."
            )

        reference = (
            f"MOCK-{uuid.uuid4().hex[:10].upper()}"
        )

        Payment.objects.create(
            checkout=checkout,
            order=None,
            reference=reference,
            amount=checkout.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="mock",
        )

        return {
            "status": True,
            "data": {
                "reference": reference,
                "authorization_url": (
                    f"/mock/checkout/{reference}"
                ),
            },
        }

    @transaction.atomic
    def verify_payment(self, reference):

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("checkout", "order")
                .get(reference=reference)
            )

        except Payment.DoesNotExist:
            return {
                "status": False,
                "message": "Invalid reference",
            }

        checkout = payment.checkout

        # -------------------------------------------------
        # Already finalised
        # -------------------------------------------------

        if (
            payment.status == Payment.STATUS_SUCCESS
            and checkout.status
            == CheckoutTransaction.STATUS_FINALISED
        ):
            return {
                "status": True,
                "message": "Payment already confirmed",
                "order": (
                    OrderSerializer(payment.order).data
                    if payment.order
                    else None
                ),
            }

        # -------------------------------------------------
        # Mark payment successful
        # -------------------------------------------------

        payment.status = Payment.STATUS_SUCCESS

        payment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # -------------------------------------------------
        # Mark checkout paid
        # -------------------------------------------------

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
        # Finalise checkout
        # -------------------------------------------------

        order = CheckoutService.finalise_checkout(
            checkout.id
        )

        return {
            "status": True,
            "message": "Payment successful",
            "order": OrderSerializer(order).data,
        }

    def webhook(self, payload):

        reference = payload.get("reference")

        if not reference:
            return {
                "status": False,
                "message": (
                    "Payment reference is required."
                ),
            }

        return self.verify_payment(reference)