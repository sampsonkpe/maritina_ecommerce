from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from .models import Payment
from .services.payment_service import PaymentService


class AdminPaymentsView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        payments = Payment.objects.all().order_by("-created_at")

        data = [
            {
                "id": payment.id,
                "reference": payment.reference,
                "amount": payment.amount,
                "status": payment.status,
                "provider": payment.provider,
                "order_id": (
                    payment.order.id
                    if payment.order
                    else None
                ),
                "created_at": payment.created_at,
            }
            for payment in payments
        ]

        return Response(data)


class AdminPaymentRefundView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request, payment_id):

        payment = get_object_or_404(
            Payment,
            id=payment_id,
        )

        amount = request.data.get("amount")

        if amount is not None:
            try:
                amount = int(amount)
            except (TypeError, ValueError):
                return Response(
                    {"error": "Invalid refund amount."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            result = PaymentService.refund(
                payment,
                amount=amount,
            )

        except ValidationError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.refresh_from_db()

        return Response(
            {
                "message": "Refund initiated successfully.",
                "payment": {
                    "id": payment.id,
                    "reference": payment.reference,
                    "status": payment.status,
                    "amount": payment.amount,
                    "refunded_amount": (
                        payment.refunded_amount
                    ),
                    "refund_reference": (
                        payment.refund_reference
                    ),
                    "refunded_at": (
                        payment.refunded_at
                    ),
                },
                "provider_response": result,
            },
            status=status.HTTP_200_OK,
        )