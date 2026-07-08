from django.db import transaction

from .models import Order, OrderItem
from .delivery import DeliveryService

from apps.cart.models import Cart
from apps.addresses.models import Address


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
            .select_related(
                "variant",
                "variant__product"
                )
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
            address=address,
            
            status=Order.STATUS_PENDING,
            payment_status=Order.PAYMENT_PENDING,
        )

        for item in items:

            variant = item.variant

            if variant.stock < item.quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"{variant.product.name} "
                    f"({variant.name})"
                )

            line_total = (
                variant.price * item.quantity
            )

            subtotal += line_total

            OrderItem.objects.create(
                order=order,
                product_name=variant.product.name,
                variant_name=variant.name,
                unit_price=variant.price,
                quantity=item.quantity,
                subtotal=line_total
            )

            # safe stock reduction
            variant.stock -= item.quantity
            variant.save()

        order.subtotal = subtotal
        order.total_amount = subtotal + delivery_fee
        order.save()

        # clear cart
        cart.items.all().delete()

        return order