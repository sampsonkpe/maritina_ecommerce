from rest_framework import serializers

from .models import Review


class ReviewSerializer(
    serializers.ModelSerializer
):

    customer_first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    variant_name = serializers.CharField(
        source="variant.name",
        read_only=True,
    )

    class Meta:
        model = Review

        fields = [
            "id",
            "customer_first_name",
            "product_name",
            "variant_name",
            "rating",
            "comment",
            "created_at",
        ]


class ReviewCreateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Review

        fields = [
            "product",
            "variant",
            "rating",
            "comment",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value

    

    def validate_comment(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Review comment cannot be empty."
            )

        return value