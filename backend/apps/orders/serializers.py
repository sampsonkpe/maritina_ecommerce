from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
        )
    
    delivery_type_display = (
        serializers.SerializerMethodField()
    )

    def get_delivery_type_display(
        self,
        obj
    ):
        return obj.get_delivery_type_display()

    class Meta:
        model = Order

        fields = [
            "id",
            "user",
            "user_email",
            "subtotal",
            "delivery_fee",
            "total_amount",
            "delivery_type",
            "delivery_type_display",
            "status",
            "address",
            "items",
            "created_at",
            "updated_at",
        ]