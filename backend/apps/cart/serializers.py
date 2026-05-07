from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_name", "quantity", "total_price"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "created_at"]