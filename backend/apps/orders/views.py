from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import OrderService
from .serializers import OrderSerializer

from apps.common.constants import DELIVERY


class CreateOrderView(APIView):
    permission_classes = []

    def post(self, request):
        if not request.session.session_key:
            request.session.create()
            
        serializer = OrderSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            order = OrderService.create_order_from_cart(
                user=(
                    request.user
                    if request.user.is_authenticated
                    else None
                ),

                session_id=request.session.session_key,

                delivery_type=data["delivery_type"],

                address_id=data.get("address_id"),

                guest_data=(
                    {
                        "full_name": data.get("full_name"),
                        "email": data.get("email"),
                        "phone": data.get("phone"),
                        "address": data.get("address"),
                    }
                    if not request.user.is_authenticated
                    else None
                ),
            )

            return Response(
                {
                    "message": "Order created successfully",
                    "order": OrderSerializer(order).data,
                    "summary": {
                        "subtotal": order.subtotal,
                        "delivery_fee": order.delivery_fee,
                        "total_amount": order.total_amount,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


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

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )