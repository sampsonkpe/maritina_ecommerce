from django.conf import settings

from .mock import MockPaymentService
# from .paystack import PaystackService  # future real implementation


class PaymentServiceFactory:

    @staticmethod
    def get_service():

        if settings.PAYMENT_PROVIDER == "mock":
            return MockPaymentService()

        # future:
        # return PaystackService()