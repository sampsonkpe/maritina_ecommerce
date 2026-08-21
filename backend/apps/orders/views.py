from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

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