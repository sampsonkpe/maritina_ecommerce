from django.db import transaction
from django.db.models import F

from .models import Order, OrderItem
from .delivery import DeliveryService

from apps.cart.models import Cart
from apps.addresses.models import Address
from apps.products.models import Product


class OrderService:

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(
        user,
        delivery_type="DELIVERY",
        address_id=None
    ):

        cart = Cart.objects.select_for_update().get(user=user)

        items = (
            cart.items
            .select_related("product")
            .select_for_update()
        )

        if not items.exists():
            raise ValueError("Cart is empty")

        address = None
        delivery_fee = 0

        # DELIVERY FLOW
        if delivery_type == Order.DELIVERY:

            if not address_id:
                raise ValueError("Address is required")

            try:
                address = Address.objects.get(
                    id=address_id,
                    user=user
                )

            except Address.DoesNotExist:
                raise ValueError("Invalid address")

            distance = DeliveryService.estimate_distance(address)

            delivery_fee = DeliveryService.calculate_fee(distance)

        subtotal = 0

        order = Order.objects.create(
            user=user,
            delivery_fee=delivery_fee,
            total_amount=0,
            delivery_type=delivery_type,
            address=address
        )

        for item in items:

            product = Product.objects.select_for_update().get(id=item.product_id)

            if product.stock < item.quantity:
                raise ValueError(
                    f"Insufficient stock for {product.name}"
                )

            line_total = (
                product.price * item.quantity
            )

            subtotal += line_total

            OrderItem.objects.create(
                order=order,
                product_name=product.name,
                product_price=product.price,
                quantity=item.quantity,
                subtotal=line_total
            )

            # safe stock reduction
            product.stock -= item.quantity
            product.save()

        total_amount = subtotal + delivery_fee

        order.total_amount = total_amount
        order.save()

        # clear cart
        cart.items.all().delete()

        return order