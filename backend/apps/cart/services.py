from django.db import transaction
from .models import Cart, CartItem
from apps.products.models import ProductVariant


class CartService:

    @staticmethod
    def get_or_create_cart(user=None, session_id=None):

        lookup = (
            {"user": user}
            if user.is_authenticated
            else {"session_id": session_id}
        )

        cart, _ = Cart.objects.get_or_create(**lookup)

        return (
            Cart.objects
            .prefetch_related(
                "items__variant__product",
            )
            .get(id=cart.id)
        )


    @staticmethod
    @transaction.atomic
    def add_to_cart(cart, variant_id, quantity=1):
        
        if quantity < 1:
            raise ValueError("Cannot add less than 1.")

        variant = ProductVariant.objects.select_for_update().get(id=variant_id)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={"quantity": quantity}
        )

        new_qty = item.quantity + quantity if not created else quantity

        if variant.stock < new_qty:
            raise ValueError("Insufficient stock")

        item.quantity = new_qty
        item.save()

        return item


    @staticmethod
    def update_quantity(cart, variant_id, quantity):

        if quantity <= 0:
            CartItem.objects.filter(cart=cart, variant_id=variant_id).delete()
            return

        item = (
            CartItem.objects
            .select_related("variant")
            .get(
                cart=cart,
                variant_id=variant_id,
            )
        )

        if item.variant.stock < quantity:
            raise ValueError("Insufficient stock")

        item.quantity = quantity
        item.save()

        return item


    @staticmethod
    def remove_item(cart, variant_id):
        CartItem.objects.filter(cart=cart, variant_id=variant_id).delete()


    @staticmethod
    def clear_cart(cart):
        cart.items.all().delete()