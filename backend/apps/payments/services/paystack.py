import uuid

import requests

from django.conf import settings
from django.core.exceptions import ValidationError
from ..models import Payment
from apps.orders.models import Order

class PaystackPaymentService:

    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, order, email):

        if order.status == Order.STATUS_PAID:
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
            "callback_url": "http://localhost:5173/orders",
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers,
        )

        return response.json()

    def verify_payment(self, reference):

        print("\n========== VERIFY PAYMENT ==========")
        print("REFERENCE:", reference)
        print(
            "SECRET KEY:",
            settings.PAYSTACK_SECRET_KEY[:15] + "..."
        )

        url = (
            f"{self.BASE_URL}/transaction/verify/"
            f"{reference}"
        )

        print("VERIFY URL:", url)

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }

        response = requests.get(
            url,
            headers=headers,
        )

        print("STATUS CODE:", response.status_code)
        print("RESPONSE:", response.json())
        print("===================================\n")

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
        order.status = Order.STATUS_PAID
        order.save()