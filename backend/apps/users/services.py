from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import re

User = get_user_model()


class UserService:

    @staticmethod
    def register(email, phone, full_name, password):

        if email and User.objects.filter(email=email).exists():
            raise ValueError("Email already exists")

        if phone and User.objects.filter(phone=phone).exists():
            raise ValueError("Phone already exists")

        user = User.objects.create_user(
            email=email,
            phone=phone,
            full_name=full_name,
            password=password
        )

        return user


    @staticmethod
    def login(identifier, password):

        email_pattern = r"[^@]+@[^@]+\.[^@]+"

        if re.match(email_pattern, identifier):
            user = User.objects.filter(email=identifier).first()
        else:
            user = User.objects.filter(phone=identifier).first()

        if user and user.is_active and user.check_password(password):
            return user

        return None


    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }