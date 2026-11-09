from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status

from .models import Order
from .serializers import OrderSerializer
from .services import OrderService

from apps.common.constants import STATUS_CANCELLED


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = OrderService.list_admin_orders(
            status_filter=request.query_params.get("status"),
            payment_status_filter=request.query_params.get(
                "payment_status"
            ),
            delivery_filter=request.query_params.get(
                "delivery_type"
            ),
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
                    "message": "Order status updated.",
                    "status": order.status,
                },
                status=status.HTTP_200_OK,
            )

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except (ValueError, ValidationError) as error:
            message = (
                error.messages[0]
                if isinstance(error, ValidationError) and error.messages
                else str(error)
            )

            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminCancelOrderView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, order_id):
        try:
            order = OrderService.admin_cancel_order(
                order_id=order_id,
                updated_by=request.user,
            )

            # Cancellation is complete only after the refund
            # has been successfully processed.
            if order.status == STATUS_CANCELLED:
                return Response(
                    {
                        "message": "Order cancelled successfully.",
                        "status": order.status,
                        "payment_status": order.payment_status,
                    },
                    status=status.HTTP_200_OK,
                )

            # Refund is still awaiting confirmation.
            # The order must remain in its existing status.
            return Response(
                {
                    "message": (
                        "Refund initiated. Order cancellation "
                        "is pending confirmation."
                    ),
                    "status": order.status,
                    "payment_status": order.payment_status,
                },
                status=status.HTTP_202_ACCEPTED,
            )

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as error:
            return Response(
                {
                    "error": (
                        error.messages[0]
                        if error.messages
                        else "Unable to process the cancellation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )