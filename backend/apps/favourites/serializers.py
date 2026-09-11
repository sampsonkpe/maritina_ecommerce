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

    product_image = serializers.SerializerMethodField()

    def get_product_image(self, obj):
        primary_image = (
            obj.product.images
            .filter(is_primary=True)
            .first()
        )

        if primary_image and primary_image.image:
            return primary_image.image

        first_image = (
            obj.product.images
            .order_by("id")
            .first()
        )

        if first_image and first_image.image:
            return first_image.image

        if obj.product.image:
            return obj.product.image

        return None

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