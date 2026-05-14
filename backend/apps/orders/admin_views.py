from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .models import Order
from .serializers import OrderSerializer


class AdminOrdersView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        orders = Order.objects.all().order_by("-created_at")

        serializer = OrderSerializer(orders, many=True)

        return Response(serializer.data)


class UpdateOrderStatusView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):

        try:
            order = Order.objects.get(id=order_id)

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")

        valid_statuses = [
            Order.STATUS_PENDING,
            Order.STATUS_PAID,
            Order.STATUS_PREPARING,
            Order.STATUS_OUT_FOR_DELIVERY,
            Order.STATUS_DELIVERED,
        ]

        if new_status not in valid_statuses:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        return Response({
            "message": "Order status updated",
            "status": order.status
        })