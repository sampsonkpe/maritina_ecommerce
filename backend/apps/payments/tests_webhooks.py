import hashlib
import hmac
import json
from unittest.mock import patch

from django.conf import settings
from django.test import TestCase, override_settings


@override_settings(
    PAYSTACK_SECRET_KEY="test-paystack-secret"
)
class PaystackWebhookTests(TestCase):

    def _signature(self, payload):
        body = json.dumps(payload).encode()

        return hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode(),
            body,
            hashlib.sha512,
        ).hexdigest()

    @patch(
        "apps.payments.webhooks.PaymentServiceFactory.get_service"
    )
    def test_valid_signature_is_accepted(
        self,
        mock_get_service,
    ):
        payload = {
            "event": "charge.success",
            "data": {
                "reference": "TEST-REFERENCE",
            },
        }

        mock_service = mock_get_service.return_value

        body = json.dumps(payload).encode()

        response = self.client.post(
            "/api/payments/webhook/",
            data=body,
            content_type="application/json",
            HTTP_X_PAYSTACK_SIGNATURE=self._signature(
                payload
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        mock_get_service.assert_called_once_with()

        mock_service.webhook.assert_called_once_with(
            payload
        )

    @patch(
        "apps.payments.webhooks.PaymentServiceFactory.get_service"
    )
    def test_invalid_signature_is_rejected(
        self,
        mock_get_service,
    ):
        payload = {
            "event": "charge.success",
            "data": {
                "reference": "TEST-REFERENCE",
            },
        }

        body = json.dumps(payload).encode()

        response = self.client.post(
            "/api/payments/webhook/",
            data=body,
            content_type="application/json",
            HTTP_X_PAYSTACK_SIGNATURE="invalid-signature",
        )

        self.assertEqual(
            response.status_code,
            401,
        )

        mock_get_service.assert_not_called()

    @patch(
        "apps.payments.webhooks.PaymentServiceFactory.get_service"
    )
    def test_missing_signature_is_rejected(
        self,
        mock_get_service,
    ):
        payload = {
            "event": "charge.success",
            "data": {
                "reference": "TEST-REFERENCE",
            },
        }

        body = json.dumps(payload).encode()

        response = self.client.post(
            "/api/payments/webhook/",
            data=body,
            content_type="application/json",
        )

        self.assertEqual(
            response.status_code,
            401,
        )

        mock_get_service.assert_not_called()

    @patch(
        "apps.payments.webhooks.PaymentServiceFactory.get_service"
    )
    def test_malformed_json_returns_bad_request(
        self,
        mock_get_service,
    ):
        body = b"not-valid-json"

        signature = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode(),
            body,
            hashlib.sha512,
        ).hexdigest()

        response = self.client.post(
            "/api/payments/webhook/",
            data=body,
            content_type="application/json",
            HTTP_X_PAYSTACK_SIGNATURE=signature,
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        mock_get_service.assert_not_called()