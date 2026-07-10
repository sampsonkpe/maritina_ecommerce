from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)
from .delivery import DeliveryService

from apps.cart.models import Cart
from apps.addresses.models import Address

from apps.common.constants import (
    DELIVERY,
    STATUS_PENDING,
    PAYMENT_PENDING,
    STATUS_DELIVERED,
    PAYMENT_PAID,
    ORDER_STATUS_TRANSITIONS,
)


class OrderService:

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(
        user,
        delivery_type="DELIVERY",
        address_id=None,
    ):

        cart = Cart.objects.select_for_update().get(user=user)

        items = (
            cart.items
            .select_related(
                "variant",
                "variant__product",
            )
            .select_for_update()
        )

        if not items.exists():
            raise ValueError("Cart is empty")

        address = None
        delivery_fee = 0

        if delivery_type == DELIVERY:

            if not address_id:
                raise ValueError("Address is required")

            try:
                address = Address.objects.get(
                    id=address_id,
                    user=user,
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
            status=STATUS_PENDING,
            payment_status=PAYMENT_PENDING,
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
                subtotal=line_total,
            )

            variant.stock -= item.quantity
            variant.save()

        order.subtotal = subtotal
        order.total_amount = subtotal + delivery_fee
        order.save()

        cart.items.all().delete()

        return order
    
    @staticmethod
    def list_user_orders(user):

        return (
            Order.objects
            .filter(user=user)
            .order_by("-created_at")
        )

    @staticmethod
    def list_admin_orders(
        status_filter=None,
        delivery_filter=None,
        search=None,
    ):

        orders = Order.objects.all()

        if status_filter:
            orders = orders.filter(
                status=status_filter
            )

        if delivery_filter:
            orders = orders.filter(
                delivery_type=delivery_filter
            )

        if search:

            search_query = (
                Q(user__email__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__phone__icontains=search)
            )

            if search.isdigit():
                search_query |= Q(id=int(search))

            orders = orders.filter(search_query)

        return orders.order_by("-created_at")

    @staticmethod
    def update_order_status(
        order_id,
        new_status,
        updated_by,
    ):

        order = get_object_or_404(
            Order,
            id=order_id,
        )

        if new_status not in ORDER_STATUS_TRANSITIONS.get(
            order.status,
            [],
        ):
            raise ValueError(
                f"Cannot move Order#{order.id} "
                f"from {order.status} "
                f"to {new_status}"
            )

        if (
            new_status == STATUS_DELIVERED
            and order.payment_status != PAYMENT_PAID
        ):
            raise ValueError(
                "Cannot mark an unpaid order as delivered."
            )

        OrderStatusHistory.objects.create(
            order=order,
            old_status=order.status,
            new_status=new_status,
            updated_by=updated_by,
        )

        order.status = new_status
        order.save()

        return order