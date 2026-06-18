from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .models import Order
from .models import OrderStatusHistory
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

        allowed_transitions = {
        Order.STATUS_PENDING: [
            Order.STATUS_PAID,
        ],

        Order.STATUS_PAID: [
            Order.STATUS_PREPARING,
        ],

        Order.STATUS_PREPARING: [
            Order.STATUS_OUT_FOR_DELIVERY,
        ],

        Order.STATUS_OUT_FOR_DELIVERY: [
            Order.STATUS_DELIVERED,
        ],

        Order.STATUS_DELIVERED: [],
    }

        if new_status not in allowed_transitions.get(order.status, []):
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
        order.updated_by = request.user
        order.save()

        return Response({
            "message": "Order status updated",
            "status": order.status
        })