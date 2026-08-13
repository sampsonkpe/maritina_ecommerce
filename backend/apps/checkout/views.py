from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .services import CheckoutService

from apps.orders.serializers import CheckoutSerializer


class CreateCheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not request.session.session_key:
            request.session.create()

        serializer = CheckoutSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            checkout = CheckoutService.create_checkout(
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
                    "id": checkout.id,
                    "status": checkout.status,
                    "subtotal": checkout.subtotal,
                    "delivery_fee": checkout.delivery_fee,
                    "total_amount": checkout.total_amount,
                    "expires_at": checkout.expires_at,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )