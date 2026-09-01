from rest_framework import serializers

from .models import FavouriteItem
from apps.products.models import ProductVariant


class FavouriteVariantSerializer(
    serializers.ModelSerializer
):

    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_image = serializers.URLField(
        source="product.image",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_image",
            "name",
            "price",
            "stock",
            "is_available",
        ]


class FavouriteItemSerializer(
    serializers.ModelSerializer
):

    variant = FavouriteVariantSerializer(
        read_only=True,
    )

    class Meta:
        model = FavouriteItem
        fields = [
            "id",
            "variant",
            "created_at",
        ]