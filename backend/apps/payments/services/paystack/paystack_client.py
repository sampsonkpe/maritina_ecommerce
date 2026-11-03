import logging

import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from requests.exceptions import HTTPError, RequestException


logger = logging.getLogger(__name__)


class PaystackClient:
    BASE_URL = "https://api.paystack.co"

    def _headers(self):
        return {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
            "Content-Type": "application/json",
        }

    def _handle_response(self, response, endpoint):
        try:
            response.raise_for_status()

        except HTTPError as error:
            try:
                data = response.json()
                provider_message = data.get(
                    "message",
                    "No error message provided.",
                )
            except ValueError:
                provider_message = response.text[:1000]

            logger.error(
                "Paystack rejected request. "
                "Endpoint=%s HTTP Status=%s Message=%s",
                endpoint,
                response.status_code,
                provider_message,
            )

            raise ValidationError(
                f"Paystack rejected the request: "
                f"{provider_message}"
            ) from error

        except RequestException as error:
            logger.exception(
                "Paystack request failed: %s",
                endpoint,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        try:
            return response.json()

        except ValueError as error:
            logger.exception(
                "Paystack returned invalid JSON for %s.",
                endpoint,
            )

            raise ValidationError(
                "Paystack returned an invalid response. "
                "Please try again."
            ) from error

    def post(self, endpoint, payload):
        url = f"{self.BASE_URL}{endpoint}"

        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._headers(),
                timeout=15,
            )

        except RequestException as error:
            logger.exception(
                "Paystack POST request failed: %s",
                endpoint,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        return self._handle_response(
            response,
            endpoint,
        )

    def get(self, endpoint):
        url = f"{self.BASE_URL}{endpoint}"

        try:
            response = requests.get(
                url,
                headers=self._headers(),
                timeout=15,
            )

        except RequestException as error:
            logger.exception(
                "Paystack GET request failed: %s",
                endpoint,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        return self._handle_response(
            response,
            endpoint,
        )