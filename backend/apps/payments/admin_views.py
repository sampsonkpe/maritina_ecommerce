from decimal import Decimal, InvalidOperation

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from .models import Payment
from .services.payment_service import PaymentService

from apps.common.models import AuditLog
from apps.common.services import record_admin_action


class AdminPaymentsView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        payments = (
            Payment.objects
            .select_related("order")
            .prefetch_related("refunds")
            .order_by("-created_at")
        )

        data = [
            {
                "id": payment.id,
                "reference": payment.reference,
                "amount": payment.amount,
                "status": payment.status,
                "provider": payment.provider,
                "payment_method": (
                    payment.payment_method
                ),
                "refunded_amount": (
                    payment.refunded_amount
                ),
                "order_id": (
                    payment.order.id
                    if payment.order
                    else None
                ),
                "refunds": [
                    {
                        "id": refund.id,
                        "amount": refund.amount,
                        "status": refund.status,
                        "refund_reference": (
                            refund.refund_reference
                        ),
                        "transaction_reference": (
                            refund.transaction_reference
                        ),
                        "created_at": (
                            refund.created_at
                        ),
                        "updated_at": (
                            refund.updated_at
                        ),
                        "processed_at": (
                            refund.processed_at
                        ),
                    }
                    for refund in payment.refunds.all()
                ],
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
                amount = Decimal(str(amount))

            except (
                InvalidOperation,
                TypeError,
                ValueError,
            ):
                return Response(
                    {
                        "error": (
                            "Invalid refund amount."
                        )
                    },
                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),
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

        refunds = [
            {
                "id": refund.id,
                "amount": refund.amount,
                "status": refund.status,
                "refund_reference": (
                    refund.refund_reference
                ),
                "transaction_reference": (
                    refund.transaction_reference
                ),
                "created_at": refund.created_at,
                "updated_at": refund.updated_at,
                "processed_at": (
                    refund.processed_at
                ),
            }
            for refund in payment.refunds.order_by(
                "-created_at"
            )
        ]

        record_admin_action(
            admin=request.user,
            action=AuditLog.ACTION_REFUND_INITIATED,
            object_type="Payment",
            object_id=payment.id,
            details={
                "payment_reference": (
                    payment.reference
                ),
                "refund_amount": (
                    str(amount)
                    if amount is not None
                    else None
                ),
                "order_id": payment.order_id,
            },
        )

        return Response(
            {
                "message": (
                    "Refund initiated successfully."
                ),
                "payment": {
                    "id": payment.id,
                    "reference": payment.reference,
                    "status": payment.status,
                    "amount": payment.amount,
                    "refunded_amount": (
                        payment.refunded_amount
                    ),
                },
                "refunds": refunds,
                "provider_response": result,
            },
            status=status.HTTP_200_OK,
        )