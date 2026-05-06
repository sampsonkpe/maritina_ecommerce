from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    full_name = serializers.CharField()
    password = serializers.CharField(write_only=True)


    def validate(self, data):
        if not data.get("email") and not data.get("phone"):
            raise serializers.ValidationError("Email or phone is required")
        return data