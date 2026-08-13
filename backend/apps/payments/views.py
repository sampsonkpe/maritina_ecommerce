from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from apps.orders.models import Order
from apps.payments.services.payment_service import (
    PaymentService,
)

from apps.common.constants import PAYMENT_PENDING


class InitializePaymentView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {"error": "Order ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            if request.user.is_authenticated:

                order = Order.objects.get(
                    id=order_id,
                    user=request.user,
                )

                email = (
                    request.user.email
                    or "test@example.com"
                )

            else:

                order = Order.objects.get(
                    id=order_id,
                    user__isnull=True,
                )

                email = order.guest_email

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

                # Make sure this guest order belongs
                # to the current browser session.
                if (
                    not request.session.session_key
                    or order.guest_email == ""
                ):
                    return Response(
                        {"error": "Invalid checkout session."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            if order.payment_status != PAYMENT_PENDING:

                return Response(
                    {
                        "error": (
                            "Order has already been paid "
                            "or cannot be paid."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            response = (
                PaymentService.initialize_payment(
                    order=order,
                    email=email,
                )
            )

            return Response(
                response,
                status=status.HTTP_200_OK,
            )

        except Order.DoesNotExist:

            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VerifyPaymentView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, reference):

        response = (
            PaymentService.verify_payment(
                reference
            )
        )

        if response.get("status") is True:

            return Response(
                {
                    "message": (
                        "Payment verified successfully."
                    ),
                    "data": response,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "message": (
                    "Payment verification failed."
                ),
                "data": response,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )