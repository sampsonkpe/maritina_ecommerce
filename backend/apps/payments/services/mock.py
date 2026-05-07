import uuid
import random
from datetime import datetime

from .models import Payment
from apps.orders.models import Order


class MockPaymentService:

    """
    Simulates Paystack behaviour for development/testing
    """

    @staticmethod
    def initialize_payment(order: Order, email: str):

        reference = f"MOCK-{uuid.uuid4().hex[:10].upper()}"

        Payment.objects.create(
            order=order,
            reference=reference,
            amount=order.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="mock"
        )

        # simulate Paystack response
        return {
            "status": True,
            "message": "Mock payment initialized",
            "data": {
                "authorization_url": f"https://mock-paystack.local/checkout/{reference}",
                "reference": reference,
                "amount": order.total_amount * 100,
                "email": email,
                "created_at": str(datetime.now())
            }
        }


    @staticmethod
    def verify_payment(reference: str):

        """
        Simulates verification response
        """

        payment = Payment.objects.get(reference=reference)

        # simulate success/failure (90% success rate)
        success = random.random() < 0.9

        if success:
            payment.status = Payment.STATUS_SUCCESS
            payment.save()

            order = payment.order
            order.status = "PAID"
            order.save()

            return {
                "status": True,
                "message": "Mock payment successful",
                "data": {
                    "reference": reference,
                    "status": "success"
                }
            }

        else:
            payment.status = Payment.STATUS_FAILED
            payment.save()

            return {
                "status": False,
                "message": "Mock payment failed",
                "data": {
                    "reference": reference,
                    "status": "failed"
                }
            }


    @staticmethod
    def webhook(payload: dict):

        """
        Simulates webhook trigger
        """

        reference = payload.get("reference")

        if not reference:
            return {"status": False, "message": "No reference provided"}

        return MockPaymentService.verify_payment(reference)