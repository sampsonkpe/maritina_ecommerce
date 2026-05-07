from .services import PaymentServiceFactory


class PaymentService:

    @staticmethod
    def initialize_payment(order, email):
        service = PaymentServiceFactory.get_service()
        return service.initialize_payment(order, email)

    @staticmethod
    def verify_payment(reference):
        service = PaymentServiceFactory.get_service()
        return service.verify_payment(reference)

    @staticmethod
    def webhook(payload):
        service = PaymentServiceFactory.get_service()
        return service.webhook(payload)