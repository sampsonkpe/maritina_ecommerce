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
            "order",
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

class CheckoutSerializer(serializers.Serializer):

    delivery_type = serializers.ChoiceField(
        choices=DELIVERY_TYPE_CHOICES
    )

    address_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    full_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):

        request = self.context["request"]

        user = request.user

        delivery_type = attrs["delivery_type"]

        if user.is_authenticated:

            if (
                delivery_type == "DELIVERY"
                and not attrs.get("address_id")
            ):
                raise serializers.ValidationError(
                    {
                        "address_id":
                        "Select a delivery address."
                    }
                )

        else:

            required_fields = [
                "full_name",
                "email",
                "phone",
            ]

            if delivery_type == "DELIVERY":
                required_fields.append("address")

            errors = {}

            for field in required_fields:

                if not attrs.get(field):

                    errors[field] = (
                        "This field is required."
                    )

            if errors:
                raise serializers.ValidationError(
                    errors
                )

        return attrs