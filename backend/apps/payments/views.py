from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.orders.models import Order
from .services import PaymentService


class InitializePaymentView(APIView):

    def post(self, request):
        order_id = request.data.get("order_id")

        try:
            order = Order.objects.get(id=order_id, user=request.user)

            response = PaymentService.initialize_payment(
                order=order,
                email=request.user.email or "test@example.com"
            )

            return Response(response)

        except Order.DoesNotExist:
            return Response({
                "error": "Order not found"
            }, status=status.HTTP_404_NOT_FOUND)


class VerifyPaymentView(APIView):

    def get(self, request, reference):

        response = PaymentService.verify_payment(reference)

        if response["data"]["status"] == "success":
            PaymentService.mark_as_paid(reference)

        return Response(response)