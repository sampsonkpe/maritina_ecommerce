from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

User = get_user_model()


class AuthService:

    @staticmethod
    def register(validated_data):
        user = User.objects.create_user(
            email=validated_data.get("email"),
            phone=validated_data.get("phone"),
            full_name=validated_data["full_name"],
            password=validated_data["password"]
        )

        return user


    @staticmethod
    def login(identifier, password):
        user = None

        # EMAIL LOGIN
        if "@" in identifier:
            user = User.objects.filter(email=identifier).first()

        # PHONE LOGIN
        else:
            user = User.objects.filter(phone=identifier).first()

        if user and user.check_password(password):
            return user

        return None


    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }