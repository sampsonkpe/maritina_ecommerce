import uuid
import random

from .base import BasePaymentService
from ..models import Payment
from apps.orders.models import Order
from django.core.exceptions import ObjectDoesNotExist


class MockPaymentService(BasePaymentService):

    def initialize_payment(self, order, email):

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
        except ObjectDoesNotExist:
            return {"status": False, "message": "Invalid reference"}

        success = random.random() < 0.9

        if success:
            payment.status = Payment.STATUS_SUCCESS
            payment.save()

            order = payment.order
            order.status = Order.STATUS_PAID
            order.save()

            return {"status": True, "message": "Payment successful"}

        payment.status = Payment.STATUS_FAILED
        payment.save()

        return {"status": False, "message": "Payment failed"}

    def webhook(self, payload):
        return self.verify_payment(payload.get("reference"))