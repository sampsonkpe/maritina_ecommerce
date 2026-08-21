from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.utils import timezone
from apps.checkout.models import CheckoutTransaction
from apps.payments.services.payment_service import PaymentService


class InitializePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        checkout_id = request.data.get(
            "checkout_id"
        )

        if not checkout_id:
            return Response(
                {
                    "error": (
                        "Checkout ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            checkout = (
                CheckoutTransaction.objects
                .get(id=checkout_id)
            )

            # -----------------------------------------
            # Ownership protection
            # -----------------------------------------

            if request.user.is_authenticated:

                if checkout.user_id != request.user.id:
                    return Response(
                        {"error": "Invalid checkout."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                email = request.user.email

            else:

                if (
                    not request.session.session_key
                    or checkout.session_id
                    != request.session.session_key
                ):
                    return Response(
                        {"error": "Invalid checkout session."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                email = checkout.guest_email

            if not email:
                return Response(
                    {
                        "error": (
                            "A valid email address "
                            "is required for payment."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if checkout.status != (
                CheckoutTransaction.STATUS_PENDING
            ):
                return Response(
                    {
                        "error": (
                            "This checkout is no longer "
                            "available for payment."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if checkout.expires_at <= timezone.now():
                checkout.status = (
                    CheckoutTransaction.STATUS_EXPIRED
                )

                checkout.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                return Response(
                    {
                        "error": (
                            "This checkout session "
                            "has expired."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            response = (
                PaymentService.initialize_payment(
                    checkout=checkout,
                    email=email,
                )
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        except CheckoutTransaction.DoesNotExist:
            return Response(
                {"error": "Checkout not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VerifyPaymentView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, reference):

        response = PaymentService.verify_payment(
            reference
        )

        if response.get("status") is True:

            order = response.get("order")

            return Response(
                {
                    "status": True,
                    "message": (
                        "Payment verified successfully."
                    ),
                    "order": order,
                    "data": response,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": False,
                "message": (
                    "Payment verification failed."
                ),
                "data": response,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )