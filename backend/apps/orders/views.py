from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import OrderService
from .serializers import OrderSerializer
from .models import Order


class CreateOrderView(APIView):

    def post(self, request):
        try:
            order = OrderService.create_order_from_cart(request.user)

            return Response({
                "message": "Order created successfully",
                "order": OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserOrdersView(APIView):

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)

        return Response(serializer.data)