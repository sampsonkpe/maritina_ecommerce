from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer, LoginSerializer
from .services import AuthService


class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            try:
                user = AuthService.register(serializer.validated_data)

                return Response({
                    "message": "User created successfully",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "phone": user.phone,
                        "full_name": user.full_name
                    }
                }, status=status.HTTP_201_CREATED)

            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data

            user = AuthService.login(
                data["identifier"],
                data["password"]
            )

            if not user:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            tokens = AuthService.get_tokens(user)

            return Response({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "phone": user.phone,
                    "full_name": user.full_name
                },
                "tokens": tokens
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)