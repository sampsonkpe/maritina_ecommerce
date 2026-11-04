import logging

import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from requests.exceptions import HTTPError, RequestException


logger = logging.getLogger(__name__)


class PaystackRequestUncertain(Exception):
    """
    The request may have reached Paystack, but its outcome
    could not be confirmed.
    """
    pass


class PaystackClient:
    BASE_URL = "https://api.paystack.co"

    def _headers(self):
        return {
            "Authorization": (
                f"Bearer {settings.PAYSTACK_SECRET_KEY}"
            ),
            "Content-Type": "application/json",
        }

    def _handle_response(
        self,
        response,
        endpoint,
        *,
        is_write=False,
    ):
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
                "Paystack request failed. "
                "Endpoint=%s HTTP Status=%s Message=%s",
                endpoint,
                response.status_code,
                provider_message,
            )

            if is_write and response.status_code >= 500:
                raise PaystackRequestUncertain(
                    "Paystack returned a server error. "
                    "The request outcome is uncertain."
                ) from error

            raise ValidationError(
                f"Paystack rejected the request: "
                f"{provider_message}"
            ) from error

        except RequestException as error:
            logger.exception(
                "Paystack request failed: %s",
                endpoint,
            )

            if is_write:
                raise PaystackRequestUncertain(
                    "The Paystack request outcome is uncertain."
                ) from error

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

            if is_write:
                raise PaystackRequestUncertain(
                    "Paystack returned an invalid response. "
                    "The request outcome is uncertain."
                ) from error

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

            raise PaystackRequestUncertain(
                "The Paystack request outcome is uncertain."
            ) from error

        return self._handle_response(
            response,
            endpoint,
            is_write=True,
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