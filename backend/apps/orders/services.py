from django.db import transaction
from django.db.models import F

from .models import Order, OrderItem
from apps.cart.models import Cart


class OrderService:

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(user):

        cart = Cart.objects.select_for_update().get(user=user)
        items = cart.items.select_related("product")

        if not items.exists():
            raise ValueError("Cart is empty")

        order = Order.objects.create(
            user=user,
            total_amount=0
        )

        total = 0

        for item in items:
            product = item.product

            if product.stock < item.quantity:
                raise ValueError(f"Insufficient stock for {product.name}")

            subtotal = product.price * item.quantity
            total += subtotal

            OrderItem.objects.create(
                order=order,
                product_name=product.name,
                product_price=product.price,
                quantity=item.quantity,
                subtotal=subtotal
            )

            # SAFE STOCK REDUCTION
            product.stock = F("stock") - item.quantity
            product.save()

        order.total_amount = total
        order.save()

        # clear cart after checkout
        cart.items.all().delete()

        return order