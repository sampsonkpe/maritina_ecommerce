from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Address
from .serializers import AddressSerializer
from django.shortcuts import get_object_or_404

class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(
            user=request.user).order_by(
                "-is_default",
                "-created_at",
            )
        
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)

        if serializer.is_valid():
            has_addresses = Address.objects.filter(
                user=request.user
            ).exists()

            serializer.save(
                user=request.user,
                is_default=not has_addresses,
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    
class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        address = get_object_or_404(
            Address,
            pk=pk,
            user=request.user
        )

        serializer = AddressSerializer(
            address,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        address = get_object_or_404(
            Address,
            pk=pk,
            user=request.user
        )

        address.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
    
class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        address = get_object_or_404(
            Address,
            pk=pk,
            user=request.user
        )

        Address.objects.filter(
            user=request.user,
            is_default=True
        ).update(is_default=False)

        address.is_default = True
        address.save()

        return Response({
            "message": "Default address updated"
        })