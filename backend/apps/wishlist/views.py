from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import WishlistItemSerializer
from .services import WishlistService


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WishlistService.list_items(
            request.user,
        )

        serializer = WishlistItemSerializer(
            items,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class WishlistAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get(
            "product_id"
        )

        if not product_id:
            return Response(
                {
                    "error": (
                        "Product ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item, created = (
                WishlistService.add_item(
                    user=request.user,
                    product_id=product_id,
                )
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = WishlistItemSerializer(
            item,
        )

        return Response(
            {
                "created": created,
                "item": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class WishlistRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        try:
            WishlistService.remove_item(
                user=request.user,
                product_id=product_id,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": (
                    "Product removed from wishlist."
                )
            },
            status=status.HTTP_200_OK,
        )