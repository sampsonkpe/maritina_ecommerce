from rest_framework import serializers

from .models import FavouriteItem
from apps.products.serializers import ProductSerializer


class FavouriteItemSerializer(
    serializers.ModelSerializer
):

    product = ProductSerializer(
        read_only=True,
    )

    class Meta:
        model = FavouriteItem
        fields = [
            "id",
            "product",
            "created_at",
        ]
