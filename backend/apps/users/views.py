from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer
from .services import UserService

from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        data = serializer.validated_data

        try:

            user = UserService.register(
                username=data.get("username"),
                email=data.get("email"),
                phone=data.get("phone"),
                full_name=data["full_name"],
                password=data["password"],
            )

            tokens = UserService.get_tokens(user)

            return Response(
                {
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "phone": user.phone,
                        "full_name": user.full_name,
                        "is_staff": user.is_staff,
                    },
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "is_staff": user.is_staff,
            }
        })

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        identifier = request.data.get("identifier")
        password = request.data.get("password")

        user = UserService.login(identifier, password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=401
            )

        tokens = UserService.get_tokens(user)

        return Response({
            "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_staff": user.is_staff,
        },
            "tokens": tokens
        })
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"}, status=200)

        except Exception:
            return Response({"error": "Invalid token"}, status=400)