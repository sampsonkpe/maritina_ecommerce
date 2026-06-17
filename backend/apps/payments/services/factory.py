from django.conf import settings
from .mock import MockPaymentService
from .paystack import PaystackPaymentService


class PaymentServiceFactory:

    @staticmethod
    def get_service():
        provider = getattr(settings, "PAYMENT_PROVIDER", "mock")

        if provider == "paystack":
            return PaystackPaymentService()

        return MockPaymentService()