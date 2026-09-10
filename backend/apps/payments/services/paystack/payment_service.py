from ..base import BasePaymentService

from .paystack_client import PaystackClient
from .paystack_payments import PaystackPaymentsMixin
from .paystack_refund_state import PaystackRefundStateMixin
from .paystack_refunds import PaystackRefundsMixin
from .paystack_webhooks import PaystackWebhooksMixin


class PaystackPaymentService(
    PaystackPaymentsMixin,
    PaystackRefundsMixin,
    PaystackRefundStateMixin,
    PaystackWebhooksMixin,
    BasePaymentService,
):
    def __init__(self):
        self.paystack = PaystackClient()