from rest_framework import serializers

from apps.common.constants import DELIVERY_TYPE_CHOICES


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

        # ---------------------------------------------
        # Authenticated customer
        # ---------------------------------------------

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

        # ---------------------------------------------
        # Guest customer
        # ---------------------------------------------

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