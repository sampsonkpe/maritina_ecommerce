from django.db import transaction
from .models import Order, OrderItem
from apps.cart.models import Cart
from apps.products.models import Product


class OrderService:

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(user):

        cart = Cart.objects.get(user=user)
        items = cart.items.select_related("product")

        if not items.exists():
            raise ValueError("Cart is empty")

        total = 0

        # create order
        order = Order.objects.create(
            user=user,
            total_amount=0
        )

        # create order items
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

            # reduce stock
            product.stock -= item.quantity
            product.save()

        order.total_amount = total
        order.save()

        # clear cart after order creation
        cart.items.all().delete()

        return order