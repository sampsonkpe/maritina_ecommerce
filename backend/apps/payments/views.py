from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.orders.models import Order
from apps.payments.services.service import PaymentService


class InitializePaymentView(APIView):

    def post(self, request):
        order_id = request.data.get("order_id")

        try:
            order = Order.objects.get(id=order_id, user=request.user)

            service = PaymentServiceFactory.get_service()

            response = service.initialize_payment(
                order=order,
                email=request.user.email or "test@example.com"
            )

            return Response(response, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class VerifyPaymentView(APIView):

    def get(self, request, reference):

        service = PaymentServiceFactory.get_service()

        response = service.verify_payment(reference)

        # SAFE CHECK (mock + future Paystack compatibility)
        if response.get("status") is True:
            return Response({
                "message": "Payment verified successfully",
                "data": response
            }, status=status.HTTP_200_OK)

        return Response({
            "message": "Payment verification failed",
            "data": response
        }, status=status.HTTP_400_BAD_REQUEST)