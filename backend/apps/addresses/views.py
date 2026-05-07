from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Address


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)

        data = [
            {
                "id": a.id,
                "label": a.label,
                "address_text": a.address_text,
                "is_default": a.is_default
            }
            for a in addresses
        ]

        return Response(data)

    def post(self, request):
        label = request.data.get("label")
        address_text = request.data.get("address_text")

        if not label or not address_text:
            return Response(
                {"error": "label and address_text are required"},
                status=400
            )

        address = Address.objects.create(
            user=request.user,
            label=label,
            address_text=address_text
        )

        return Response({"id": address.id}, status=201)