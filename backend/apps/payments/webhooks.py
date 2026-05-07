import hmac
import hashlib
from django.conf import settings
from django.http import HttpResponse
import json

from .services.service import PaymentService


def paystack_webhook(request):

    payload = request.body
    signature = request.headers.get("x-paystack-signature")

    hash = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()

    if hash != signature:
        return HttpResponse(status=401)

    event = json.loads(payload)

    if event["event"] == "charge.success":
        reference = event["data"]["reference"]
        PaymentService.mark_as_paid(reference)

    return HttpResponse(status=200)