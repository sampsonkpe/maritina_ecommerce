from rest_framework import serializers
from .models import Order, OrderItem
from apps.common.constants import (
    DELIVERY_TYPE_CHOICES,
)

class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "variant_name",
            "unit_price",
            "quantity",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
        )
    
    address_text = serializers.SerializerMethodField()

    def get_address_text(self, obj):
        # Prefer explicit delivery_address attribute if present
        address = getattr(obj, "delivery_address", None)

        if address:
            # If it's already a string, return directly
            if isinstance(address, str):
                return address

            # If it's an object (e.g., related Address model), try common fields
            parts = []
            for attr in ("line1", "line2", "city", "state", "postal_code", "country", "street", "address_line"):
                val = getattr(address, attr, None)
                if val:
                    parts.append(str(val))

            if parts:
                return ", ".join(parts)

        # Fallback to any address or address fields on the order itself
        parts = []
        for attr in ("address", "guest_address", "guest_full_name", "guest_phone"):
            val = getattr(obj, attr, None)
            if val:
                parts.append(str(val))

        return ", ".join(parts) if parts else ""

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
            "guest_full_name",
            "guest_email",
            "guest_phone",
            "guest_address",
            "user_email",
            "subtotal",
            "delivery_fee",
            "total_amount",
            "delivery_type",
            "delivery_type_display",
            "status",
            "payment_status",
            "payment_reference",
            "paid_at",
            "address",
            "address_text",
            "items",
            "created_at",
            "updated_at",
        ]