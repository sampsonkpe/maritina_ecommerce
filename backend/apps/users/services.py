from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken

import hashlib
import re
import secrets

from .models import EmailVerificationToken
from django.core.mail import send_mail

User = get_user_model()


class UserService:

    @staticmethod
    def register(username, email, phone, full_name, password):

        if username and User.objects.filter(username=username).exists():
            raise ValueError("Username already exists")

        if email and User.objects.filter(email=email).exists():
            raise ValueError("Email already exists")

        if phone and User.objects.filter(phone=phone).exists():
            raise ValueError("Phone already exists")

        user = User.objects.create_user(
            username=username,
            email=email,
            phone=phone,
            full_name=full_name,
            password=password,
        )

        return user


    @staticmethod
    def login(identifier, password):

        email_pattern = r"[^@]+@[^@]+\.[^@]+"

        if re.match(email_pattern, str(identifier)):
            user = User.objects.filter(
                email=identifier
            ).first()

        elif str(identifier).isdigit():
            user = User.objects.filter(
                phone=identifier
            ).first()

        else:
            user = User.objects.filter(
                username=identifier
            ).first()

        if (
            user
            and user.is_active
            and user.check_password(password)
        ):
            return user

        return None


    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    @staticmethod
    def create_email_verification_token(user):

        if not user.email:
            raise ValueError(
                "This account does not have an email address."
            )

        if user.email_verified:
            return None

        # Invalidate previous verification tokens.
        EmailVerificationToken.objects.filter(
            user=user,
            used_at__isnull=True,
        ).delete()

        raw_token = secrets.token_urlsafe(32)

        token_hash = hashlib.sha256(
            raw_token.encode()
        ).hexdigest()

        EmailVerificationToken.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=(
                timezone.now()
                + timedelta(hours=24)
            ),
        )

        return raw_token


    @staticmethod
    def verify_email(token):

        token_hash = hashlib.sha256(
            token.encode()
        ).hexdigest()

        verification_token = (
            EmailVerificationToken.objects
            .select_related("user")
            .filter(
                token_hash=token_hash,
            )
            .first()
        )

        if not verification_token:
            raise ValueError(
                "Invalid verification link."
            )

        user = verification_token.user

        # The email has already been verified.
        if user.email_verified:
            return user, False

        if verification_token.expires_at < timezone.now():
            raise ValueError(
                "This verification link has expired."
            )

        user.email_verified = True
        user.email_verified_at = timezone.now()

        user.save(
            update_fields=[
                "email_verified",
                "email_verified_at",
            ]
        )

        verification_token.used_at = timezone.now()

        verification_token.save(
            update_fields=["used_at"]
        )

        return user, True

    @staticmethod
    def send_email_verification(user, raw_token):

        verification_url = (
            "http://localhost:5173/verify-email/"
            f"{raw_token}"
        )

        send_mail(
            subject="Verify your KAHWƐ account",
            message=(
                "Welcome to KAHWƐ by Maritina Foods.\n\n"
                "Please verify your email address by "
                "opening the following link:\n\n"
                f"{verification_url}\n\n"
                "This link expires in 24 hours."
            ),
            from_email=None,
            recipient_list=[user.email],
        )

    @staticmethod
    def update_profile(user, validated_data):
        for field, value in validated_data.items():
            setattr(user, field, value)

        user.save()

        return user


    @staticmethod
    def change_password(
        user,
        current_password,
        new_password,
    ):
        if not user.check_password(
            current_password
        ):
            raise ValueError(
                "Current password is incorrect."
            )

        user.set_password(new_password)

        user.save(
            update_fields=[
                "password",
                "updated_at",
            ]
        )