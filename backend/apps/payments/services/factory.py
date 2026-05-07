from django.conf import settings

from .mock import MockPaymentService


class PaymentServiceFactory:

    @staticmethod
    def get_service():

        if settings.PAYMENT_PROVIDER == "mock":
            return MockPaymentService()

        return MockPaymentService()  # fallback for now