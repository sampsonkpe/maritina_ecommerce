import json
import hashlib
import hmac

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from .services.payment_service import PaymentService


@csrf_exempt
def paystack_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    signature = request.headers.get("x-paystack-signature")

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