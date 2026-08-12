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

    @staticmethod
    @transaction.atomic
    def merge_guest_cart(user, session_id):
        if not user.is_authenticated:
            raise ValueError("Authentication is required.")

        if not session_id:
            return None

        guest_cart = (
            Cart.objects
            .select_for_update()
            .filter(
                session_id=session_id,
                user__isnull=True,
            )
            .first()
        )

        if not guest_cart:
            return CartService.get_or_create_cart(
                user=user,
                session_id=session_id,
            )

        user_cart = (
            Cart.objects
            .select_for_update()
            .filter(user=user)
            .first()
        )

        if not user_cart:
            user_cart = Cart.objects.create(user=user)

        guest_items = (
            guest_cart.items
            .select_related("variant")
            .select_for_update()
        )

        for guest_item in guest_items:

            variant = guest_item.variant

            user_item = (
                user_cart.items
                .filter(variant=variant)
                .first()
            )

            if user_item:
                new_quantity = (
                    user_item.quantity
                    + guest_item.quantity
                )

                if new_quantity > variant.stock:
                    raise ValueError(
                        f"Insufficient stock for {variant.name}."
                    )

                user_item.quantity = new_quantity
                user_item.save(
                    update_fields=["quantity"]
                )

            else:

                if guest_item.quantity > variant.stock:
                    raise ValueError(
                        f"Insufficient stock for {variant.name}."
                    )

                CartItem.objects.create(
                    cart=user_cart,
                    variant=variant,
                    quantity=guest_item.quantity,
                )

        guest_cart.items.all().delete()
        guest_cart.delete()

        return (
            Cart.objects
            .prefetch_related(
                "items__variant__product",
            )
            .get(id=user_cart.id)
        )