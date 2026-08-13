from .factory import PaymentServiceFactory


class PaymentService:

    @staticmethod
    def initialize_payment(checkout, email):
        return PaymentServiceFactory.get_service().initialize_payment(
            checkout,
            email,
        )

    @staticmethod
    def verify_payment(reference):
        return PaymentServiceFactory.get_service().verify_payment(
            reference
        )

    @staticmethod
    def webhook(payload):
        return PaymentServiceFactory.get_service().webhook(
            payload
        )

    @staticmethod
    def mark_as_paid(reference):
        return PaymentServiceFactory.get_service().mark_as_paid(
            reference
        )