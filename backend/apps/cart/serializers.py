from rest_framework import serializers
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(
        source="variant.product.name"
    )

    variant_name = serializers.ReadOnlyField(
        source="variant.name"
    )

    unit_price = serializers.ReadOnlyField(
        source="variant.price"
    )

    subtotal = serializers.ReadOnlyField(
        source="total_price"
    )

    class Meta:
        model = CartItem
        fields = [
            "id",
            "variant",
            "product_name",
            "variant_name",
            "unit_price",
            "quantity",
            "subtotal",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    item_count = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()
    delivery_fee = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "item_count",
            "subtotal",
            "delivery_fee",
            "total",
            "created_at",
        ]

    def get_item_count(self, obj):
        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_subtotal(self, obj):
        return sum(
            item.total_price
            for item in obj.items.all()
        )

    def get_delivery_fee(self, obj):
        return 20 if obj.items.exists() else 0

    def get_total(self, obj):
        return (
            self.get_subtotal(obj)
            + self.get_delivery_fee(obj)
        )