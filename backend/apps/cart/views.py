from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services import CartService
from .serializers import CartSerializer


class CartView(APIView):

    def get(self, request):
        cart = CartService.get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            item = CartService.add_to_cart(
                request.user,
                product_id,
                quantity
            )

            return Response({
                "message": "Item added to cart",
                "item_id": item.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class RemoveFromCartView(APIView):

    def post(self, request):
        product_id = request.data.get("product_id")

        CartService.remove_item(request.user, product_id)

        return Response({
            "message": "Item removed from cart"
        }, status=status.HTTP_200_OK)


class ClearCartView(APIView):

    def post(self, request):
        CartService.clear_cart(request.user)

        return Response({
            "message": "Cart cleared"
        }, status=status.HTTP_200_OK)