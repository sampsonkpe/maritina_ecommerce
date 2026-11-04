import hashlib
import hmac
import json
import logging

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from .services.factory import PaymentServiceFactory


logger = logging.getLogger(__name__)


@csrf_exempt
def paystack_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    signature = request.headers.get(
        "x-paystack-signature"
    )

    if not signature:
        logger.warning(
            "Paystack webhook rejected: missing signature."
        )
        return HttpResponse(status=401)

    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(),
        request.body,
        hashlib.sha512,
    ).hexdigest()

    if not hmac.compare_digest(
        signature,
        expected_signature,
    ):
        logger.warning(
            "Paystack webhook rejected: invalid signature."
        )
        return HttpResponse(status=401)

    try:
        payload = json.loads(request.body)

        event = payload.get("event")
        logger.info(
            "Received Paystack webhook event: %s",
            event,
        )

        payment_service = (
            PaymentServiceFactory.get_service()
        )

        payment_service.webhook(payload)

        logger.info(
            "Successfully handled Paystack webhook: %s",
            event,
        )

        return HttpResponse(status=200)

    except json.JSONDecodeError:
        logger.exception(
            "Paystack webhook contained invalid JSON."
        )
        return HttpResponse(status=400)

    except Exception:
        logger.exception(
            "Failed to process Paystack webhook."
        )
        return HttpResponse(status=500)