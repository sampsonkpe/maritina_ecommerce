from django.conf import settings
from .mock import MockPaymentService


class PaymentServiceFactory:

    @staticmethod
    def get_service():

        provider = getattr(settings, "PAYMENT_PROVIDER", "mock")

        if provider == "mock":
            return MockPaymentService()

        return MockPaymentService()