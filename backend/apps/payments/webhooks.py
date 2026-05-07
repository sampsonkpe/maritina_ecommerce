import hmac
import hashlib
import json
from django.conf import settings
from django.http import HttpResponse

from .services.payment_service import PaymentService


def paystack_webhook(request):

    payload = request.body
    signature = request.META.get("HTTP_X_PAYSTACK_SIGNATURE")

    computed_hash = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        payload,
        hashlib.sha512
    ).hexdigest()

    if computed_hash != signature:
        return HttpResponse(status=401)

    event = json.loads(payload)

    if event["event"] == "charge.success":
        reference = event["data"]["reference"]
        PaymentService.verify_payment(reference)

    return HttpResponse(status=200)