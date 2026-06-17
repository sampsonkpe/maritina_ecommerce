from rest_framework import serializers
from .models import Address


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "address_text",
            "is_default",
            "created_at",
        ]