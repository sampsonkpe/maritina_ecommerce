from abc import ABC, abstractmethod


class BasePaymentService(ABC):

    @abstractmethod
    def initialize_payment(self, checkout, email):
        pass

    @abstractmethod
    def verify_payment(self, reference):
        pass

    @abstractmethod
    def webhook(self, payload):
        pass

    @abstractmethod
    def mark_as_paid(self, reference, transaction_data=None):
        pass

    @abstractmethod
    def mark_as_failed(self, reference):
        pass

    @abstractmethod
    def refund(
        self,
        payment,
        amount=None,
        is_cancellation_refund=False,
    ):
        pass