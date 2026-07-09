from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import OrderService
from .serializers import OrderSerializer
from .models import Order

from apps.common.constants import DELIVERY

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        delivery_type = request.data.get(
            "delivery_type",
            DELIVERY
        )

        address_id = request.data.get("address_id")
        address_id = int(address_id) if address_id else None

        try:

            order = OrderService.create_order_from_cart(
                user=request.user,
                delivery_type=delivery_type,
                address_id=address_id
            )

            return Response({
                "message": "Order created successfully",
                "order": OrderSerializer(order).data,
                "summary": {
                    "subtotal": order.total_amount - order.delivery_fee,
                    "delivery_fee": order.delivery_fee,
                    "total_amount": order.total_amount
                }
            }, status=status.HTTP_201_CREATED)

        except ValueError as e:

            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        orders = (
            Order.objects
            .filter(user=request.user)
            .order_by("-created_at")
        )

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)