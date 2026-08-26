from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory


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
        read_only=True,
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    address_text = serializers.SerializerMethodField()

    def get_address_text(self, obj):
        address = getattr(
            obj,
            "delivery_address",
            None,
        )

        if address:
            if isinstance(address, str):
                return address

            parts = []

            for attr in (
                "line1",
                "line2",
                "city",
                "state",
                "postal_code",
                "country",
                "street",
                "address_line",
            ):
                value = getattr(
                    address,
                    attr,
                    None,
                )

                if value:
                    parts.append(str(value))

            if parts:
                return ", ".join(parts)

        parts = []

        for attr in (
            "address",
            "guest_address",
            "guest_full_name",
            "guest_phone",
        ):
            value = getattr(
                obj,
                attr,
                None,
            )

            if value:
                parts.append(str(value))

        return ", ".join(parts) if parts else ""

    delivery_type_display = serializers.SerializerMethodField()

    def get_delivery_type_display(self, obj):
        return obj.get_delivery_type_display()

    payment_method = serializers.SerializerMethodField()

    def get_payment_method(self, obj):
        payment = (
            obj.payments
            .filter(
                status="SUCCESS"
            )
            .order_by("-created_at")
            .first()
        )

        if not payment:
            return None

        return payment.payment_method

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
            "payment_method",
            "paid_at",
            "address",
            "address_text",
            "items",
            "created_at",
            "updated_at",
        ]


class OrderStatusHistorySerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = OrderStatusHistory
        fields = [
            "old_status",
            "new_status",
            "created_at",
        ]


class OrderDetailSerializer(OrderSerializer):

    status_history = OrderStatusHistorySerializer(
        many=True,
        read_only=True,
    )

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + [
            "status_history",
        ]