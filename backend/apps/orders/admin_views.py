from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from django.db.models import Q

from .models import Order
from .models import OrderStatusHistory
from .serializers import OrderSerializer

from apps.common.constants import (
    STATUS_PENDING,
    STATUS_PREPARING,
    STATUS_OUT_FOR_DELIVERY,
    STATUS_DELIVERED,
    STATUS_CANCELLED,
    ORDER_STATUS_TRANSITIONS,
)

class AdminOrdersView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        orders = Order.objects.all()

        status_filter = request.query_params.get("status")
        delivery_filter = request.query_params.get("delivery_type")
        search = request.query_params.get("search")

        if status_filter:
            orders = orders.filter(
                status=status_filter
            )

        if delivery_filter:
            orders = orders.filter(
                delivery_type=delivery_filter
            )

        if search:

            search_query = (
                Q(user__email__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__phone__icontains=search)
            )

            if search.isdigit():
                search_query |= Q(id=int(search))

            orders = orders.filter(search_query)

        orders = orders.order_by("-created_at")

        serializer = OrderSerializer(
            orders,
            many=True
        )

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
        
        if new_status not in ORDER_STATUS_TRANSITIONS.get(
            order.status,
            [],
        ):
            return Response(
                {
                    "error":
                    f"Cannot move Order#{order.id} from "
                    f"{order.status} "
                    f"to {new_status}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = order.status

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            updated_by=request.user
        )

        order.status = new_status
        order.save()

        return Response({
            "message": "Order status updated",
            "status": order.status
        })