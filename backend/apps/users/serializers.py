from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "password",
            "full_name",
        ]

        read_only_fields = [
            "id",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "full_name",
            "email_verified",
        ]

        read_only_fields = [
            "id",
            "email",
            "email_verified",
        ]

    def validate_username(self, value):
        user = self.instance

        if (
            value
            and User.objects.filter(
                username=value
            ).exclude(
                id=user.id
            ).exists()
        ):
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        user = self.instance

        if (
            value
            and User.objects.filter(
                email=value
            ).exclude(
                id=user.id
            ).exists()
        ):
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_phone(self, value):
        user = self.instance

        if (
            value
            and User.objects.filter(
                phone=value
            ).exclude(
                id=user.id
            ).exists()
        ):
            raise serializers.ValidationError(
                "Phone number already exists."
            )

        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=6,
    )

    confirm_password = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):
        if (
            attrs["new_password"]
            != attrs["confirm_password"]
        ):
            raise serializers.ValidationError(
                {
                    "confirm_password":
                        "Passwords do not match."
                }
            )

        if (
            attrs["current_password"]
            == attrs["new_password"]
        ):
            raise serializers.ValidationError(
                {
                    "new_password":
                        "New password must be different from your current password."
                }
            )

        return attrs