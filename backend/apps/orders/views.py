from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Order

from .services import OrderService
from .serializers import OrderSerializer


class UserOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = OrderService.list_user_orders(
            request.user,
        )

        serializer = OrderSerializer(
            orders,
            many=True,
        )

        return Response(serializer.data)


class UserOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):

        order = OrderService.get_user_order(
            order_id=order_id,
            user=request.user,
        )

        if not order:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderSerializer(order)

        return Response(serializer.data)


class ClaimGuestOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            claimed_count = (
                OrderService.claim_guest_orders(
                    request.user
                )
            )

            return Response(
                {
                    "message": (
                        "Guest orders claimed successfully."
                    ),
                    "claimed_count": claimed_count,
                }
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = OrderService.cancel_order(
                order_id=order_id,
                user=request.user,
            )

            serializer = OrderSerializer(order)

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )