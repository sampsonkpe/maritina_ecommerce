class BasePaymentService:

    def initialize_payment(self, order, email):
        raise NotImplementedError

    def verify_payment(self, reference):
        raise NotImplementedError

    def webhook(self, payload):
        raise NotImplementedError