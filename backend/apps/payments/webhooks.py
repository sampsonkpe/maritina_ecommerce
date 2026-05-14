import json
from django.http import HttpResponse

from .services.payment_service import PaymentService


def paystack_webhook(request):
    try:
        payload = json.loads(request.body)

        # MOCK SAFE FLOW
        PaymentService.webhook(payload)

        return HttpResponse(status=200)

    except Exception:
        return HttpResponse(status=400)