from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import FavouriteItemSerializer
from .services import FavouriteService


class FavouritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = FavouriteService.list_items(
            request.user,
        )

        serializer = FavouriteItemSerializer(
            items,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class FavouritesAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get(
            "variant_id"
        )

        if not variant_id:
            return Response(
                {
                    "error": (
                        "Variant ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item, created = (
                FavouriteService.add_item(
                    user=request.user,
                    variant_id=variant_id,
                )
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = FavouriteItemSerializer(
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


class FavouritesRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, variant_id):
        try:
            FavouriteService.remove_item(
                user=request.user,
                variant_id=variant_id,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": (
                    "Product variant removed "
                    "from Favourites."
                )
            },
            status=status.HTTP_200_OK,
        )