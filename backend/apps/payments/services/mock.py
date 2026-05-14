import uuid

from django.core.exceptions import ValidationError

from .base import BasePaymentService
from ..models import Payment
from apps.orders.models import Order


class MockPaymentService(BasePaymentService):

    def initialize_payment(self, order, email):

        # Prevent duplicate payments
        if order.status == Order.STATUS_PAID:
            raise ValidationError("Order is already paid")

        reference = f"MOCK-{uuid.uuid4().hex[:10].upper()}"

        Payment.objects.create(
            order=order,
            reference=reference,
            amount=order.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="mock"
        )

        return {
            "status": True,
            "data": {
                "reference": reference,
                "authorization_url": f"/mock/checkout/{reference}"
            }
        }

    def verify_payment(self, reference):

        try:
            payment = Payment.objects.get(reference=reference)
        except Payment.DoesNotExist:
            return {"status": False, "message": "Invalid reference"}

        # MOCK SUCCESS
        payment.status = Payment.STATUS_SUCCESS
        payment.save()

        order = payment.order
        order.status = Order.STATUS_PAID
        order.save()

        return {
            "status": True,
            "message": "Payment successful"
        }

    def webhook(self, payload):
        reference = payload.get("reference")
        return self.verify_payment(reference)