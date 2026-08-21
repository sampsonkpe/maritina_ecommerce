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
    def mark_as_paid(self, reference):
        pass