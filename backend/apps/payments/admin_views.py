from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from .models import Payment


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
                "order_id": payment.order.id,
                "created_at": payment.created_at,
            }
            for payment in payments
        ]

        return Response(data)