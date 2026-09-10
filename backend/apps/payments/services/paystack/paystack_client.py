import logging

import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from requests.exceptions import RequestException


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

    def post(self, endpoint, payload):
        url = f"{self.BASE_URL}{endpoint}"

        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._headers(),
                timeout=15,
            )

            response.raise_for_status()
            return response.json()

        except RequestException as error:
            logger.exception(
                "Paystack POST request failed: %s",
                endpoint,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        except ValueError as error:
            logger.exception(
                "Paystack returned invalid JSON for %s.",
                endpoint,
            )

            raise ValidationError(
                "Paystack returned an invalid response. "
                "Please try again."
            ) from error

    def get(self, endpoint):
        url = f"{self.BASE_URL}{endpoint}"

        try:
            response = requests.get(
                url,
                headers=self._headers(),
                timeout=15,
            )

            response.raise_for_status()
            return response.json()

        except RequestException as error:
            logger.exception(
                "Paystack GET request failed: %s",
                endpoint,
            )

            raise ValidationError(
                "Unable to contact Paystack. "
                "Please try again."
            ) from error

        except ValueError as error:
            logger.exception(
                "Paystack returned invalid JSON for %s.",
                endpoint,
            )

            raise ValidationError(
                "Paystack returned an invalid response. "
                "Please try again."
            ) from error