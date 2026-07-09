from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .serializers import OrderSerializer
from .services import OrderService


class AdminOrdersView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        orders = OrderService.list_admin_orders(
            status_filter=request.query_params.get("status"),
            delivery_filter=request.query_params.get("delivery_type"),
            search=request.query_params.get("search"),
        )

        serializer = OrderSerializer(
            orders,
            many=True,
        )

        return Response(serializer.data)


class UpdateOrderStatusView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):

        try:

            order = OrderService.update_order_status(
                order_id=order_id,
                new_status=request.data.get("status"),
                updated_by=request.user,
            )

            return Response(
                {
                    "message": "Order status updated",
                    "status": order.status,
                }
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )