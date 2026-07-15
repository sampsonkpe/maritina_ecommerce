import uuid

import requests

from django.conf import settings
from django.core.exceptions import ValidationError
from ..models import Payment
from apps.orders.models import Order

from apps.common.constants import PAYMENT_PAID

class PaystackPaymentService:

    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, order, email):

        if order.payment_status == PAYMENT_PAID:
            raise ValidationError("Order is already paid")
        
        reference = (
            f"ORDER-{order.id}-"
            f"{uuid.uuid4().hex[:8]}"
        )

        Payment.objects.create(
            order=order,
            reference=reference,
            amount=order.total_amount,
            status=Payment.STATUS_INITIATED,
            provider="paystack",
        )
        
        url = f"{self.BASE_URL}/transaction/initialize"

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "amount": int(float(order.total_amount) * 100),
            "reference": reference,
            "callback_url": f"{settings.FRONTEND_URL}/orders",
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers,
        )

        return response.json()

    def verify_payment(self, reference):

        url = (
            f"{self.BASE_URL}/transaction/verify/"
            f"{reference}"
        )

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }

        response = requests.get(
            url,
            headers=headers,
        )

        result = response.json()

        if (
            result.get("status") is True
            and result.get("data", {}).get("status") == "success"
        ):
            self.mark_as_paid(reference)

        return result

    def webhook(self, payload):
        return payload

    def mark_as_paid(self, reference):

        try:
            payment = Payment.objects.get(
                reference=reference
            )
        except Payment.DoesNotExist:

            return
        
        payment.status = Payment.STATUS_SUCCESS
        payment.save()

        order = payment.order
        order.payment_status = PAYMENT_PAID
        order.save(update_fields=["payment_status"])