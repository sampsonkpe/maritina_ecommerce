from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    full_name = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        phone = data.get("phone")

        if not email and not phone:
            raise serializers.ValidationError("Email or phone is required")

        return data


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)