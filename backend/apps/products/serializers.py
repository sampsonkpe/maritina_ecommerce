from rest_framework import serializers

from .models import (
    Category,
    Product,
    ProductVariant,
)


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "name",
            "price",
            "stock",
            "is_available",
        ]


class ProductSerializer(serializers.ModelSerializer):

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "name",
            "description",
            "image",
            "created_at",
            "variants",
        ]