import requests

from django.conf import settings


class PaystackPaymentService:

    BASE_URL = "https://api.paystack.co"

    def initialize_payment(self, order, email):

        url = f"{self.BASE_URL}/transaction/initialize"

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "email": email,
            "amount": int(float(order.total_amount) * 100),
            "reference": f"ORDER-{order.id}",
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

        return response.json()

    def webhook(self, payload):
        return payload

    def mark_as_paid(self, reference):
        pass