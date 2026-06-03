from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services import CartService
from .serializers import CartSerializer


def get_session_id(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


class CartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):

        cart = CartService.get_or_create_cart(
            user=request.user if request.user.is_authenticated else None,
            session_id=get_session_id(request)
        )

        return Response(CartSerializer(cart).data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart = CartService.get_or_create_cart(
            user=request.user,
            session_id=get_session_id(request)
        )

        variant_id = request.data.get("variant_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            item = CartService.add_to_cart(
                cart,
                variant_id,
                quantity
            )

            return Response(
                {
                    "message": "Item added to cart",
                    "item_id": item.id
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart = CartService.get_or_create_cart(
            user=request.user if request.user.is_authenticated else None,
            session_id=get_session_id(request)
        )

        variant_id = request.data.get("variant_id")
        quantity = int(request.data.get("quantity"))

        try:
            CartService.update_quantity(cart, variant_id, quantity)
            return Response({"message": "Cart updated"})

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart = CartService.get_or_create_cart(
            user=request.user if request.user.is_authenticated else None,
            session_id=get_session_id(request)
        )

        CartService.remove_item(cart, request.data.get("variant_id"))

        return Response({"message": "Item removed"})


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        cart = CartService.get_or_create_cart(
            user=request.user if request.user.is_authenticated else None,
            session_id=get_session_id(request)
        )

        CartService.clear_cart(cart)

        return Response({"message": "Cart cleared"})