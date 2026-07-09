from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Address
from .serializers import AddressSerializer
from .services import AddressService


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = AddressService.list_addresses(
            request.user
        )

        serializer = AddressSerializer(
            addresses,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        address = AddressService.create_address(
            request.user,
            serializer.validated_data,
        )

        return Response(
            AddressSerializer(address).data,
            status=status.HTTP_201_CREATED,
        )


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        serializer = AddressSerializer(
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        address = AddressService.update_address(
            request.user,
            pk,
            serializer.validated_data,
        )

        return Response(
            AddressSerializer(address).data
        )

    def delete(self, request, pk):
        AddressService.delete_address(
            request.user,
            pk,
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        AddressService.set_default_address(
            request.user,
            pk,
        )

        return Response({
            "message": "Default address updated"
        })