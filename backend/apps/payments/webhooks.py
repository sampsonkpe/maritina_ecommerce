import json
import hashlib
import hmac

from django.http import HttpResponse
from django.conf import settings

from .services.payment_service import PaymentService


def paystack_webhook(request):
    signature = request.headers.get(
        "x-paystack-signature"
    )

    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(),
        request.body,
        hashlib.sha512,
    ).hexdigest()

    if not hmac.compare_digest(
        signature or "",
        expected_signature,
    ):
        return HttpResponse(status=401)

    try:
        payload = json.loads(request.body)

        PaymentService.webhook(payload)

        return HttpResponse(status=200)

    except Exception:
        return HttpResponse(status=400)