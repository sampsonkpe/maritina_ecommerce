from rest_framework import serializers
from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="variant.product.name")
    variant_name = serializers.ReadOnlyField(source="variant.name")
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ["id", "variant", "product_name", "variant_name", "quantity", "total_price"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "created_at"]